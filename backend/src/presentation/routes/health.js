import { Router } from 'express';
import { healthCheck } from '../../infrastructure/db/pool.js';

const router = Router();

/**
 * GET /api/v1/health/db
 * Health check endpoint for database connectivity
 */
router.get('/db', async (_req, res) => {
  try {
    const result = await healthCheck();
    if (result.ok) {
      return res.json({ ok: true, message: 'Database connection healthy' });
    } else {
      return res.status(503).json({ ok: false, error: result.error });
    }
  } catch (err) {
    return res.status(503).json({ ok: false, error: err?.message || 'Health check failed' });
  }
});

export default router;

