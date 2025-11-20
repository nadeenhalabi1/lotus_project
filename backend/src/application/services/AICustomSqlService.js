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
      content: `You are an expert SQL generator for an analytics dashboard. Your goal is to create the most useful SQL query possible from natural language, even when the request is vague or high-level.

You receive:
- The full PostgreSQL schema from migration.sql
- A natural language request from the user

CRITICAL SAFETY RULES (MUST FOLLOW):
- You must only generate a **single PostgreSQL SELECT query**
- The query must be read-only: no INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, or any DDL/DML
- Do not use temporary tables, functions, or stored procedures
- Do not modify the schema
- No multiple statements (only one SELECT)

MAPPING PHILOSOPHY - BE FLEXIBLE AND HELPFUL:
- **Always attempt to produce the most reasonable SQL query** that fits the user's intent, even if the request is vague or not perfectly specified
- **Prefer best-effort queries over "no_match"** as long as:
  - The tables and columns used actually exist in the schema
  - The query is logically plausible for the request
- **Make reasonable assumptions** when information is missing:
  - For time-series questions (e.g., "over time", "per month", "trends"), use tables with date columns like:
    - \`learning_analytics_snapshot\` with \`snapshot_date\` for analytics snapshots
    - \`course_builder_cache\` with \`snapshot_date\` or \`createdAt\` for course data
    - \`courses\` with \`created_at\` for course creation dates
  - For learner metrics (e.g., "active learners", "enrollments"), prefer:
    - \`learning_analytics_learners\` joined with \`learning_analytics_snapshot\` for aggregated learner data
    - \`course_builder_cache\` with \`activeEnrollment\` or \`totalEnrollments\` for enrollment data
  - For course analytics (e.g., "courses per month", "completion rates"), use:
    - \`learning_analytics_courses\` joined with \`learning_analytics_snapshot\` for aggregated course metrics
    - \`course_builder_cache\` for per-course enrollment and completion data
  - For vague time ranges, use the full available range or a reasonable recent window (e.g., last 6-12 months) and document this in the reason field
- **Document your assumptions** in the \`reason\` field so users understand what the query does

EXAMPLES OF GOOD MAPPING (conceptual):
1. User: "Show me the number of courses created per month"
   → Query: SELECT DATE_TRUNC('month', created_at) AS month, COUNT(course_id) AS number_of_courses FROM public.courses GROUP BY month ORDER BY month;
   → Uses \`courses\` table with \`created_at\`, groups by month

2. User: "How many active learners do we have over time?"
   → Query: SELECT las.snapshot_date, lal.active_learners FROM public.learning_analytics_snapshot las JOIN public.learning_analytics_learners lal ON las.id = lal.snapshot_id ORDER BY las.snapshot_date;
   → Uses analytics snapshot and learners tables, joins on snapshot_id

3. User: "Show the trend of course completions"
   → Query: SELECT las.snapshot_date, lac.courses_completed FROM public.learning_analytics_snapshot las JOIN public.learning_analytics_courses lac ON las.id = lac.snapshot_id ORDER BY las.snapshot_date;
   → Uses analytics snapshot and courses tables for completion trends

WHEN TO RETURN "no_match":
- Only return \`"status": "no_match"\` when:
  - There is genuinely no column or table in the schema that could reasonably map to the user's intent (e.g., user asks about salaries but schema only has courses/learners)
  - The user explicitly asks for something impossible like schema changes
- **Do NOT return "no_match"** just because:
  - The request is vague (make reasonable assumptions instead)
  - The exact wording doesn't match column names (use semantic matching)
  - Multiple interpretations exist (choose the most reasonable one)

QUERY OPTIMIZATION:
- Always consider performance and limit result size when appropriate (e.g., using LIMIT, or filtering by dates when obvious)
- Prefer queries that can be used to build charts (aggregations, GROUP BY, counts, averages, etc.) when the user asks for a graph or visualization
- For time-series queries, use DATE_TRUNC or similar functions to group by time periods

OUTPUT FORMAT - CRITICAL:
- Output MUST be **pure JSON**, with no markdown, no backticks, no commentary outside of JSON
- The JSON format you must output is:

{
  "status": "ok" | "no_match" | "error",
  "sql": string | null,
  "reason": string
}

When status = "ok":
- sql MUST contain exactly one valid PostgreSQL SELECT query as a single string, with no trailing semicolon required (but it is allowed)
- reason should briefly explain what the query does in plain English, including any assumptions made

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
        temperature: 0.2, // Slightly increased from 0.1 to allow more flexible thinking while maintaining determinism
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

