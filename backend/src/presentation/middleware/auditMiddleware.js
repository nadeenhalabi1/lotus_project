import { auditLogger } from '../../infrastructure/services/AuditLogger.js';

/**
 * Audit Middleware
 * Logs all requests for audit purposes
 */
export const auditMiddleware = (req, res, next) => {
  // Log request start
  const startTime = Date.now();

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;

    // Log the request
    if (req.user) {
      auditLogger.log({
        type: 'user_action',
        level: res.statusCode >= 400 ? 'WARN' : 'INFO',
        userId: req.user.userId,
        action: `${req.method.toLowerCase()}_${req.path.replace(/\//g, '_')}`,
        resource: req.path,
        status: res.statusCode >= 400 ? 'failure' : 'success',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: {
          method: req.method,
          statusCode: res.statusCode,
          duration: `${duration}ms`
        }
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

