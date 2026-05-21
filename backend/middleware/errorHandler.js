// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error('Server error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// 404 handler
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
