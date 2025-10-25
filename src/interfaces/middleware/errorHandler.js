const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error
  let error = {
    message: 'Internal Server Error',
    status: 500
  };
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  }
  
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = err.message;
    error.status = 400;
  }
  
  // Custom errors
  if (err.status) {
    error.status = err.status;
    error.message = err.message;
  }
  
  res.status(error.status).json({
    error: error.message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

module.exports = errorHandler;

