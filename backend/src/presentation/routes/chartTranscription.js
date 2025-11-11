import { Router } from 'express';
import { getTranscriptionRow, upsertTranscription } from '../../infrastructure/repositories/ChartTranscriptionsRepository.js';
import { computeChartSignature } from '../../utils/hash.js';
import chartNarrationService from '../../application/services/ChartNarrationService.js';

console.debug('[AI] chartTranscription route loaded. Signature function OK.');

const router = Router();

/**
 * GET /api/v1/ai/chart-transcription/:chartId
 * DB-first: Returns transcription from DB only (no OpenAI call)
 */
router.get('/chart-transcription/:chartId', async (req, res) => {
  try {
    const { chartId } = req.params;
    
    if (!chartId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'chartId is required' 
      });
    }

    const row = await getTranscriptionRow(chartId);
    
    if (!row) {
      return res.status(404).json({ 
        ok: false, 
        error: 'No transcription found' 
      });
    }

    res.json({ 
      ok: true, 
      data: { 
        chartId: row.chart_id, 
        text: row.transcription_text, 
        updatedAt: row.updated_at 
      } 
    });
  } catch (err) {
    console.error('Get transcription error:', err);
    res.status(500).json({ 
      ok: false, 
      error: err?.message || 'DB error' 
    });
  }
});

/**
 * POST /api/v1/ai/chart-transcription/ensure
 * Startup flow: Only runs OpenAI if missing or signature changed/expired
 * body: { chartId: string, topic?: string, chartData: any, imageUrl?: string, dataUrl?: string }
 */
router.post('/chart-transcription/ensure', async (req, res) => {
  try {
    const { chartId, topic, chartData, imageUrl, dataUrl } = req.body || {};
    const image = imageUrl || dataUrl;
    
    if (!chartId || !image) {
      return res.status(400).json({ 
        ok: false, 
        error: 'chartId and imageUrl/dataUrl are required' 
      });
    }

    // Validate image format
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return res.status(400).json({ 
        ok: false, 
        error: 'imageUrl must be a valid HTTP/HTTPS URL' 
      });
    }

    if (dataUrl && !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ 
        ok: false, 
        error: 'dataUrl must be a valid data URL (data:image/...)' 
      });
    }

    const signature = computeChartSignature(topic, chartData);
    const row = await getTranscriptionRow(chartId);

    // Check if we need to run OpenAI
    const isExpired = row && row.expires_at && new Date(row.expires_at) < new Date();
    const needRun = !row || row.chart_signature !== signature || isExpired;

    if (!needRun) {
      // Return existing from DB
      return res.json({ 
        ok: true, 
        source: 'db', 
        chartId, 
        signature: row.chart_signature, 
        text: row.transcription_text 
      });
    }

    // Generate new transcription via OpenAI
    const model = 'gpt-4o';
    const text = await chartNarrationService.describeChartImage(image, {
      context: topic,
      model
    });

    // Save to DB (upsert - overwrites existing)
    await upsertTranscription({ chartId, signature, model, text });

    res.json({ 
      ok: true, 
      source: 'ai', 
      chartId, 
      signature, 
      text 
    });
  } catch (err) {
    console.error('Ensure transcription error:', err);
    res.status(500).json({ 
      ok: false, 
      error: err?.message || 'AI/DB error' 
    });
  }
});

/**
 * POST /api/v1/ai/chart-transcription/refresh
 * Refresh/Morning flow: Always runs OpenAI and overwrites DB
 * body: { chartId: string, topic?: string, chartData: any, imageUrl?: string, dataUrl?: string }
 */
router.post('/chart-transcription/refresh', async (req, res) => {
  try {
    const { chartId, topic, chartData, imageUrl, dataUrl } = req.body || {};
    const image = imageUrl || dataUrl;
    
    if (!chartId || !image) {
      return res.status(400).json({ 
        ok: false, 
        error: 'chartId and imageUrl/dataUrl are required' 
      });
    }

    // Validate image format
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return res.status(400).json({ 
        ok: false, 
        error: 'imageUrl must be a valid HTTP/HTTPS URL' 
      });
    }

    if (dataUrl && !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ 
        ok: false, 
        error: 'dataUrl must be a valid data URL (data:image/...)' 
      });
    }

    const signature = computeChartSignature(topic, chartData);

    // Always generate new transcription via OpenAI
    const model = 'gpt-4o';
    const text = await chartNarrationService.describeChartImage(image, {
      context: topic,
      model
    });

    // Save to DB (upsert - overwrites existing)
    await upsertTranscription({ chartId, signature, model, text });

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

