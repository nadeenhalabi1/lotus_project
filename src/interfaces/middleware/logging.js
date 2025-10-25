const loggingMiddleware = (logger) => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Log request
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - start;
      
      logger.info(`${req.method} ${req.path} - ${res.statusCode}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      
      originalEnd.apply(this, args);
    };
    
    next();
  };
};

module.exports = loggingMiddleware;

