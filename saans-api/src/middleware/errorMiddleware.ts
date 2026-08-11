// @ts-nocheck

/**
 * Global Error Handling Middleware
 * Catches all errors from route handlers and middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorMessages, HttpStatus, createErrorResponse } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Async error wrapper for route handlers
 * Wraps async controller methods to catch errors and pass to error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 * Must be registered LAST in middleware chain
 */
export const globalErrorHandler = (
  err: Error | ApiError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}`;
  const userId = (req as any).userId;

  // Default error response
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = ErrorMessages.INTERNAL_SERVER_ERROR;
  let errorCode = 'INTERNAL_ERROR';

  // Handle custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode || 'API_ERROR';

    logger.error(
      `API Error: ${message}`,
      err,
      { errorCode, details: err.details },
      userId,
      requestId
    );
  }
  // Handle Validation Errors
  else if (err.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = ErrorMessages.INVALID_INPUT;
    errorCode = 'VALIDATION_FAILED';
    logger.warn(`Validation Error: ${err.message}`, { details: (err as any).details }, userId, requestId);
  }
  // Handle JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = ErrorMessages.INVALID_TOKEN;
    errorCode = 'INVALID_TOKEN';
    logger.warn(`JWT Error: ${err.message}`, undefined, userId, requestId);
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = ErrorMessages.TOKEN_EXPIRED;
    errorCode = 'TOKEN_EXPIRED';
    logger.warn(`Token Expired: ${err.message}`, undefined, userId, requestId);
  }
  // Handle Prisma Errors
  else if (err.code && err.code.startsWith('P')) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = ErrorMessages.DATABASE_ERROR;
    errorCode = `PRISMA_${err.code}`;
    logger.error(`Prisma Error (${err.code}): ${err.message}`, err, { prismaCode: err.code }, userId, requestId);
  }
  // Handle other errors
  else {
    statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    message = err.message || ErrorMessages.INTERNAL_SERVER_ERROR;
    errorCode = err.errorCode || 'INTERNAL_ERROR';
    logger.error(`Unhandled Error: ${message}`, err, undefined, userId, requestId);
  }

  // Don't expose sensitive details in production
  if (process.env.NODE_ENV === 'production' && statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
    message = ErrorMessages.INTERNAL_SERVER_ERROR;
  }

  // Send response
  res.status(statusCode).json(
    createErrorResponse(statusCode, message, errorCode)
  );
};

/**
 * 404 Not Found Handler
 * Should be registered after all route handlers
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}`;
  logger.warn(
    `Route not found: ${req.method} ${req.path}`,
    { method: req.method, path: req.path },
    undefined,
    requestId
  );

  res.status(HttpStatus.NOT_FOUND).json(
    createErrorResponse(
      HttpStatus.NOT_FOUND,
      ErrorMessages.NOT_FOUND,
      'NOT_FOUND'
    )
  );
};

/**
 * Request ID middleware
 * Generates and attaches request ID for logging/tracing
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Request logging middleware
 * Logs incoming requests and outgoing responses
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string;
  const userId = (req as any).userId;
  const startTime = Date.now();

  // Log request
  if (process.env.NODE_ENV === 'development') {
    logger.debug(
      `${req.method} ${req.path}`,
      { method: req.method, path: req.path, query: req.query },
      userId,
      requestId
    );
  }

  // Capture response
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const duration = Date.now() - startTime;

    // Log response
    if (res.statusCode >= 400) {
      logger.warn(
        `${req.method} ${req.path} - ${res.statusCode}`,
        { method: req.method, path: req.path, statusCode: res.statusCode, duration },
        userId,
        requestId
      );
    } else if (process.env.NODE_ENV === 'development') {
      logger.debug(
        `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
        { method: req.method, path: req.path, statusCode: res.statusCode, duration },
        userId,
        requestId
      );
    }

    return originalJson(body);
  };

  next();
};

export default globalErrorHandler;
