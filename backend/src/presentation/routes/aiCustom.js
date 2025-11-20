import { Router } from 'express';
import { AICustomSqlService } from '../../application/services/AICustomSqlService.js';

const router = Router();

// Initialize service (will throw if OPENAI_KEY is missing)
let aiCustomSqlService;
try {
  aiCustomSqlService = new AICustomSqlService();
} catch (error) {
  console.error('[aiCustom route] ❌ Failed to initialize AICustomSqlService:', error.message);
  console.error('[aiCustom route] ⚠️  AI Custom SQL endpoint will not be available');
}

/**
 * POST /api/ai-custom/sql
 * Generates a SQL query from natural language using OpenAI.
 * 
 * Request body:
 * {
 *   "queryText": string (required, 1-1000 characters)
 * }
 * 
 * Response (200 OK):
 * {
 *   "status": "ok" | "no_match" | "error",
 *   "sql": string | null,
 *   "reason": string,
 *   "message"?: string (for no_match status)
 * }
 */
router.post('/sql', async (req, res) => {
  try {
    // Check if service is available
    if (!aiCustomSqlService) {
      return res.status(503).json({
        status: 'error',
        error: 'SERVICE_UNAVAILABLE',
        message: 'AI Custom SQL service is not available. OPENAI_KEY may be missing.'
      });
    }

    // Validate request body
    const { queryText } = req.body || {};

    if (!queryText || typeof queryText !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: 'INVALID_INPUT',
        message: 'queryText must be a non-empty string up to 1000 characters.'
      });
    }

    const trimmedText = queryText.trim();

    if (trimmedText.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'INVALID_INPUT',
        message: 'queryText must be a non-empty string up to 1000 characters.'
      });
    }

    if (trimmedText.length > 1000) {
      return res.status(400).json({
        status: 'error',
        error: 'INVALID_INPUT',
        message: 'queryText must not exceed 1000 characters.'
      });
    }

    // Log request (truncated for privacy)
    console.log('[aiCustom/sql] 📥 Request received, queryText length:', trimmedText.length);

    // Generate SQL using OpenAI
    const result = await aiCustomSqlService.generateSqlWithOpenAi(trimmedText);

    // Handle different statuses
    if (result.status === 'ok' && result.sql && result.sql.trim().length > 0) {
      console.log('[aiCustom/sql] ✅ SQL generated successfully, length:', result.sql.length);
      return res.status(200).json({
        status: 'ok',
        sql: result.sql,
        reason: result.reason
      });
    }

    if (result.status === 'no_match') {
      console.log('[aiCustom/sql] ⚠️  No match found for user request');
      return res.status(200).json({
        status: 'no_match',
        message: result.reason || 'No matching tables or columns found for your request.'
      });
    }

    // Error status
    console.error('[aiCustom/sql] ❌ Error generating SQL:', result.reason);
    return res.status(500).json({
      status: 'error',
      error: 'OPENAI_SQL_GENERATION_FAILED',
      message: result.reason || 'Failed to generate SQL for this request.'
    });
  } catch (error) {
    console.error('[aiCustom/sql] ❌ Unexpected error:', error.message);
    console.error('[aiCustom/sql] Stack:', error.stack);
    
    return res.status(500).json({
      status: 'error',
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while processing your request.'
    });
  }
});

export default router;

