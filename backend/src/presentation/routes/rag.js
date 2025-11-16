import { Router } from 'express';
import { fetchAiReportConclusionsForLast24Hours } from '../../infrastructure/db/aiReportConclusionsRepository.js';

const router = Router();

/**
 * POST /api/fill-content-metrics
 * Endpoint for RAG microservice to fetch AI report conclusions from last 24 hours
 * 
 * NEW Request body (JSON string or parsed object):
 * {
 *   "requester_service": "RAG",
 *   "payload": {},
 *   "response": {
 *     "entries": []
 *   }
 * }
 * 
 * NEW Response (JSON string):
 * {
 *   "entries": [
 *     {
 *       "report_name": "...",
 *       "generated_at": "...",
 *       "conclusions": {...}
 *     }
 *   ]
 * }
 */
router.post('/fill-content-metrics', async (req, res) => {
  try {
    // 1. Normalize and parse body (supports JSON string OR parsed object)
    let body;
    if (typeof req.body === "string") {
      try {
        body = JSON.parse(req.body);
      } catch (err) {
        console.error("[RAG Route] Invalid JSON string in body:", err.message);
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    } else {
      body = req.body || {};
    }

    const requester = body.requester_service || "RAG";
    const payload = body.payload ?? {};
    const responseTemplate = body.response ?? { entries: [] };

    // Optionally log requester
    console.log(`[RAG Route] Request from ${requester}`);

    // 2. Fetch entries from the last 24 hours
    const entries = await fetchAiReportConclusionsForLast24Hours();

    // 3. Build response payload: { entries: [...] }
    const responsePayloadObject = { entries };
    const responseJsonString = JSON.stringify(responsePayloadObject);

    // 4. Return JSON string as the response body
    return res
      .type("application/json")
      .send(responseJsonString);
  } catch (err) {
    console.error("[RAG Route] Internal error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
