import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dashboardRoutes from './presentation/routes/dashboard.js';
import reportsRoutes from './presentation/routes/reports.js';
import dataRoutes from './presentation/routes/data.js';
import openaiRoutes from './presentation/routes/openai.js';
import chartTranscriptionRoutes from './presentation/routes/chartTranscription.js';
import healthRoutes from './presentation/routes/health.js';
import { errorHandler } from './presentation/middleware/errorHandler.js';
import { auditMiddleware } from './presentation/middleware/auditMiddleware.js';
import { securityConfig } from './config/security.js';
import { rateLimiter } from './presentation/middleware/rateLimiter.js';
import { initializeJobs } from './infrastructure/jobs/index.js';
import runMigration from '../scripts/runMigration.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - Required for Railway/Render and other reverse proxies
// This allows express-rate-limit to correctly identify users by IP
app.set('trust proxy', 1);

// Security Headers Middleware
app.use((req, res, next) => {
  Object.entries(securityConfig.securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

// Middleware
app.use(cors(securityConfig.cors));

// JSON body parser with error handling
app.use(express.json({ 
  limit: '50mb', // Increased limit for chart images (8 charts with base64 can be large)
  verify: (req, res, buf, encoding) => {
    // Log request size for debugging
    if (req.url.includes('/chart-transcription')) {
      console.log(`[BodyParser] Request size: ${buf.length} bytes (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
    }
  }
}));

// Error handler for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[BodyParser] ❌ JSON parsing error:', err.message);
    console.error('[BodyParser] Request URL:', req.url);
    console.error('[BodyParser] Request size:', req.headers['content-length'] || 'unknown');
    return res.status(400).json({ ok: false, error: 'Invalid JSON in request body', details: err.message });
  }
  next(err);
});

app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increased limit for chart images
app.use(rateLimiter); // Rate limiting
app.use(auditMiddleware); // Audit logging for all requests

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'management-reporting'
  });
});

// API Routes
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/data', dataRoutes);
app.use('/api/v1/openai', openaiRoutes);
app.use('/api/v1/ai', chartTranscriptionRoutes);
app.use('/api/v1/health', healthRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // ⚠️ CRITICAL: Run initialization in background - don't block server startup
  // Railway healthcheck needs server to respond immediately
  (async () => {
    try {
      // Run database migration (if DATABASE_URL is set) - non-blocking
      await runMigration();
    } catch (migrationErr) {
      console.error('[Startup] Migration error (non-fatal):', migrationErr.message);
    }
    
    // Test database connection on boot - non-blocking
    if (process.env.DATABASE_URL) {
      try {
        const { healthCheck } = await import('./infrastructure/db/pool.js');
        const health = await healthCheck();
        if (health.ok) {
          console.log('[DB] ✅ Database connection healthy');
        } else {
          console.error('[DB] ❌ Database connection failed:', health.error);
        }
      } catch (err) {
        console.error('[DB] ❌ Database health check error:', err.message);
      }
      
      // ⚠️ CRITICAL: Check and fix permissions for ai_chart_transcriptions
      // Supabase tables created via migration may be read-only
      try {
        const { checkAndFixPermissions } = await import('../../scripts/checkAndFixPermissions.js');
        await checkAndFixPermissions();
      } catch (permErr) {
        console.error('[Startup] Permissions check error (non-fatal):', permErr.message);
        // Don't block startup - permissions can be fixed manually
      }
    }
    
    // Initialize scheduled jobs (async - loads initial mock data in development) - non-blocking
    try {
      await initializeJobs();
    } catch (jobsErr) {
      console.error('[Startup] Jobs initialization error (non-fatal):', jobsErr.message);
    }
  })();
});

export default app;

