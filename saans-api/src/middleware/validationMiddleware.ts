// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import winston from 'winston';

/**
 * Production-ready validation middleware for SAANS Mental Health Platform
 * Includes XSS protection, input sanitization, and comprehensive error handling
 */

// ============ LOGGER SETUP ============
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'validation' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// ============ TYPES ============
interface ValidationOptions {
  schema: Joi.Schema;
  dataPath?: 'body' | 'query' | 'params';
  abortEarly?: boolean;
  sanitize?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

// ============ XSS PREVENTION ============

/**
 * List of dangerous HTML/JS tags and attributes that indicate XSS attempts
 */
const dangerousPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
  /javascript:/gi, // javascript: protocol
  /on\w+\s*=/gi, // Event handlers (onclick, onload, etc.)
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, // iframes
  /<embed\b/gi, // embed tags
  /<object\b/gi, // object tags
  /eval\s*\(/gi, // eval function
  /expression\s*\(/gi, // CSS expression
  /vbscript:/gi, // VBScript protocol
  /data:text\/html/gi, // Data URI with HTML
];

/**
 * Sanitize input string to prevent XSS attacks
 * Removes dangerous HTML/JavaScript patterns
 */
export const sanitizeInput = (value: any): any => {
  if (typeof value !== 'string') {
    return value;
  }

  // Check for suspicious patterns
  for (const pattern of dangerousPatterns) {
    if (pattern.test(value)) {
      const detectionType = pattern.source;
      logger.warn('Potential XSS attempt detected', {
        pattern: detectionType,
        input: value.substring(0, 50), // Log first 50 chars
      });
      // Return empty string or sanitize
      return value.replace(pattern, '');
    }
  }

  // Remove null bytes
  value = value.replace(/\0/g, '');

  // Trim excessive whitespace
  value = value.replace(/\s+/g, ' ').trim();

  return value;
};

/**
 * Recursively sanitize all string values in an object
 */
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

// ============ INPUT LENGTH VALIDATION ============

/**
 * Check for suspiciously long inputs that might be attack attempts
 */
export const checkInputLengths = (obj: any, maxLength: number = 10000): boolean => {
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      if (value.length > maxLength) {
        logger.warn('Input exceeds maximum length', {
          length: value.length,
          maxLength,
        });
        return false;
      }
    } else if (Array.isArray(value)) {
      return value.every(checkValue);
    } else if (typeof value === 'object' && value !== null) {
      return Object.values(value).every(checkValue);
    }
    return true;
  };

  return checkValue(obj);
};

// ============ MAIN VALIDATION MIDDLEWARE ============

/**
 * Factory function to create validation middleware
 * Usage: app.post('/register', validate({ schema: registerSchema }), controller)
 */
export const validate = (options: ValidationOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schema, dataPath = 'body', abortEarly = false, sanitize = true } = options;

      // Get data from the specified path
      let dataToValidate = (req as any)[dataPath];

      // Check input lengths for security
      if (!checkInputLengths(dataToValidate, 10000)) {
        logger.warn('Request rejected: input too long', {
          path: dataPath,
          ip: req.ip,
          userId: (req as any).userId,
        });
        res.status(400).json({
          error: 'Invalid input: request data too large',
          statusCode: 400,
        });
        return;
      }

      // Sanitize input if enabled
      if (sanitize) {
        dataToValidate = sanitizeObject(dataToValidate);
      }

      // Validate using Joi
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const details = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        logger.warn('Validation error', {
          errors: details,
          dataPath,
          ip: req.ip,
          userId: (req as any).userId,
        });

        res.status(400).json({
          error: 'Validation failed',
          statusCode: 400,
          details,
        });
        return;
      }

      // Replace original data with validated and sanitized data
      (req as any)[dataPath] = value;

      next();
    } catch (err: any) {
      logger.error('Validation middleware error', {
        error: err.message,
        stack: err.stack,
      });

      res.status(500).json({
        error: 'Internal server error during validation',
        statusCode: 500,
      });
    }
  };
};

// ============ SPECIFIC VALIDATORS ============

/**
 * Validate email format
 */
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: 'Invalid email format',
    };
  }

  if (email.length > 255) {
    return {
      valid: false,
      message: 'Email is too long',
    };
  }

  return { valid: true };
};

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePasswordStrength = (
  password: string
): { valid: boolean; message?: string; strength?: 'weak' | 'medium' | 'strong' } => {
  if (password.length < 8) {
    return {
      valid: false,
      strength: 'weak',
      message: 'Password must be at least 8 characters',
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      message: 'Password must not exceed 128 characters',
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  const checks = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar];
  const passedChecks = checks.filter(Boolean).length;

  if (passedChecks < 4) {
    return {
      valid: false,
      strength: passedChecks >= 2 ? 'medium' : 'weak',
      message:
        'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)',
    };
  }

  return {
    valid: true,
    strength: 'strong',
  };
};

/**
 * Validate Indian phone number (10 digits, starts with 6-9)
 */
export const validateIndianPhoneNumber = (
  phoneNumber: string
): { valid: boolean; message?: string } => {
  if (!phoneNumber) {
    return { valid: true }; // Optional field
  }

  const phoneRegex = /^[6-9]\d{9}$/;

  if (!phoneRegex.test(phoneNumber)) {
    return {
      valid: false,
      message: 'Invalid Indian phone number (must be 10 digits starting with 6-9)',
    };
  }

  return { valid: true };
};

/**
 * Validate price/amount
 */
export const validatePrice = (
  amount: number,
  options?: { min?: number; max?: number }
): { valid: boolean; message?: string } => {
  const { min = 0, max = 999999.99 } = options || {};

  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      valid: false,
      message: 'Amount must be a valid number',
    };
  }

  if (amount < min) {
    return {
      valid: false,
      message: `Amount must be at least ${min}`,
    };
  }

  if (amount > max) {
    return {
      valid: false,
      message: `Amount must not exceed ${max}`,
    };
  }

  // Check decimal places (max 2 for currency)
  if (amount * 100 !== Math.round(amount * 100)) {
    return {
      valid: false,
      message: 'Amount must have at most 2 decimal places',
    };
  }

  return { valid: true };
};

/**
 * Validate date is in ISO 8601 format and optionally in future
 */
export const validateDate = (
  dateString: string,
  options?: { mustBeFuture?: boolean }
): { valid: boolean; message?: string; date?: Date } => {
  const { mustBeFuture = false } = options || {};

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return {
        valid: false,
        message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
      };
    }

    // Check if date is in future if required
    if (mustBeFuture && date <= new Date()) {
      return {
        valid: false,
        message: 'Date must be in the future',
      };
    }

    return { valid: true, date };
  } catch (err) {
    return {
      valid: false,
      message: 'Invalid date format',
    };
  }
};

/**
 * Validate that required fields are present
 */
export const validateRequiredFields = (
  obj: any,
  requiredFields: string[]
): { valid: boolean; missingFields?: string[] } => {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = obj[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      valid: false,
      missingFields,
    };
  }

  return { valid: true };
};

/**
 * Validate UUID format (v4)
 */
export const validateUUID = (uuid: string): { valid: boolean; message?: string } => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) {
    return {
      valid: false,
      message: 'Invalid UUID format',
    };
  }

  return { valid: true };
};

/**
 * Sanitization middleware that sanitizes all inputs
 * Apply this globally or to specific routes
 */
export const sanitizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize route parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Rate limiting awareness middleware
 * Log suspicious patterns that might indicate brute force attacks
 */
export const suspiciousActivityLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Track failed validation attempts
  const suspiciousEndpoints = ['/api/auth/login', '/api/auth/register', '/api/payments/verify-payment'];

  if (suspiciousEndpoints.includes(req.path) && req.method === 'POST') {
    // This would be enhanced with actual rate limiting in production
    logger.info('Authentication/Payment attempt', {
      ip: req.ip,
      endpoint: req.path,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

export default validate;
