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
      `SELECT chart_id, chart_signature, model, transcription_text, updated_at 
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
      model: row.model,
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
    console.error(`[upsertTranscription] ❌ DATABASE_URL not available for chartId: ${chartId}`);
    throw new Error('DATABASE_URL not available');
  }
  
  if (!chartId) {
    console.error(`[upsertTranscription] ❌ chartId is required`);
    throw new Error('chartId is required');
  }
  
  if (!text || !text.trim()) {
    console.warn(`[upsertTranscription] ⚠️ Warning: Empty transcription text for ${chartId}`);
    // Don't throw - allow empty text to be saved (might be valid in some cases)
  }
  
  try {
    console.log(`[upsertTranscription] 🔄 Attempting to upsert transcription for ${chartId}...`);
    console.log(`[upsertTranscription] Signature: ${signature?.substring(0, 8)}..., Model: ${model}, Text length: ${text?.length || 0}`);
    
    const pool = getPool();
    if (!pool) {
      throw new Error('Database pool not available');
    }
    
    const result = await pool.query(
      `INSERT INTO ai_chart_transcriptions 
       (chart_id, chart_signature, model, transcription_text, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (chart_id) 
       DO UPDATE SET 
         chart_signature = EXCLUDED.chart_signature,
         model = EXCLUDED.model,
         transcription_text = EXCLUDED.transcription_text,
         updated_at = NOW()
       RETURNING chart_id, updated_at, transcription_text`,
      [chartId, signature || '', model, text || '']
    );
    
    if (result && result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      console.log(`[upsertTranscription] ✅ Successfully upserted transcription for ${chartId}`);
      console.log(`[upsertTranscription] Updated at: ${row.updated_at}, Text length in DB: ${row.transcription_text?.length || 0}`);
      
      // Verify the text was actually saved
      if (row.transcription_text !== text) {
        console.error(`[upsertTranscription] ⚠️ WARNING: Text mismatch! Sent ${text?.length || 0} chars, but DB has ${row.transcription_text?.length || 0} chars`);
        console.error(`[upsertTranscription] First 100 chars sent: ${text?.substring(0, 100)}`);
        console.error(`[upsertTranscription] First 100 chars in DB: ${row.transcription_text?.substring(0, 100)}`);
      } else {
        console.log(`[upsertTranscription] ✅ Verified: Text matches what was saved`);
      }
      
      // Return the saved transcription text for verification
      return row.transcription_text;
    } else {
      console.error(`[upsertTranscription] ⚠️ CRITICAL: No rows returned from upsert for ${chartId}!`);
      console.error(`[upsertTranscription] Result object:`, result);
      throw new Error(`Failed to save transcription to DB - no rows returned`);
    }
  } catch (err) {
    console.error('[upsertTranscription] ❌ Database error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      chartId,
      signature: signature?.substring(0, 8),
      stack: err.stack
    });
    
    // Check if table doesn't exist
    if (err.code === '42P01') {
      console.error(`[upsertTranscription] Table 'ai_chart_transcriptions' does not exist! Run migration first.`);
      throw new Error('Database table does not exist. Please run migration.');
    }
    
    // Re-throw the error so it can be caught by the calling code
    throw err;
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

