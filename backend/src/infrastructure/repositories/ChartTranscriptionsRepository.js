// ESM module (no CommonJS)
import { getPool, withRetry } from '../db/pool.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('[ChartTranscriptionsRepository] Missing DATABASE_URL env');
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
 * Find by chart_id (alias for compatibility)
 */
export async function findByChartId(chartId) {
  return await getTranscriptionByChartId(chartId);
}

/**
 * Get by chart_id only (no signature)
 */
export async function getTranscriptionByChartId(chartId) {
  console.log(`[getTranscriptionByChartId] 🔍 Starting query for ${chartId}...`);
  
  if (!DATABASE_URL) {
    console.error(`[getTranscriptionByChartId] ❌ DATABASE_URL not available for ${chartId}`);
    throw new Error('DATABASE_URL not available');
  }
  
  try {
    const pool = getPool();
    
    // Use retry with backoff for transient errors
    const result = await withRetry(async () => {
      return await pool.query(
        `SELECT chart_id, chart_signature, model, transcription_text, created_at, updated_at 
         FROM ai_chart_transcriptions 
         WHERE chart_id = $1 
         LIMIT 1`,
        [chartId]
      );
    }, 3);
    
    console.log(`[getTranscriptionByChartId] ✅ Query executed for ${chartId}, rows: ${result.rows.length}`);
    
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
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  } catch (err) {
    console.error(`[getTranscriptionByChartId] ❌ CRITICAL Database error for ${chartId}:`, {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      name: err.name,
      stack: err.stack
    });
    
    // Check if table doesn't exist
    if (err.code === '42P01') {
      console.error(`[getTranscriptionByChartId] Table 'ai_chart_transcriptions' does not exist! Run migration first.`);
      throw new Error('Database table does not exist. Please run migration.');
    }
    
    // Check if connection error
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message?.includes('connection')) {
      console.error(`[getTranscriptionByChartId] ❌ Connection error for ${chartId}:`, err.message);
      throw new Error(`Database connection error: ${err.message}`);
    }
    
    throw new Error(`Database error: ${err.message}`);
  }
}

/**
 * Upsert and return the saved row (new API contract)
 * Always returns the row after saving to DB
 * ⚠️ CRITICAL: If read-back fails, return the data from the INSERT result instead
 */
export async function upsertAndReturn({ chartId, signature, model = 'gpt-4o-mini', text }) {
  // Save to DB first
  const savedText = await upsertTranscription({ chartId, signature, model, text });
  
  // Try to read back from DB to get full row with timestamps
  // If read-back fails, use the data we just saved
  try {
    const row = await getTranscriptionByChartId(chartId);
    if (row) {
      return {
        chart_id: row.chart_id,
        chart_signature: row.chart_signature,
        model: row.model,
        transcription_text: row.transcription_text,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString()
      };
    }
  } catch (readErr) {
    // If read-back fails, don't fail the whole operation - return what we know
    console.warn(`[upsertAndReturn] Could not read back from DB for ${chartId}, using saved data:`, readErr.message);
  }
  
  // Fallback: return data from what we just saved
  return {
    chart_id: chartId,
    chart_signature: signature,
    model: model,
    transcription_text: savedText || text,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Upsert explicit (newer API - accepts object)
 * Saves transcription to DB - DB is the single source of truth
 * No caching, no local storage - everything is managed in DB
 */
export async function upsertTranscription({ chartId, signature, model = 'gpt-4o-mini', text }) {
  // ⚠️ CRITICAL: Check DATABASE_URL availability
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  if (!chartId) {
    throw new Error('chartId is required');
  }
  
  if (!text || !text.trim()) {
    // Allow empty text to be saved (might be valid in some cases)
  }
  
  try {
    const pool = getPool();
    
    // Prepare safe parameters - ensure they're strings and not null/undefined
    const safeChartId = String(chartId || '').trim();
    const safeSignature = String(signature || '').trim();
    const safeModel = String(model || 'gpt-4o-mini').trim();
    const safeText = String(text || '').trim();
    
    if (!safeChartId) {
      throw new Error('chartId is required and cannot be empty');
    }
    
    // ⚠️ CRITICAL: Execute INSERT query directly - no blocking checks
    // The query itself will fail if table doesn't exist or connection is bad
    const query = `INSERT INTO ai_chart_transcriptions 
       (chart_id, chart_signature, model, transcription_text, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (chart_id) 
       DO UPDATE SET 
         chart_signature = EXCLUDED.chart_signature,
         model = EXCLUDED.model,
         transcription_text = EXCLUDED.transcription_text,
         updated_at = NOW()
       RETURNING chart_id, chart_signature, model, transcription_text, created_at, updated_at`;
    
    // Use retry with backoff for transient errors
    const result = await withRetry(async () => {
      return await pool.query(query, [safeChartId, safeSignature, safeModel, safeText]);
    }, 3);
    
    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0].transcription_text;
    } else {
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
 * Simple upsert - only chartId and text (for new workflow)
 * updated_at is automatically updated by trigger
 * RETURNS the actual saved row from DB to verify the write succeeded
 */
export async function upsertTranscriptionSimple({ chartId, text }) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not available');
  }
  
  if (!chartId) {
    throw new Error('chartId is required');
  }
  
  if (!text || !text.trim()) {
    throw new Error('text is required');
  }
  
  try {
    const pool = getPool();
    const safeChartId = String(chartId || '').trim();
    const safeText = String(text || '').trim();
    const safeSignature = ''; // Empty signature for new workflow (no data change tracking)
    const safeModel = 'gpt-4o-mini'; // Default model
    
    console.log(`[DB] ========================================`);
    console.log(`[DB] 💾 ATTEMPTING TO SAVE to ai_chart_transcriptions...`);
    console.log(`[DB] chart_id: "${safeChartId}"`);
    console.log(`[DB] transcription_text length: ${safeText.length} chars`);
    console.log(`[DB] transcription_text preview: ${safeText.substring(0, 100)}...`);
    
    const query = `INSERT INTO ai_chart_transcriptions 
       (chart_id, chart_signature, model, transcription_text, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (chart_id) 
       DO UPDATE SET 
         transcription_text = EXCLUDED.transcription_text,
         updated_at = NOW()
       RETURNING chart_id, transcription_text, updated_at`;
    
    const result = await withRetry(async () => {
      return await pool.query(query, [safeChartId, safeSignature, safeModel, safeText]);
    }, 3);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error('UPSERT query returned no rows - write may have failed');
    }
    
    const savedRow = result.rows[0];
    
    console.log(`[DB] ✅ UPSERT query completed`);
    console.log(`[DB] Returned chart_id: ${savedRow.chart_id}`);
    console.log(`[DB] Returned updated_at: ${savedRow.updated_at}`);
    
    // 🔍 CRITICAL VERIFICATION: Read back from DB to PROVE the write succeeded
    console.log(`[DB] 🔍 VERIFYING: Reading back from DB...`);
    const verifyQuery = `SELECT chart_id, transcription_text, updated_at 
                         FROM ai_chart_transcriptions 
                         WHERE chart_id = $1`;
    const verifyResult = await pool.query(verifyQuery, [safeChartId]);
    
    if (!verifyResult.rows || verifyResult.rows.length === 0) {
      console.error(`[DB] ❌❌❌ VERIFICATION FAILED! Row not found in DB after UPSERT!`);
      throw new Error(`Verification failed: Row for ${safeChartId} not found in DB after write`);
    }
    
    const verifiedRow = verifyResult.rows[0];
    const textMatches = verifiedRow.transcription_text === safeText;
    
    console.log(`[DB] 🔍 VERIFICATION RESULT:`);
    console.log(`[DB] chart_id: ${verifiedRow.chart_id}`);
    console.log(`[DB] transcription_text length: ${verifiedRow.transcription_text?.length || 0} chars`);
    console.log(`[DB] transcription_text preview: ${verifiedRow.transcription_text?.substring(0, 100)}...`);
    console.log(`[DB] updated_at: ${verifiedRow.updated_at}`);
    console.log(`[DB] Text matches what we wrote: ${textMatches}`);
    
    if (!textMatches) {
      console.error(`[DB] ❌❌❌ TEXT MISMATCH!`);
      console.error(`[DB] Expected length: ${safeText.length}`);
      console.error(`[DB] Actual length: ${verifiedRow.transcription_text?.length || 0}`);
      throw new Error(`Text mismatch: DB contains different text than what we wrote`);
    }
    
    console.log(`[DB] ✅✅✅ SUCCESS! Transcription VERIFIED in DB`);
    console.log(`[DB] ========================================`);
    
    return {
      success: true,
      chartId: verifiedRow.chart_id,
      transcriptionText: verifiedRow.transcription_text,
      updatedAt: verifiedRow.updated_at
    };
  } catch (err) {
    console.error('[upsertTranscriptionSimple] ❌ Database error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      chartId
    });
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

