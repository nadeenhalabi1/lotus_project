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
 * Query params (optional):
 * - topic: Chart topic/context for signature verification
 * - chartData: JSON string of chart data for signature verification
 * 
 * If topic and chartData are provided, signature is verified.
 * If signature doesn't match, returns 404 to trigger new transcription creation.
 */
router.get('/chart-transcription/:chartId', async (req, res) => {
  const chartId = req.params.chartId;
  const { topic, chartData } = req.query;
  
  try {
    console.log(`[GET /chart-transcription/${chartId}] Request received`);
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error(`[GET /chart-transcription/${chartId}] DATABASE_URL not available`);
      return res.status(503).json({ 
        ok: false, 
        error: 'Database service unavailable' 
      });
    }
    
    console.log(`[GET /chart-transcription/${chartId}] Querying database (DB-only, no cache)...`);
    const row = await getTranscriptionByChartId(chartId);
    
    if (!row) {
      console.log(`[GET /chart-transcription/${chartId}] No transcription found in DB (404)`);
      return res.status(404).json({ 
        ok: false, 
        error: 'No transcription in database' 
      });
    }
    
    // If topic and chartData are provided, verify signature matches current data
    if (topic !== undefined && chartData !== undefined) {
      try {
        const currentSignature = computeChartSignature(
          topic, 
          typeof chartData === 'string' ? JSON.parse(chartData) : chartData
        );
        const storedSignature = row.chart_signature;
        
        if (currentSignature !== storedSignature) {
          console.log(`[GET /chart-transcription/${chartId}] ⚠️ Signature mismatch!`);
          console.log(`[GET /chart-transcription/${chartId}] Current signature: ${currentSignature.substring(0, 16)}...`);
          console.log(`[GET /chart-transcription/${chartId}] Stored signature: ${storedSignature?.substring(0, 16) || 'null'}...`);
          console.log(`[GET /chart-transcription/${chartId}] Chart data has changed - transcription is outdated`);
          
          // Return 404 to indicate transcription needs to be regenerated
          return res.status(404).json({ 
            ok: false, 
            error: 'Transcription outdated - data has changed',
            signatureMismatch: true,
            currentSignature: currentSignature.substring(0, 16) + '...',
            storedSignature: storedSignature?.substring(0, 16) + '...' || 'null'
          });
        } else {
          console.log(`[GET /chart-transcription/${chartId}] ✅ Signature matches - transcription is up to date`);
        }
      } catch (err) {
        console.warn(`[GET /chart-transcription/${chartId}] Error verifying signature:`, err.message);
        // Continue anyway - return transcription even if signature check fails
      }
    }
    
    console.log(`[GET /chart-transcription/${chartId}] Transcription found in DB, text length: ${row.transcription_text?.length || 0}`);
    // Return transcription directly from DB - DB is the single source of truth
    res.json({ 
      ok: true, 
      data: { 
        chartId: row.chart_id, 
        text: row.transcription_text, // Direct from DB, no modification
        updatedAt: row.updated_at,
        signature: row.chart_signature?.substring(0, 16) + '...' // For debugging
      } 
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
      ok: false, 
      error: err?.message || 'DB error',
      chartId: chartId,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
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
 * Refresh/Morning flow: Always runs OpenAI and overwrites DB
 * body: { chartId: string, topic?: string, chartData: any, imageUrl: string }
 */
router.post('/chart-transcription/refresh', async (req, res) => {
  try {
    const { chartId, topic, chartData, imageUrl } = req.body || {};
    
    if (!chartId || !imageUrl) {
      return res.status(400).json({ 
        ok: false, 
        error: 'chartId and imageUrl are required' 
      });
    }

    const signature = computeChartSignature(topic, chartData);
    // Generate new transcription via OpenAI
    const text = await transcribeChartImage({ imageUrl, context: topic });
    // Save to DB - DB is the single source of truth (overwrites existing)
    await upsertTranscription({ chartId, signature, text, model: 'gpt-4o' });

    res.json({ 
      ok: true, 
      source: 'ai', 
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

