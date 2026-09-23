/**
 * Global Error Handler Middleware
 * Catches and formats all errors consistently
 */

const { AppError } = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  // Log error with request ID
  console.error(`[${req.id}] Error:`, {
    message: err.message,
    code: err.code || 'UNKNOWN',
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    userId: req.userId,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: messages,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      code: 'INVALID_ID',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
      code: 'DUPLICATE_KEY',
      statusCode: 409,
      field,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  // Default to 500 internal server error
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message,
    code: 'INTERNAL_ERROR',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
