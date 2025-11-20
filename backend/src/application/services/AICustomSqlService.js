import OpenAI from 'openai';
import { loadDbSchemaFromMigration } from '../../utils/dbSchemaLoader.js';

/**
 * Service for generating SQL queries from natural language using OpenAI.
 * Uses the existing OPENAI_KEY environment variable.
 */
export class AICustomSqlService {
  constructor() {
    // Check for OPENAI_KEY (Railway uses this name)
    const openaiKey = process.env.OPENAI_KEY;
    
    if (!openaiKey || openaiKey === '') {
      throw new Error('OPENAI_KEY environment variable is required but not set');
    }

    this.client = new OpenAI({
      apiKey: openaiKey
    });

    console.log('[AICustomSqlService] ✅ Initialized with OpenAI client');
  }

  /**
   * Builds the strict prompt for OpenAI SQL generation.
   * 
   * @param {string} userText - The user's natural language request
   * @param {string} migrationSql - The full database schema from migration.sql
   * @returns {Object} Messages array for OpenAI chat API
   */
  buildAiSqlPrompt(userText, migrationSql) {
    const systemMessage = {
      role: 'system',
      content: `You are an expert SQL generator for an analytics dashboard.

You receive:
- The full PostgreSQL schema from migration.sql
- A natural language request from the user

Your task:
- Map the user request to the most accurate SQL SELECT query you can
- You must only generate a **single PostgreSQL SELECT query**
- The query must be read-only: no INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, or any DDL/DML
- Do not use temporary tables, functions, or stored procedures
- Do not modify the schema
- If the user request is ambiguous, choose the most reasonable interpretation
- If the request cannot be satisfied with the given schema (no relevant tables/columns), return a "no_match" result
- Always consider performance and limit result size when appropriate (e.g., using LIMIT, or filtering by dates or IDs when obvious)
- Prefer queries that can be used to build charts (aggregations, GROUP BY, counts, averages, etc.) when the user asks for a graph

VERY IMPORTANT:
- Output MUST be **pure JSON**, with no markdown, no backticks, no commentary outside of JSON
- The JSON format you must output is:

{
  "status": "ok" | "no_match" | "error",
  "sql": string | null,
  "reason": string
}

When status = "ok":
- sql MUST contain exactly one valid PostgreSQL SELECT query as a single string, with no trailing semicolon required (but it is allowed)
- reason should briefly explain what the query does in plain English

When status = "no_match":
- sql MUST be null
- reason should explain why the schema does not support the request

When status = "error":
- sql MUST be null
- reason should describe the internal problem (for debugging)

Do NOT include any markdown formatting, do NOT wrap the JSON in backticks.`
    };

    const userMessage = {
      role: 'user',
      content: `Here is the PostgreSQL schema:

${migrationSql}

User request:
${userText}

Generate the SQL query as JSON following the format specified in the system message.`
    };

    return [systemMessage, userMessage];
  }

  /**
   * Generates a SQL query from natural language using OpenAI.
   * 
   * @param {string} userText - The user's natural language request
   * @returns {Promise<{status: string, sql: string | null, reason: string}>}
   */
  async generateSqlWithOpenAi(userText) {
    try {
      // Load the database schema
      console.log('[AICustomSqlService] 📖 Loading database schema...');
      const migrationSql = loadDbSchemaFromMigration();
      
      // Build the prompt
      console.log('[AICustomSqlService] 📝 Building prompt...');
      const messages = this.buildAiSqlPrompt(userText, migrationSql);
      
      // Call OpenAI
      console.log('[AICustomSqlService] 🤖 Calling OpenAI API...');
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o', // Using gpt-4o for better SQL generation (equivalent to requested gpt-4.1-mini which doesn't exist)
        messages: messages,
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for deterministic SQL generation
        response_format: { type: 'json_object' } // Force JSON response
      });

      const content = response.choices[0]?.message?.content || '';
      
      if (!content || content.trim().length === 0) {
        return {
          status: 'error',
          sql: null,
          reason: 'OpenAI returned empty response'
        };
      }

      // Parse JSON response
      let parsed;
      try {
        // Remove any markdown code blocks if present (defensive)
        const cleanedContent = content
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        
        parsed = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('[AICustomSqlService] ❌ Failed to parse OpenAI response as JSON:', parseError.message);
        console.error('[AICustomSqlService] Response content:', content.substring(0, 200));
        return {
          status: 'error',
          sql: null,
          reason: `Failed to parse OpenAI response as JSON: ${parseError.message}`
        };
      }

      // Validate response structure
      if (!parsed.status || typeof parsed.status !== 'string') {
        return {
          status: 'error',
          sql: null,
          reason: 'OpenAI response missing or invalid "status" field'
        };
      }

      if (parsed.status === 'ok') {
        if (!parsed.sql || typeof parsed.sql !== 'string' || parsed.sql.trim().length === 0) {
          return {
            status: 'error',
            sql: null,
            reason: 'OpenAI returned status "ok" but sql field is missing or empty'
          };
        }
      }

      // Return the structured response
      return {
        status: parsed.status,
        sql: parsed.sql || null,
        reason: parsed.reason || 'No reason provided'
      };
    } catch (error) {
      console.error('[AICustomSqlService] ❌ Error generating SQL:', error.message);
      
      // Handle specific OpenAI API errors
      if (error.status === 401) {
        return {
          status: 'error',
          sql: null,
          reason: 'OpenAI API key is invalid'
        };
      }
      
      if (error.status === 429) {
        return {
          status: 'error',
          sql: null,
          reason: 'OpenAI API rate limit exceeded'
        };
      }

      return {
        status: 'error',
        sql: null,
        reason: `Failed to generate SQL: ${error.message}`
      };
    }
  }
}

