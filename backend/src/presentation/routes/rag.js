import { Router } from 'express';
import { fetchAiReportConclusionsForLast24Hours } from '../../infrastructure/db/aiReportConclusionsRepository.js';

const router = Router();

/**
 * POST /api/fill-content-metrics
 * Endpoint for RAG microservice to fetch AI report conclusions from last 24 hours
 * 
 * Request body:
 * {
 *   "requester_service": "RAG",
 *   "payload": "{\"entries\":[]}"
 * }
 * 
 * Response:
 * {
 *   "requester_service": "RAG",
 *   "payload": "{\"entries\":[...]}"
 * }
 */
router.post('/fill-content-metrics', async (req, res) => {
  try {
    const { requester_service, payload } = req.body || {};

    // 1. Basic validation
    if (!payload || typeof payload !== 'string') {
      return res.status(400).json({ 
        ok: false,
        error: 'payload must be a JSON string' 
      });
    }

    const requester = requester_service || 'RAG';

    // 2. Try to parse the original payload (should be {"entries":[]})
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payload);
    } catch (e) {
      return res.status(400).json({ 
        ok: false,
        error: 'Invalid JSON in payload' 
      });
    }

    // parsedPayload.entries exists but we don't use it - we always load from DB

    // 3. Fetch data from DB for the last 24 hours
    const entries = await fetchAiReportConclusionsForLast24Hours();

    // 4. Build new payload
    const responsePayloadObject = { entries };
    const responsePayloadString = JSON.stringify(responsePayloadObject);

    // 5. Return response to RAG
    return res.json({
      requester_service: requester,
      payload: responsePayloadString
    });
  } catch (error) {
    console.error('[RAG] Error in /api/fill-content-metrics:', error);
    return res.status(500).json({ 
      ok: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;

