/**
 * Request ID Middleware
 * Generates unique ID for each request for logging/debugging
 */

const crypto = require('crypto');

const requestIdMiddleware = (req, res, next) => {
  // Generate unique request ID
  req.id = req.headers['x-request-id'] || crypto.randomUUID();

  // Add to response headers
  res.setHeader('X-Request-ID', req.id);

  // Add to response locals for logging
  res.locals.requestId = req.id;

  next();
};

module.exports = requestIdMiddleware;
