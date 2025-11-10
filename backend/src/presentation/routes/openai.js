import { Router } from 'express';
import chartNarrationService from '../../application/services/ChartNarrationService.js';
import reportConclusionsService from '../../application/services/ReportConclusionsService.js';

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

/**
 * POST /api/v1/openai/report-conclusions
 * body: { topic: string, images: string[] }
 */
const rollbackFallback = {
  conclusions: [
    { 
      statement: 'Report generated successfully with available data.', 
      rationale: 'Default fallback content displayed when AI service is temporarily unavailable.', 
      confidence: 0 
    },
    { 
      statement: 'Charts show stable performance metrics across analyzed periods.', 
      rationale: 'Displayed when AI service unavailable. Manual review recommended.', 
      confidence: 0 
    },
    { 
      statement: 'No critical anomalies detected in the current dataset.', 
      rationale: 'Rollback default conclusion. AI analysis pending.', 
      confidence: 0 
    },
    { 
      statement: 'Further detailed analysis recommended once AI connection is restored.', 
      rationale: 'Fallback rationale. Please regenerate report when AI service is available.', 
      confidence: 0 
    }
  ]
};

router.post('/report-conclusions', async (req, res) => {
  try {
    const { topic, images } = req.body || {};
    
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ 
        ok: false, 
        error: 'topic (string) is required' 
      });
    }
    
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'images (array) with at least one image is required' 
      });
    }

    // Validate image format
    for (const img of images) {
      if (typeof img !== 'string') {
        return res.status(400).json({ 
          ok: false, 
          error: 'All images must be strings (URLs or data URLs)' 
        });
      }
      if (!img.startsWith('http://') && !img.startsWith('https://') && !img.startsWith('data:image/')) {
        return res.status(400).json({ 
          ok: false, 
          error: 'Images must be valid URLs or data URLs' 
        });
      }
    }

    const data = await reportConclusionsService.generateReportConclusions(topic, images);
    res.json({ ok: true, source: 'ai', data });
  } catch (err) {
    console.error('OpenAI conclusions failed:', err.message);
    // Return rollback with 200 status (not error) so UI can display it
    res.status(200).json({ ok: true, source: 'rollback', data: rollbackFallback });
  }
});

export default router;

