/**
 * Utility functions for validation
 * Helpers for common validation patterns
 */

/**
 * Combine multiple Joi schemas
 */
export const combineSchemas = (schemas: any[]): any => {
  return schemas.reduce((combined, schema) => combined.concat(schema));
};

/**
 * Check if error is a Joi validation error
 */
export const isJoiError = (error: any): boolean => {
  return error && error.isJoi === true;
};

/**
 * Convert Joi error details to user-friendly messages
 */
export const formatValidationErrors = (
  error: any
): { [key: string]: string } | null => {
  if (!isJoiError(error)) {
    return null;
  }

  const formattedErrors: { [key: string]: string } = {};

  error.details.forEach((detail: any) => {
    const field = detail.path.join('.');
    formattedErrors[field] = detail.message;
  });

  return formattedErrors;
};

/**
 * Safe value extraction with validation
 */
export const safeExtract = <T>(obj: any, keys: string[], defaults?: T): Partial<T> => {
  const result: any = {};

  keys.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    } else if (defaults && defaults.hasOwnProperty(key)) {
      result[key] = (defaults as any)[key];
    }
  });

  return result as Partial<T>;
};

/**
 * Validate object structure against schema
 */
export const validateStructure = (obj: any, schema: any): boolean => {
  const { error } = schema.validate(obj);
  return !error;
};

/**
 * Get validation error count
 */
export const getErrorCount = (error: any): number => {
  if (!isJoiError(error)) {
    return 0;
  }
  return error.details.length;
};

/**
 * Check if specific field has validation error
 */
export const hasFieldError = (error: any, fieldName: string): boolean => {
  if (!isJoiError(error)) {
    return false;
  }

  return error.details.some((detail: any) => {
    const field = detail.path.join('.');
    return field === fieldName;
  });
};

/**
 * Get error message for specific field
 */
export const getFieldErrorMessage = (error: any, fieldName: string): string | null => {
  if (!isJoiError(error)) {
    return null;
  }

  const detail = error.details.find((detail: any) => {
    const field = detail.path.join('.');
    return field === fieldName;
  });

  return detail ? detail.message : null;
};

/**
 * Create a whitelist validator
 */
export const createWhitelistValidator = (allowedValues: string[]) => {
  return (value: string): boolean => {
    return allowedValues.includes(value);
  };
};

/**
 * Check if value is within range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (limit?: number, skip?: number) => {
  const errors: string[] = [];

  if (limit !== undefined) {
    if (limit < 1) errors.push('Limit must be at least 1');
    if (limit > 100) errors.push('Limit must not exceed 100');
  }

  if (skip !== undefined) {
    if (skip < 0) errors.push('Skip must be 0 or greater');
  }

  return {
    valid: errors.length === 0,
    errors,
    limit: limit || 10,
    skip: skip || 0,
  };
};

/**
 * Normalize and validate email
 */
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Validate and extract domain from email
 */
export const extractEmailDomain = (email: string): string | null => {
  const match = email.match(/@(.+)$/);
  return match ? match[1] : null;
};

/**
 * Check if email domain is disposable/temporary
 * (This would typically use an external service in production)
 */
export const isDisposableEmail = (email: string): boolean => {
  const disposableDomains = [
    'tempmail.com',
    'throwaway.email',
    '10minutemail.com',
    'guerrillamail.com',
  ];

  const domain = extractEmailDomain(email);
  return domain ? disposableDomains.includes(domain) : false;
};

/**
 * Validate and format phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Return last 10 digits (in case of country code)
  return cleaned.slice(-10);
};

/**
 * Validate amount is safe for database storage
 */
export const isSafeAmount = (amount: number): boolean => {
  // JavaScript safe integer limit
  const MAX_SAFE_AMOUNT = 999999.99;
  const MIN_SAFE_AMOUNT = 0;

  return amount >= MIN_SAFE_AMOUNT && amount <= MAX_SAFE_AMOUNT;
};

/**
 * Round amount to 2 decimal places
 */
export const roundAmount = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

/**
 * Convert amount from rupees to paise
 */
export const rupeesToPaise = (rupees: number): number => {
  return Math.round(rupees * 100);
};

/**
 * Convert amount from paise to rupees
 */
export const paiseToRupees = (paise: number): number => {
  return paise / 100;
};

/**
 * Validate appointment duration
 */
export const validateAppointmentDuration = (
  duration: number
): { valid: boolean; message?: string } => {
  const MIN_DURATION = 15; // minutes
  const MAX_DURATION = 480; // minutes (8 hours)

  if (duration < MIN_DURATION) {
    return {
      valid: false,
      message: `Appointment must be at least ${MIN_DURATION} minutes`,
    };
  }

  if (duration > MAX_DURATION) {
    return {
      valid: false,
      message: `Appointment cannot exceed ${MAX_DURATION} minutes`,
    };
  }

  return { valid: true };
};

/**
 * Check if datetime is reasonable (not too far in future)
 */
export const isReasonableDateTime = (dateTime: Date, maxDaysInFuture: number = 365): boolean => {
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDaysInFuture);

  return dateTime > now && dateTime <= maxDate;
};

/**
 * Check if date is in working hours
 */
export const isInWorkingHours = (date: Date): boolean => {
  const hour = date.getHours();
  // 9 AM to 9 PM
  return hour >= 9 && hour <= 21;
};

/**
 * Validate rating value
 */
export const validateRating = (rating: number): { valid: boolean; message?: string } => {
  if (!Number.isInteger(rating)) {
    return {
      valid: false,
      message: 'Rating must be an integer',
    };
  }

  if (rating < 1 || rating > 5) {
    return {
      valid: false,
      message: 'Rating must be between 1 and 5',
    };
  }

  return { valid: true };
};

/**
 * Get validation error summary for logging
 */
export const getValidationErrorSummary = (error: any): string => {
  if (!error || !error.details) {
    return 'Unknown validation error';
  }

  const fields = error.details.map((d: any) => d.path.join('.')).join(', ');
  return `Validation failed for fields: ${fields}`;
};
