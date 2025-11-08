import jwt from 'jsonwebtoken';
import { auditLogger } from '../../infrastructure/services/AuditLogger.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // In development, allow test token
    if (process.env.NODE_ENV === 'development') {
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
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      auditLogger.logSecurityEvent('invalid_token_format', 'warn', {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // In development, allow test token
    if (process.env.NODE_ENV === 'development' && token === 'test-token-for-local-development') {
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

