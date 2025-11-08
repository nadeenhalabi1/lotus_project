import jwt from 'jsonwebtoken';
import { auditLogger } from '../../infrastructure/services/AuditLogger.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Allow test token in development OR if ALLOW_TEST_TOKEN is set (for MVP)
    const allowTestToken = process.env.NODE_ENV === 'development' || process.env.ALLOW_TEST_TOKEN === 'true';
    
    if (allowTestToken) {
      if (authHeader === 'Bearer test-token-for-local-development') {
        req.user = {
          userId: 'test-admin-user',
          sub: 'test-admin-user',
          role: 'System Administrator',
          email: 'test@educoreai.com'
        };
        return next();
      }
    }
    
    // For MVP: Allow requests without token (skip authentication)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Set default user for MVP (no authentication required)
      req.user = {
        userId: 'mvp-user',
        sub: 'mvp-user',
        role: 'System Administrator',
        email: 'mvp@educoreai.com'
      };
      return next();
    }

    const token = authHeader.substring(7);
    
    // Allow test token in development OR if ALLOW_TEST_TOKEN is set (for MVP)
    if (allowTestToken && token === 'test-token-for-local-development') {
      req.user = {
        userId: 'test-admin-user',
        sub: 'test-admin-user',
        role: 'System Administrator',
        email: 'test@educoreai.com'
      };
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Log successful authentication
    auditLogger.logTokenValidation(decoded.userId || decoded.sub, 'success');

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      auditLogger.logTokenValidation(null, 'failure', {
        reason: 'token_expired',
        ipAddress: req.ip
      });
      return res.status(401).json({ error: 'Token expired' });
    }
    
    auditLogger.logTokenValidation(null, 'failure', {
      reason: 'invalid_token',
      error: error.message,
      ipAddress: req.ip
    });
    return res.status(401).json({ error: 'Invalid token' });
  }
};

