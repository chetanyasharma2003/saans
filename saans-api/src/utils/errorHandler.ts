/**
 * Custom Error Class for API responses
 * Production-ready error handling with proper HTTP status codes
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly errorCode?: string;
  public readonly details?: Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    errorCode?: string,
    details?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to JSON for API response (excludes sensitive details)
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.errorCode,
        timestamp: this.timestamp.toISOString(),
      },
    };
  }
}

/**
 * Standard HTTP Error Codes and Messages
 */
export const ErrorMessages = {
  // 400 Bad Request
  BAD_REQUEST: 'Bad request. Please check your input.',
  INVALID_INPUT: 'Invalid input provided.',
  MISSING_REQUIRED_FIELDS: 'Missing required fields.',
  INVALID_EMAIL: 'Invalid email format.',
  INVALID_DATE: 'Invalid date format.',
  INVALID_PAGINATION: 'Invalid pagination parameters.',

  // 401 Unauthorized
  UNAUTHORIZED: 'Unauthorized. Please log in.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  NO_TOKEN: 'No authentication token provided.',
  INVALID_TOKEN: 'Invalid or malformed authentication token.',

  // 403 Forbidden
  FORBIDDEN: 'You do not have permission to access this resource.',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action.',
  RESOURCE_FORBIDDEN: 'This resource is forbidden for you.',

  // 404 Not Found
  NOT_FOUND: 'The requested resource was not found.',
  USER_NOT_FOUND: 'User not found.',
  APPOINTMENT_NOT_FOUND: 'Appointment not found.',
  THERAPIST_NOT_FOUND: 'Therapist not found.',
  INCIDENT_NOT_FOUND: 'Incident not found.',

  // 409 Conflict
  RESOURCE_EXISTS: 'This resource already exists.',
  DUPLICATE_EMAIL: 'An account with this email already exists.',
  THERAPIST_PROFILE_EXISTS: 'Therapist profile already exists for this user.',

  // 500 Internal Server Error
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  DATABASE_ERROR: 'Database operation failed.',
  EXTERNAL_API_ERROR: 'External service error. Please try again later.',
  PAYMENT_PROCESSING_ERROR: 'Payment processing failed. Please try again.',
};

/**
 * Error Codes for Client-side Handling
 */
export const ErrorCodes = {
  // Auth
  AUTH_MISSING_CREDENTIALS: 'AUTH_MISSING_CREDENTIALS',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_DATE: 'INVALID_DATE',

  // Resource
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',
  RESOURCE_FORBIDDEN: 'RESOURCE_FORBIDDEN',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
};

/**
 * Common HTTP Status Codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Helper function to create standardized API error responses
 */
export function createErrorResponse(
  _statusCode: number,
  message: string,
  errorCode?: string,
  details?: Record<string, any>
) {
  return {
    error: {
      message,
      code: errorCode,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && details && { details }),
    },
  };
}

/**
 * Validation error helper
 */
export function createValidationError(field: string, message: string) {
  return {
    field,
    message,
  };
}
