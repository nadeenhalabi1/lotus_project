const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  // Skip authentication in development/production if no token provided
  if (!token) {
    // For Railway deployment, allow requests without authentication
    req.user = { role: 'administrator', id: 'railway-user' };
    return next();
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Verify administrator role
    if (user.role !== 'administrator') {
      return res.status(403).json({ error: 'Administrator access required' });
    }
    
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;

