/**
 * Centralized error-handling middleware for Express
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`💥 [Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
