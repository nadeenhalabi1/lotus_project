import { Router } from 'express';
import { getTranscriptionByChartId, upsertTranscription } from '../../infrastructure/repositories/ChartTranscriptionsRepository.js';
import { computeChartSignature } from '../../utils/chartSignature.js';
import { transcribeChartImage } from '../../application/services/transcribeChartService.js';

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
    const row = await getTranscriptionByChartId(chartId);
    
    if (!row) {
      console.log(`[GET /chart-transcription/${chartId}] No transcription found in DB - returning 200 {exists: false}`);
      // ⚠️ Return 200 with exists:false instead of 404 to prevent error spam
      return res.status(200).json({ 
        exists: false,
        transcription_text: null,
        chartId
      });
    }
    
    console.log(`[GET /chart-transcription/${chartId}] Transcription found in DB, text length: ${row.transcription_text?.length || 0}`);
    // Return transcription directly from DB - DB is the single source of truth
    res.status(200).json({ 
      exists: true,
      transcription_text: row.transcription_text, // Direct from DB, no modification
      chartId: row.chart_id
    });
  } catch (err) {
    // Log full error details for debugging
    console.error(`[GET /chart-transcription/${chartId}] Error:`, {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    
    // Return 500 with error message
    res.status(500).json({ 
      exists: false,
      transcription_text: null,
      chartId,
      error: err?.message || 'DB error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

/**
 * POST /api/v1/ai/chart-transcription/:chartId
 * Get-or-create: If transcription exists, return it. Otherwise, create via OpenAI and save to DB.
 * body: { topic?: string, chartData?: any, imageUrl: string }
 * 
 * Response format:
 * - If existed: { created: false, chartId: string, transcription_text: string }
 * - If created: { created: true, chartId: string, transcription_text: string }
 */
router.post('/chart-transcription/:chartId', async (req, res) => {
  const chartId = req.params.chartId;
  const { topic, chartData, imageUrl } = req.body || {};
  
  try {
    console.log(`[POST /chart-transcription/${chartId}] Get-or-create request received`);
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error(`[POST /chart-transcription/${chartId}] DATABASE_URL not available`);
      return res.status(503).json({ 
        created: false,
        chartId,
        transcription_text: null,
        error: 'Database service unavailable' 
      });
    }
    
    if (!imageUrl) {
      return res.status(400).json({ 
        created: false,
        chartId,
        transcription_text: null,
        error: 'imageUrl is required' 
      });
    }
    
    // Check if transcription already exists
    const existing = await getTranscriptionByChartId(chartId);
    if (existing) {
      console.log(`[POST /chart-transcription/${chartId}] Transcription exists - returning existing`);
      return res.status(200).json({
        created: false,
        chartId,
        transcription_text: existing.transcription_text
      });
    }
    
    // Create new transcription via OpenAI
    console.log(`[POST /chart-transcription/${chartId}] Creating new transcription via OpenAI...`);
    const signature = computeChartSignature(topic || '', chartData || {});
    const transcription_text = await transcribeChartImage({ imageUrl, context: topic });
    
    // Save to DB
    await upsertTranscription({ chartId, signature, text: transcription_text, model: 'gpt-4o' });
    console.log(`[POST /chart-transcription/${chartId}] Transcription created and saved to DB`);
    
    return res.status(201).json({
      created: true,
      chartId,
      transcription_text
    });
  } catch (err) {
    console.error(`[POST /chart-transcription/${chartId}] Error:`, {
      message: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      created: false,
      chartId,
      transcription_text: null,
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
    const { charts } = req.body || {};
    
    if (!Array.isArray(charts)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'charts[] required' 
      });
    }

    console.log(`[startup-fill] Processing ${charts.length} charts...`);
    const results = [];
    
    for (const c of charts) {
      const { chartId, topic, chartData, imageUrl } = c || {};
      
      if (!chartId || !imageUrl) {
        results.push({ chartId, status: 'skip-invalid' });
        continue;
      }

      try {
        const signature = computeChartSignature(topic, chartData);
        
        // Try to get existing transcription (may fail if table doesn't exist - that's OK)
        let existing = null;
        try {
          existing = await getTranscriptionByChartId(chartId);
        } catch (err) {
          console.warn(`[startup-fill] Could not check existing for ${chartId}:`, err.message);
          // Continue anyway - will create new transcription
        }

        // If exists and signature matches, skip OpenAI call
        if (existing && existing.chart_signature === signature) {
          console.log(`[startup-fill] Chart ${chartId} already exists with matching signature`);
          results.push({ chartId, status: 'from-db', signature });
          continue;
        }

        // Generate new transcription via OpenAI and save to DB
        console.log(`[startup-fill] Generating transcription for ${chartId} via OpenAI...`);
        const text = await transcribeChartImage({ imageUrl, context: topic });
        // Save to DB - DB is the single source of truth
        await upsertTranscription({ chartId, signature, text, model: 'gpt-4o' });
        console.log(`[startup-fill] Chart ${chartId} transcription saved to DB successfully`);
        results.push({ chartId, status: 'updated', signature });
      } catch (err) {
        console.error(`[startup-fill] Error for chart ${chartId}:`, {
          message: err.message,
          stack: err.stack
        });
        results.push({ chartId, status: 'error', error: err.message });
      }
    }

    console.log(`[startup-fill] Completed: ${results.length} charts processed`);
    res.json({ ok: true, results });
  } catch (err) {
    console.error('[startup-fill] Fatal error:', err);
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
    const { chartId, topic, chartData, imageUrl, force } = req.body || {};
    
    if (!chartId || !imageUrl) {
      return res.status(400).json({ 
        ok: false, 
        error: 'chartId and imageUrl are required' 
      });
    }

    // If force=true, always generate new transcription (ignore signature check)
    // This is used when user explicitly clicks "Refresh Data" - we want new transcription for new data
    if (force) {
      console.log(`[refresh] Chart ${chartId} force=true - generating new transcription regardless of signature`);
      // Generate new transcription via OpenAI
      const signature = computeChartSignature(topic || '', chartData || {});
      const text = await transcribeChartImage({ imageUrl, context: topic });
      // Save to DB - DB is the single source of truth (overwrites existing)
      await upsertTranscription({ chartId, signature, text, model: 'gpt-4o' });
      
      return res.json({ 
        ok: true, 
        source: 'ai', // From OpenAI
        chartId, 
        signature, 
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
    const text = await transcribeChartImage({ imageUrl, context: topic });
    // Save to DB - DB is the single source of truth (overwrites existing)
    await upsertTranscription({ chartId, signature, text, model: 'gpt-4o' });

    res.json({ 
      ok: true, 
      source: 'ai', // From OpenAI
      chartId, 
      signature, 
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

