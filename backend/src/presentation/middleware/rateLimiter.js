import rateLimit from 'express-rate-limit';
import { securityConfig } from '../../config/security.js';

/**
 * Rate Limiting Middleware
 * Prevents API abuse and ensures fair resource usage
 * More lenient in development mode
 */
export const rateLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => {
    // In development, be more lenient
    if (process.env.NODE_ENV === 'development') {
      return false; // Still apply, but with higher limit
    }
    return req.path === '/health';
  },
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(securityConfig.rateLimit.windowMs / 1000)
    });
  }
});

