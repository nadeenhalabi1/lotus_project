import { Router } from 'express';
import { findByChartId, upsertAndReturn } from '../../infrastructure/repositories/ChartTranscriptionsRepository.js';
import { computeChartSignature } from '../../utils/chartSignature.js';
import { transcribeChartImage } from '../../application/services/transcribeChartService.js';
import { openaiQueue } from '../../utils/openaiQueue.js';

console.debug('[AI] chartTranscription route loaded. Signature function OK.');
console.debug('[BOOT] DATABASE_URL available:', !!process.env.DATABASE_URL);

const router = Router();

/**
 * GET /api/v1/ai/chart-transcription/:chartId
 * Render flow: Returns transcription from DB only (no OpenAI call, no cache)
 * DB is the single source of truth for all transcriptions
 * 
 * ⚠️ NEVER returns 404 - always returns 200 with {exists: false} if not found
 * This prevents 404 spam in console and treats cache miss as normal flow
 * 
 * Response format:
 * - If exists: { exists: true, transcription_text: string, chartId: string }
 * - If not exists: { exists: false, transcription_text: null, chartId: string }
 */
router.get('/chart-transcription/:chartId', async (req, res) => {
  const chartId = req.params.chartId;
  
  try {
    console.log(`[GET /chart-transcription/${chartId}] Request received (no query params)`);
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error(`[GET /chart-transcription/${chartId}] DATABASE_URL not available`);
      return res.status(503).json({ 
        exists: false,
        transcription_text: null,
        chartId,
        error: 'Database service unavailable' 
      });
    }
    
    console.log(`[GET /chart-transcription/${chartId}] Querying database (DB-only, no cache)...`);
    const row = await findByChartId(chartId);
    
    // ⚠️ API Contract: Always return 200 with { chartId, exists, transcription_text }
    if (!row) {
      console.log(`[GET /chart-transcription/${chartId}] No transcription found in DB - returning 200 {exists: false}`);
      return res.status(200).json({ 
        chartId,
        exists: false,
        transcription_text: null
      });
    }
    
    console.log(`[GET /chart-transcription/${chartId}] Transcription found in DB, text length: ${row.transcription_text?.length || 0}`);
    // Return transcription directly from DB - DB is the single source of truth
    res.status(200).json({ 
      chartId: row.chart_id,
      exists: true,
      transcription_text: row.transcription_text
    });
  } catch (err) {
    // Log full error details for debugging
    console.error(`[GET /chart-transcription/${chartId}] ❌ CRITICAL Error:`, {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    
    // Check if it's a connection/timeout error - return 503 instead of 500
    const isConnectionError = /timeout|ECONNRESET|ETIMEDOUT|terminat|connection/i.test(err?.message || '');
    const statusCode = isConnectionError ? 503 : 500;
    
    // Return 503 for connection errors, 500 for other DB errors
    res.status(statusCode).json({ 
      exists: false,
      transcription_text: null,
      chartId,
      error: isConnectionError ? 'Database connection error' : (err?.message || 'DB error'),
      errorCode: err?.code,
      errorDetail: err?.detail,
      errorHint: err?.hint,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

/**
 * POST /api/v1/ai/chart-transcription/:chartId
 * Get-or-create / Update: Checks signature - if changed, calls OpenAI and updates DB.
 * body: { topic?: string, chartData?: any, imageUrl: string, model?: string }
 * 
 * Logic:
 * 1. Compute chart_signature from chartData
 * 2. Check if row exists by chart_id
 * 3. If no row → call OpenAI → save new transcription
 * 4. If row exists and signature matches → reuse existing (no OpenAI call)
 * 5. If signature differs → call OpenAI → update transcription_text, chart_signature, model, updated_at
 * 
 * Response format:
 * - If created: { created: true, updated: false, chartId, chart_signature, model, transcription_text }
 * - If reused: { created: false, updated: false, chartId, chart_signature, model, transcription_text }
 * - If updated: { created: false, updated: true, chartId, chart_signature, model, transcription_text }
 */
router.post('/chart-transcription/:chartId', async (req, res) => {
  const chartId = req.params.chartId;
  const { topic, chartData, imageUrl, model = 'gpt-4o-mini' } = req.body || {};
  
  try {
    console.log(`[POST /chart-transcription/${chartId}] Get-or-create/update request received`);
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error(`[POST /chart-transcription/${chartId}] DATABASE_URL not available`);
      return res.status(503).json({ 
        created: false,
        updated: false,
        chartId,
        transcription_text: null,
        error: 'Database service unavailable' 
      });
    }
    
    if (!imageUrl) {
      return res.status(400).json({ 
        created: false,
        updated: false,
        chartId,
        transcription_text: null,
        error: 'imageUrl is required' 
      });
    }
    
    // Compute signature from chartData (NOT from topic - topic is only for OpenAI context)
    const signature = computeChartSignature(topic || '', chartData || {});
    console.log(`[POST /chart-transcription/${chartId}] Computed signature: ${signature.substring(0, 8)}...`);
    
    // Check if transcription already exists
    const existing = await findByChartId(chartId);
    
    // If forceRecompute=false and signature matches → return existing without OpenAI call
    if (!forceRecompute && existing && existing.chart_signature === signature) {
      console.log(`[POST /chart-transcription/${chartId}] Signature matches, returning existing (no OpenAI call)`);
      return res.status(200).json({
        chartId: existing.chart_id,
        chart_signature: existing.chart_signature,
        model: existing.model || model,
        transcription_text: existing.transcription_text,
        updated_at: existing.updated_at
      });
    }
    
    // ⚠️ CRITICAL: Compress chartData before sending to OpenAI to reduce token usage
    let compressedChartData = chartData;
    if (Array.isArray(chartData) && chartData.length > 50) {
      compressedChartData = chartData.slice(0, 50);
      console.log(`[POST /chart-transcription/${chartId}] Compressed chartData from ${chartData.length} to 50 items`);
    } else if (chartData && typeof chartData === 'object' && Object.keys(chartData).length > 20) {
      const keys = Object.keys(chartData).slice(0, 20);
      compressedChartData = keys.reduce((acc, key) => {
        acc[key] = chartData[key];
        return acc;
      }, {});
      console.log(`[POST /chart-transcription/${chartId}] Compressed chartData from ${Object.keys(chartData).length} to 20 keys`);
    }
    
    // Call OpenAI to generate transcription
    // ⚠️ CRITICAL: Use queue to process OpenAI requests sequentially and prevent TPM limit
    console.log(`[POST /chart-transcription/${chartId}] 📞 Calling OpenAI to generate transcription (queued)...`);
    console.log(`[POST /chart-transcription/${chartId}] Image URL length: ${imageUrl?.length || 0}, Topic: ${topic || 'none'}`);
    
    const transcription_text = await openaiQueue.enqueue(async () => {
      return await transcribeChartImage({ imageUrl, context: topic });
    });
    
    console.log(`[POST /chart-transcription/${chartId}] ✅ OpenAI returned transcription (${transcription_text?.length || 0} chars)`);
    
    // 🔍 DEBUG: Log the actual transcription text (first 200 chars)
    if (transcription_text) {
      console.log(`[POST /chart-transcription/${chartId}] Transcription preview: ${transcription_text.substring(0, 200)}...`);
    }
    
    if (!transcription_text || !transcription_text.trim()) {
      return res.status(502).json({ 
        chartId,
        error: 'OpenAI returned empty transcription' 
      });
    }
    
    // Save to DB (UPSERT) and return the saved row
    console.log(`[POST /chart-transcription/${chartId}] 💾 Saving to DB (UPSERT)...`);
    const saved = await upsertAndReturn({
      chartId,
      signature,
      model,
      text: transcription_text
    });
    
    console.log(`[POST /chart-transcription/${chartId}] ✅ Saved to DB, returning row`);
    
    // Return the saved row (DB is the single source of truth)
    res.status(existing ? 200 : 201).json({
      chartId: saved.chart_id,
      chart_signature: saved.chart_signature,
      model: saved.model,
      transcription_text: saved.transcription_text,
      updated_at: saved.updated_at
    });
  } catch (err) {
    console.error(`[POST /chart-transcription/${chartId}] Error:`, {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    
    res.status(500).json({ 
      chartId,
      error: err?.message || 'AI/DB error'
    });
  }
});

/**
 * POST /api/v1/ai/chart-transcription/startup-fill
 * Startup ingest: For each chart, if no row exists OR signature changed → call OpenAI and upsert
 * body: { charts: [{ chartId, topic?, chartData, imageUrl }] }
 */
router.post('/chart-transcription/startup-fill', async (req, res) => {
  try {
    const { charts, force = false } = req.body || {};
    
    if (!Array.isArray(charts)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'charts[] required' 
      });
    }

    console.log(`[startup-fill] Processing ${charts.length} charts... (force=${force})`);
    const results = [];
    
    // ⚠️ CRITICAL: Process charts ONE AT A TIME (sequentially) to avoid rate limits
    // OpenAI has a limit of 30K tokens per minute, and multiple large images can exceed this
    // Each chart is processed: OpenAI call → Save to DB → Wait → Next chart
    console.log(`[startup-fill] ⚠️ Processing ${charts.length} charts SEQUENTIALLY (one at a time) to prevent OpenAI rate limits`);
    
    for (let i = 0; i < charts.length; i++) {
      const c = charts[i];
      
      // Add delay between charts to avoid rate limits (except for first chart)
      // Note: openaiQueue also adds delay, so total delay is ~2 seconds between charts
      if (i > 0) {
        const delayMs = 1000; // 1 second between charts (openaiQueue adds another 1s, total ~2s)
        console.log(`[startup-fill] ⏳ Waiting ${delayMs}ms before processing chart ${i + 1}/${charts.length} to avoid rate limits...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      console.log(`[startup-fill] 📊 Processing chart ${i + 1}/${charts.length}: ${c?.chartId || 'unknown'}`);
      const { chartId, topic, chartData, imageUrl, model = 'gpt-4o-mini' } = c || {};
      
      if (!chartId || !imageUrl) {
        results.push({ chartId, status: 'skip-invalid' });
        continue;
      }

      try {
        // 🔍 DEBUG: Log what we received
        console.log(`[startup-fill] Chart ${chartId} received data:`, {
          topic: topic || 'none',
          chartDataType: Array.isArray(chartData) ? 'array' : typeof chartData,
          chartDataLength: Array.isArray(chartData) 
            ? chartData.length 
            : (chartData && typeof chartData === 'object' ? Object.keys(chartData).length : 0),
          chartDataPreview: Array.isArray(chartData)
            ? JSON.stringify(chartData.slice(0, 2))
            : (chartData && typeof chartData === 'object' ? JSON.stringify(Object.keys(chartData).slice(0, 5)) : String(chartData).substring(0, 100))
        });
        
        const signature = computeChartSignature(topic, chartData);
        
        // 🔍 DEBUG: Log signature computation
        console.log(`[startup-fill] Chart ${chartId} computed signature:`, {
          signature: signature.substring(0, 32) + '...',
          signatureLength: signature.length,
          chartDataStringified: JSON.stringify(chartData).substring(0, 200)
        });
        
        // Try to get existing transcription (may fail if table doesn't exist - that's OK)
        let existing = null;
        try {
          existing = await getTranscriptionByChartId(chartId);
        } catch (err) {
          console.warn(`[startup-fill] Could not check existing for ${chartId}:`, err.message);
          // Continue anyway - will create new transcription
        }

        // 🔍 DEBUG: Log existing transcription status
        console.log(`[startup-fill] Chart ${chartId} existing transcription check:`, {
          exists: !!existing,
          existingSignature: existing?.chart_signature?.substring(0, 32) + '...',
          newSignature: signature?.substring(0, 32) + '...',
          signaturesMatch: existing?.chart_signature === signature,
          force: force
        });
        
        // ⚠️ CHANGED: If force=true, always call OpenAI (even if signature matches)
        // This ensures fresh transcriptions on first load and refresh
        // If force=false and signature matches, skip OpenAI call (data hasn't changed)
        if (!force && existing && existing.chart_signature === signature) {
          console.log(`[startup-fill] Chart ${chartId} already exists with matching signature - data unchanged, skipping OpenAI call (force=false)`);
          console.log(`[startup-fill] Chart ${chartId} Using existing transcription from DB (${existing.transcription_text?.length || 0} chars)`);
          results.push({ chartId, status: 'from-db', signature, transcription_text: existing.transcription_text });
          continue;
        }
        
        // 🔍 DEBUG: Will create/update transcription
        if (force) {
          console.log(`[startup-fill] Chart ${chartId} force=true - will generate new transcription via OpenAI (overwriting existing)`);
        } else if (existing) {
          console.log(`[startup-fill] Chart ${chartId} signature changed - will generate new transcription via OpenAI`);
        } else {
          console.log(`[startup-fill] Chart ${chartId} no existing transcription - will create new one via OpenAI`);
        }

        // ⚠️ CRITICAL: Compress chartData before sending to OpenAI to reduce token usage
        // Limit to first 50 data points or summarize if array is too large
        let compressedChartData = chartData;
        if (Array.isArray(chartData) && chartData.length > 50) {
          compressedChartData = chartData.slice(0, 50);
          console.log(`[startup-fill] Chart ${chartId} Compressed chartData from ${chartData.length} to 50 items to reduce tokens`);
        } else if (chartData && typeof chartData === 'object' && Object.keys(chartData).length > 20) {
          // If object, take only first 20 keys
          const keys = Object.keys(chartData).slice(0, 20);
          compressedChartData = keys.reduce((acc, key) => {
            acc[key] = chartData[key];
            return acc;
          }, {});
          console.log(`[startup-fill] Chart ${chartId} Compressed chartData from ${Object.keys(chartData).length} to 20 keys to reduce tokens`);
        }
        
        // Generate new transcription via OpenAI and save to DB
        // ⚠️ CRITICAL: Use queue to process OpenAI requests sequentially and prevent TPM limit
        // The queue ensures only ONE request at a time with delays between requests
        console.log(`[startup-fill] 📞 Calling OpenAI for ${chartId} (queued, sequential processing)...`);
        console.log(`[startup-fill] Chart ${chartId} Image URL length: ${imageUrl?.length || 0}, Topic: ${topic || 'none'}`);
        
        const text = await openaiQueue.enqueue(async () => {
          return await transcribeChartImage({ imageUrl, context: topic });
        });
        
        console.log(`[startup-fill] Chart ${chartId} ✅ OpenAI returned transcription (${text?.length || 0} chars)`);
        
        // 🔍 DEBUG: Log the actual transcription text (first 200 chars)
        if (text) {
          console.log(`[startup-fill] Chart ${chartId} Transcription preview: ${text.substring(0, 200)}...`);
        }
        
        if (!text || !text.trim()) {
          console.error(`[startup-fill] Chart ${chartId} ⚠️ WARNING: OpenAI returned empty transcription!`);
          console.error(`[startup-fill] Chart ${chartId} text value:`, text);
          results.push({ chartId, status: 'error', error: 'OpenAI returned empty transcription' });
          continue;
        }
        
        // 🔍 DEBUG: Verify we have all required data before DB save
        console.log(`[AI Save] [startup-fill] chartId: ${chartId}`);
        console.log(`[AI Save] [startup-fill] transcription_text length: ${text?.length || 0}`);
        console.log(`[AI Save] [startup-fill] signature: ${signature?.substring(0, 16)}...`);
        console.log(`[AI Save] [startup-fill] model: ${model}`);
        console.log(`[AI Save] [startup-fill] DATABASE_URL available: ${!!process.env.DATABASE_URL}`);
        
        // Save to DB - DB is the single source of truth
        console.log(`[startup-fill] Chart ${chartId} 💾 Saving transcription to DB...`);
        try {
          const savedText = await upsertTranscription({ chartId, signature, text, model });
          console.log(`[startup-fill] Chart ${chartId} ✅ Transcription saved to DB successfully`);
          console.log(`[startup-fill] Chart ${chartId} Saved text length: ${savedText?.length || 0}`);
          console.log(`[AI Save] ✅ Saved transcription to DB for ${chartId} (startup-fill)`);
          
          // Verify the transcription was saved by reading it back from DB
          try {
            const verify = await getTranscriptionByChartId(chartId);
            if (verify && verify.transcription_text === text) {
              console.log(`[startup-fill] Chart ${chartId} ✅ Verified: Transcription matches what was saved`);
            } else {
              console.error(`[startup-fill] Chart ${chartId} ⚠️ WARNING: Verification failed! DB text doesn't match saved text`);
              console.error(`[startup-fill] Chart ${chartId} Original text length: ${text?.length || 0}`);
              console.error(`[startup-fill] Chart ${chartId} DB text length: ${verify?.transcription_text?.length || 0}`);
            }
          } catch (verifyErr) {
            console.error(`[startup-fill] Chart ${chartId} ⚠️ Could not verify transcription in DB:`, verifyErr.message);
            console.error(`[startup-fill] Chart ${chartId} Verification error stack:`, verifyErr.stack);
          }
          
          results.push({ chartId, status: 'updated', signature });
        } catch (saveErr) {
          console.error(`[startup-fill] Chart ${chartId} ❌ CRITICAL: Failed to save transcription to DB:`, saveErr.message);
          console.error(`[startup-fill] Chart ${chartId} Save error code:`, saveErr.code);
          console.error(`[startup-fill] Chart ${chartId} Save error detail:`, saveErr.detail);
          console.error(`[startup-fill] Chart ${chartId} Save error hint:`, saveErr.hint);
          console.error(`[startup-fill] Chart ${chartId} Save error stack:`, saveErr.stack);
          results.push({ chartId, status: 'error', error: `Failed to save to DB: ${saveErr.message}` });
          // ⚠️ CRITICAL: Don't throw - continue with other charts, but log the error
          // The error is already logged above, and we want to process all charts
          // Don't throw saveErr - this would stop processing other charts
        }
      } catch (err) {
        console.error(`[startup-fill] Error for chart ${chartId}:`, {
          message: err.message,
          code: err.code,
          detail: err.detail,
          hint: err.hint,
          stack: err.stack
        });
        results.push({ chartId, status: 'error', error: err.message });
        // ⚠️ CRITICAL: Don't throw - continue with other charts
        // The error is already logged above
      }
    }

    console.log(`[startup-fill] Completed: ${results.length} charts processed`);
    console.log(`[startup-fill] Results summary:`, {
      total: results.length,
      updated: results.filter(r => r.status === 'updated').length,
      fromDb: results.filter(r => r.status === 'from-db').length,
      errors: results.filter(r => r.status === 'error').length,
      skipInvalid: results.filter(r => r.status === 'skip-invalid').length
    });
    
    // ⚠️ CRITICAL: Log any errors
    const errors = results.filter(r => r.status === 'error');
    if (errors.length > 0) {
      console.error(`[startup-fill] ⚠️ WARNING: ${errors.length} charts failed:`, errors);
    }
    
    res.json({ ok: true, results });
  } catch (err) {
    console.error('[startup-fill] Fatal error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      stack: err.stack
    });
    res.status(500).json({ 
      ok: false, 
      error: err?.message || 'AI/DB error' 
    });
  }
});

/**
 * POST /api/v1/ai/chart-transcription/refresh
 * Refresh flow: Checks if data changed (by signature), only calls OpenAI if data changed
 * body: { chartId: string, topic?: string, chartData: any, imageUrl: string, force?: boolean }
 * 
 * If force=true, always calls OpenAI (for explicit refresh requests)
 * If force=false or undefined, checks signature - only calls OpenAI if signature changed
 */
router.post('/chart-transcription/refresh', async (req, res) => {
  try {
    const { chartId, topic, chartData, imageUrl, force, model = 'gpt-4o-mini' } = req.body || {};
    
    if (!chartId || !imageUrl) {
      return res.status(400).json({ 
        ok: false, 
        error: 'chartId and imageUrl are required' 
      });
    }

    console.log(`[refresh] ========================================`);
    console.log(`[refresh] Chart ${chartId} refresh request received`);
    console.log(`[refresh] force=${force}, imageUrl length=${imageUrl?.length || 0}, topic=${topic || 'none'}`);
    console.log(`[refresh] DATABASE_URL available: ${!!process.env.DATABASE_URL}`);

    // If force=true, always generate new transcription (ignore signature check)
    // This is used when user explicitly clicks "Refresh Data" - we want new transcription for new data
    if (force) {
      console.log(`[refresh] Chart ${chartId} force=true - generating new transcription regardless of signature`);
      // Generate new transcription via OpenAI
      const signature = computeChartSignature(topic || '', chartData || {});
      console.log(`[refresh] Chart ${chartId} computed signature: ${signature.substring(0, 16)}...`);
      
      // ⚠️ CRITICAL: Compress chartData before sending to OpenAI to reduce token usage
      let compressedChartData = chartData;
      if (Array.isArray(chartData) && chartData.length > 50) {
        compressedChartData = chartData.slice(0, 50);
        console.log(`[refresh] Chart ${chartId} Compressed chartData from ${chartData.length} to 50 items`);
      } else if (chartData && typeof chartData === 'object' && Object.keys(chartData).length > 20) {
        const keys = Object.keys(chartData).slice(0, 20);
        compressedChartData = keys.reduce((acc, key) => {
          acc[key] = chartData[key];
          return acc;
        }, {});
        console.log(`[refresh] Chart ${chartId} Compressed chartData from ${Object.keys(chartData).length} to 20 keys`);
      }
      
      // ⚠️ CRITICAL: Use queue to process OpenAI requests sequentially and prevent TPM limit
      console.log(`[refresh] Chart ${chartId} 📞 Calling OpenAI to generate transcription (queued)...`);
      console.log(`[refresh] Chart ${chartId} Image URL length: ${imageUrl?.length || 0}, Topic: ${topic || 'none'}`);
      
      const text = await openaiQueue.enqueue(async () => {
        return await transcribeChartImage({ imageUrl, context: topic });
      });
      
      console.log(`[refresh] Chart ${chartId} ✅ OpenAI returned transcription (${text?.length || 0} chars)`);
      
      // 🔍 DEBUG: Log the actual transcription text (first 200 chars)
      if (text) {
        console.log(`[refresh] Chart ${chartId} Transcription preview: ${text.substring(0, 200)}...`);
      }
      
      if (!text || !text.trim()) {
        console.error(`[refresh] Chart ${chartId} ⚠️ WARNING: OpenAI returned empty transcription!`);
        console.error(`[refresh] Chart ${chartId} text value:`, text);
        throw new Error('OpenAI returned empty transcription');
      }
      
      // 🔍 DEBUG: Verify we have all required data before DB save
      console.log(`[AI Save] [refresh] chartId: ${chartId}`);
      console.log(`[AI Save] [refresh] transcription_text length: ${text?.length || 0}`);
      console.log(`[AI Save] [refresh] signature: ${signature?.substring(0, 16)}...`);
      console.log(`[AI Save] [refresh] model: ${model}`);
      console.log(`[AI Save] [refresh] DATABASE_URL available: ${!!process.env.DATABASE_URL}`);
      
      // Save to DB - DB is the single source of truth (overwrites existing)
      console.log(`[refresh] Chart ${chartId} 💾 Saving transcription to DB...`);
      try {
        const savedText = await upsertTranscription({ chartId, signature, text, model });
        console.log(`[refresh] Chart ${chartId} ✅ Transcription saved to DB successfully`);
        console.log(`[refresh] Chart ${chartId} Saved text length: ${savedText?.length || 0}`);
        console.log(`[AI Save] ✅ Saved transcription to DB for ${chartId} (refresh)`);
        
        // Verify the transcription was saved by reading it back from DB
        try {
          const verify = await getTranscriptionByChartId(chartId);
          if (verify && verify.transcription_text === text) {
            console.log(`[refresh] Chart ${chartId} ✅ Verified: Transcription matches what was saved`);
          } else {
            console.error(`[refresh] Chart ${chartId} ⚠️ WARNING: Verification failed! DB text doesn't match saved text`);
            console.error(`[refresh] Chart ${chartId} Original text length: ${text?.length || 0}`);
            console.error(`[refresh] Chart ${chartId} DB text length: ${verify?.transcription_text?.length || 0}`);
          }
        } catch (verifyErr) {
          console.error(`[refresh] Chart ${chartId} ⚠️ Could not verify transcription in DB:`, verifyErr.message);
          console.error(`[refresh] Chart ${chartId} Verification error stack:`, verifyErr.stack);
        }
      } catch (saveErr) {
        console.error(`[refresh] Chart ${chartId} ❌ CRITICAL: Failed to save transcription to DB:`, saveErr.message);
        console.error(`[refresh] Chart ${chartId} Save error stack:`, saveErr.stack);
        throw saveErr; // Re-throw to be caught by outer try-catch
      }
      
      return res.json({ 
        ok: true, 
        source: 'ai', // From OpenAI
        chartId, 
        signature, 
        model,
        text 
      });
    }
    
    // If force=false, check signature to see if data changed
    const signature = computeChartSignature(topic || '', chartData || {});
    
    try {
      const existing = await getTranscriptionByChartId(chartId);
      if (existing && existing.chart_signature === signature) {
        console.log(`[refresh] Chart ${chartId} data unchanged (signature matches) - using existing transcription`);
        return res.json({ 
          ok: true, 
          source: 'db', // From DB, no OpenAI call
          chartId, 
          signature, 
          model: existing.model || model,
          text: existing.transcription_text,
          unchanged: true
        });
      } else {
        console.log(`[refresh] Chart ${chartId} data changed (signature mismatch) - generating new transcription`);
      }
    } catch (err) {
      // If transcription doesn't exist, continue to create new one
      console.log(`[refresh] Chart ${chartId} has no existing transcription - will create new one`);
    }
    
    // Generate new transcription via OpenAI (data changed)
    // ⚠️ CRITICAL: Compress chartData before sending to OpenAI to reduce token usage
    let compressedChartData = chartData;
    if (Array.isArray(chartData) && chartData.length > 50) {
      compressedChartData = chartData.slice(0, 50);
      console.log(`[refresh] Chart ${chartId} Compressed chartData from ${chartData.length} to 50 items`);
    } else if (chartData && typeof chartData === 'object' && Object.keys(chartData).length > 20) {
      const keys = Object.keys(chartData).slice(0, 20);
      compressedChartData = keys.reduce((acc, key) => {
        acc[key] = chartData[key];
        return acc;
      }, {});
      console.log(`[refresh] Chart ${chartId} Compressed chartData from ${Object.keys(chartData).length} to 20 keys`);
    }
    
    // ⚠️ CRITICAL: Use queue to process OpenAI requests sequentially and prevent TPM limit
    console.log(`[refresh] Chart ${chartId} 📞 Calling OpenAI to generate transcription (queued)...`);
    console.log(`[refresh] Chart ${chartId} Image URL length: ${imageUrl?.length || 0}, Topic: ${topic || 'none'}`);
    
    const text = await openaiQueue.enqueue(async () => {
      return await transcribeChartImage({ imageUrl, context: topic });
    });
    
    console.log(`[refresh] Chart ${chartId} ✅ OpenAI returned transcription (${text?.length || 0} chars)`);
    
    // 🔍 DEBUG: Log the actual transcription text (first 200 chars)
    if (text) {
      console.log(`[refresh] Chart ${chartId} Transcription preview: ${text.substring(0, 200)}...`);
    }
    
    if (!text || !text.trim()) {
      console.error(`[refresh] Chart ${chartId} ⚠️ WARNING: OpenAI returned empty transcription!`);
      console.error(`[refresh] Chart ${chartId} text value:`, text);
      throw new Error('OpenAI returned empty transcription');
    }
    
    // 🔍 DEBUG: Verify we have all required data before DB save
    console.log(`[AI Save] [refresh] chartId: ${chartId}`);
    console.log(`[AI Save] [refresh] transcription_text length: ${text?.length || 0}`);
    console.log(`[AI Save] [refresh] signature: ${signature?.substring(0, 16)}...`);
    console.log(`[AI Save] [refresh] model: ${model}`);
    console.log(`[AI Save] [refresh] DATABASE_URL available: ${!!process.env.DATABASE_URL}`);
    
    // Save to DB - DB is the single source of truth (overwrites existing)
    console.log(`[refresh] Chart ${chartId} 💾 Saving transcription to DB...`);
    try {
      const savedText = await upsertTranscription({ chartId, signature, text, model });
      console.log(`[refresh] Chart ${chartId} ✅ Transcription saved to DB successfully`);
      console.log(`[refresh] Chart ${chartId} Saved text length: ${savedText?.length || 0}`);
      console.log(`[AI Save] ✅ Saved transcription to DB for ${chartId} (refresh)`);
      
      // Verify the transcription was saved by reading it back from DB
      try {
        const verify = await getTranscriptionByChartId(chartId);
        if (verify && verify.transcription_text === text) {
          console.log(`[refresh] Chart ${chartId} ✅ Verified: Transcription matches what was saved`);
        } else {
          console.error(`[refresh] Chart ${chartId} ⚠️ WARNING: Verification failed! DB text doesn't match saved text`);
          console.error(`[refresh] Chart ${chartId} Original text length: ${text?.length || 0}`);
          console.error(`[refresh] Chart ${chartId} DB text length: ${verify?.transcription_text?.length || 0}`);
        }
      } catch (verifyErr) {
        console.error(`[refresh] Chart ${chartId} ⚠️ Could not verify transcription in DB:`, verifyErr.message);
        console.error(`[refresh] Chart ${chartId} Verification error stack:`, verifyErr.stack);
      }
    } catch (saveErr) {
      console.error(`[refresh] Chart ${chartId} ❌ CRITICAL: Failed to save transcription to DB:`, saveErr.message);
      console.error(`[refresh] Chart ${chartId} Save error stack:`, saveErr.stack);
      throw saveErr; // Re-throw to be caught by outer try-catch
    }

    res.json({ 
      ok: true, 
      source: 'ai', // From OpenAI
      chartId, 
      signature, 
      model,
      text 
    });
  } catch (err) {
    console.error('Refresh transcription error:', err);
    res.status(500).json({ 
      ok: false, 
      error: err?.message || 'AI/DB error' 
    });
  }
});

export default router;

