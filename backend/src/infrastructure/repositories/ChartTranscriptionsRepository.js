// ESM module (no CommonJS)
import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('[ChartTranscriptionsRepository] Missing DATABASE_URL env');
}

// Connection pool for better performance
let pool = null;

function getPool() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Supabase/PostgreSQL
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });
    
    pool.on('error', (err) => {
      console.error('[ChartTranscriptionsRepository] Unexpected pool error:', err);
    });
    
    console.log('[ChartTranscriptionsRepository] Database pool created');
  }
  
  return pool;
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
  
  try {
    const result = await getPool().query(
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
    console.error('[getCachedTranscription] Database error:', {
      message: err.message,
      code: err.code,
      detail: err.detail
    });
    return null;
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
  
  try {
    await getPool().query(
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
    console.log(`[saveTranscription] Saved transcription for ${chartId}`);
  } catch (err) {
    console.error('[saveTranscription] Database error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    throw new Error(`Database error: ${err.message}`);
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
  
  try {
    const result = await getPool().query(
      `SELECT chart_id, chart_signature, transcription_text, updated_at 
       FROM ai_chart_transcriptions 
       WHERE chart_id = $1 
       LIMIT 1`,
      [chartId]
    );
    
    if (result.rows.length === 0) {
      console.log(`[getTranscriptionByChartId] No row found for ${chartId}`);
      return null;
    }
    
    const row = result.rows[0];
    console.log(`[getTranscriptionByChartId] Found transcription for ${chartId}, text length: ${row.transcription_text?.length || 0}`);
    return {
      chart_id: row.chart_id,
      chart_signature: row.chart_signature,
      transcription_text: row.transcription_text,
      updated_at: row.updated_at
    };
  } catch (err) {
    console.error(`[getTranscriptionByChartId] Database error for ${chartId}:`, {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    
    // Check if table doesn't exist
    if (err.code === '42P01') {
      console.error(`[getTranscriptionByChartId] Table 'ai_chart_transcriptions' does not exist! Run migration first.`);
      throw new Error('Database table does not exist. Please run migration.');
    }
    
    throw new Error(`Database error: ${err.message}`);
  }
}

/**
 * Upsert explicit (newer API - accepts object)
 * Saves transcription to DB - DB is the single source of truth
 * No caching, no local storage - everything is managed in DB
 */
export async function upsertTranscription({ chartId, signature, model = 'gpt-4o', text }) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  try {
    await getPool().query(
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
    console.log(`[upsertTranscription] Upserted transcription for ${chartId}`);
  } catch (err) {
    console.error('[upsertTranscription] Database error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    
    // Check if table doesn't exist
    if (err.code === '42P01') {
      console.error(`[upsertTranscription] Table 'ai_chart_transcriptions' does not exist! Run migration first.`);
      throw new Error('Database table does not exist. Please run migration.');
    }
    
    throw new Error(`Database error: ${err.message}`);
  }
}

/**
 * Optional: delete by chart
 */
export async function deleteTranscriptionByChartId(chartId) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  try {
    await getPool().query(
      `DELETE FROM ai_chart_transcriptions WHERE chart_id = $1`,
      [chartId]
    );
  } catch (err) {
    console.error('[deleteTranscriptionByChartId] Database error:', {
      message: err.message,
      code: err.code,
      detail: err.detail
    });
    throw new Error(`Database error: ${err.message}`);
  }
}

