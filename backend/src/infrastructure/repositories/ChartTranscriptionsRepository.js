// ESM module (no CommonJS)
import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('[ChartTranscriptionsRepository] Missing DATABASE_URL env');
}

// Helper to get database client
function getDbClient() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  return new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase/PostgreSQL
  });
}

// Export for compatibility (not used, but routes check it)
export const supabase = DATABASE_URL ? {} : null;

/* ----------------- EXACT NAMES REQUIRED BY ROUTES ----------------- */

/**
 * Return transcription text cached by chartId+signature, or null
 * Compatibility: "cached" by chartId+signature (matches old import name)
 */
export async function getCachedTranscription(chartId, signature) {
  if (!DATABASE_URL) {
    console.error('[getCachedTranscription] DATABASE_URL not available');
    return null;
  }
  
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query(
      `SELECT transcription_text, chart_signature 
       FROM ai_chart_transcriptions 
       WHERE chart_id = $1 AND chart_signature = $2 
       LIMIT 1`,
      [chartId, signature]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0].transcription_text || null;
  } catch (err) {
    console.error('[getCachedTranscription] Database error:', err.message);
    return null;
  } finally {
    await client.end();
  }
}

/**
 * Upsert transcription by chartId (overwrite existing row)
 * Compatibility: "saveTranscription" upserts by chart_id (matches old import name)
 * Note: Accepts 4 separate parameters (chartId, signature, model, text) for compatibility
 */
export async function saveTranscription(chartId, signature, model, text) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  const client = getDbClient();
  try {
    await client.connect();
    await client.query(
      `INSERT INTO ai_chart_transcriptions 
       (chart_id, chart_signature, model, transcription_text, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (chart_id) 
       DO UPDATE SET 
         chart_signature = EXCLUDED.chart_signature,
         model = EXCLUDED.model,
         transcription_text = EXCLUDED.transcription_text,
         updated_at = NOW()`,
      [chartId, signature, model || 'gpt-4o', text]
    );
  } catch (err) {
    console.error('[saveTranscription] Database error:', err.message);
    throw new Error(err.message);
  } finally {
    await client.end();
  }
}

/* ----------------- COMPAT NAMES (newer APIs) ----------------- */

/**
 * Get by chart_id only (no signature)
 */
export async function getTranscriptionByChartId(chartId) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query(
      `SELECT chart_id, chart_signature, transcription_text, updated_at 
       FROM ai_chart_transcriptions 
       WHERE chart_id = $1 
       LIMIT 1`,
      [chartId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      chart_id: row.chart_id,
      chart_signature: row.chart_signature,
      transcription_text: row.transcription_text,
      updated_at: row.updated_at
    };
  } catch (err) {
    console.error(`[getTranscriptionByChartId] Database error for ${chartId}:`, err.message);
    throw new Error(`Database error: ${err.message}`);
  } finally {
    await client.end();
  }
}

/**
 * Upsert explicit (newer API - accepts object)
 */
export async function upsertTranscription({ chartId, signature, model = 'gpt-4o', text }) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  const client = getDbClient();
  try {
    await client.connect();
    await client.query(
      `INSERT INTO ai_chart_transcriptions 
       (chart_id, chart_signature, model, transcription_text, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (chart_id) 
       DO UPDATE SET 
         chart_signature = EXCLUDED.chart_signature,
         model = EXCLUDED.model,
         transcription_text = EXCLUDED.transcription_text,
         updated_at = NOW()`,
      [chartId, signature, model, text]
    );
  } catch (err) {
    console.error('[upsertTranscription] Database error:', err.message);
    throw new Error(err.message);
  } finally {
    await client.end();
  }
}

/**
 * Optional: delete by chart
 */
export async function deleteTranscriptionByChartId(chartId) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  const client = getDbClient();
  try {
    await client.connect();
    await client.query(
      `DELETE FROM ai_chart_transcriptions WHERE chart_id = $1`,
      [chartId]
    );
  } catch (err) {
    console.error('[deleteTranscriptionByChartId] Database error:', err.message);
    throw new Error(err.message);
  } finally {
    await client.end();
  }
}

