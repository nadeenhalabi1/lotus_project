import { Router } from 'express';
import chartNarrationService from '../../application/services/ChartNarrationService.js';

const router = Router();

/**
 * POST /api/v1/openai/describe-chart
 * body: { imageUrl?: string, dataUrl?: string, context?: string, fast?: boolean }
 */
router.post('/describe-chart', async (req, res) => {
  try {
    const { imageUrl, dataUrl, context, fast } = req.body || {};
    const image = imageUrl || dataUrl;
    
    if (!image) {
      return res.status(400).json({ 
        ok: false, 
        error: 'imageUrl or dataUrl is required' 
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

    const text = await chartNarrationService.describeChartImage(image, {
      context,
      model: fast ? 'gpt-4o-mini' : undefined
    });

    res.json({ ok: true, text });
  } catch (err) {
    console.error('describe-chart error:', err);
    res.status(500).json({ 
      ok: false, 
      error: err?.message || 'AI error' 
    });
  }
});

export default router;

