import Joi from 'joi';

/**
 * Comprehensive validation schemas for SAANS Mental Health Platform
 * Production-ready with security best practices
 */

// ============ PASSWORD VALIDATION ============
// Password must have:
// - Minimum 8 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character (!@#$%^&*)
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .required()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .messages({
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'any.required': 'Password is required',
  });

// ============ EMAIL VALIDATION ============
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .max(255)
  .required()
  .lowercase()
  .trim()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
    'string.max': 'Email must not exceed 255 characters',
  });

// ============ PHONE NUMBER VALIDATION (INDIA) ============
// India phone numbers: 10 digits, can start with 6-9
const phoneSchema = Joi.string()
  .pattern(/^[6-9]\d{9}$/)
  .optional()
  .allow('')
  .messages({
    'string.pattern.base': 'Phone number must be 10 digits starting with 6-9 (Indian format)',
  });

// ============ NAME VALIDATION ============
const nameSchema = Joi.string()
  .min(2)
  .max(100)
  .required()
  .trim()
  .pattern(/^[a-zA-Z\s'-]+$/)
  .messages({
    'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  });

// ============ PRICE/AMOUNT VALIDATION ============
// For payment amounts in paise (divide by 100 for INR)
// const priceSchema = Joi.number()
//   .positive()
//   .precision(2)
//   .required()
//   .messages({
//     'number.positive': 'Amount must be a positive number',
//     'any.required': 'Amount is required',
//   });

// Amount in rupees (min 1 paise = 0.01 INR)
// const amountSchema = Joi.number()
//   .min(0.01)
//   .max(999999.99)
//   .precision(2)
//   .required()
//   .messages({
//     'number.min': 'Amount must be at least 0.01',
//     'number.max': 'Amount must not exceed 999999.99',
//     'any.required': 'Amount is required',
//   });

// ============ DATE VALIDATION ============
// ISO 8601 date format
// const dateSchema = Joi.date().iso().required().messages({
//   'date.base': 'Please provide a valid date in ISO 8601 format',
//   'any.required': 'Date is required',
// });

// Date in future (for scheduling)
const futureDateSchema = Joi.date()
  .iso()
  .min('now')
  .required()
  .messages({
    'date.base': 'Please provide a valid date in ISO 8601 format',
    'date.min': 'Date must be in the future',
    'any.required': 'Date is required',
  });

// ============ ROLE VALIDATION ============
const roleSchema = Joi.string()
  .valid('PATIENT', 'THERAPIST', 'ADMIN')
  .optional()
  .default('PATIENT')
  .messages({
    'any.only': 'Role must be one of: PATIENT, THERAPIST, ADMIN',
  });

// ============ AUTH SCHEMAS ============

export const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  role: roleSchema,
}).unknown(false);

export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
}).unknown(false);

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Old password is required',
  }),
  newPassword: passwordSchema,
}).unknown(false);

export const updateProfileSchema = Joi.object({
  name: nameSchema.optional(),
  bio: Joi.string()
    .max(500)
    .optional()
    .trim()
    .messages({
      'string.max': 'Bio must not exceed 500 characters',
    }),
  phoneNumber: phoneSchema,
  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URI',
    }),
  specialization: Joi.string()
    .max(100)
    .optional()
    .trim()
    .messages({
      'string.max': 'Specialization must not exceed 100 characters',
    }),
  yearsOfExperience: Joi.number()
    .integer()
    .min(0)
    .max(60)
    .optional()
    .messages({
      'number.min': 'Years of experience must be 0 or more',
      'number.max': 'Years of experience must not exceed 60',
    }),
}).unknown(false);

// ============ APPOINTMENT SCHEMAS ============

export const bookAppointmentSchema = Joi.object({
  therapistId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.guid': 'Therapist ID must be a valid UUID',
      'any.required': 'Therapist ID is required',
    }),
  scheduledAt: futureDateSchema,
  duration: Joi.number()
    .integer()
    .min(15)
    .max(480)
    .required()
    .messages({
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration must not exceed 480 minutes (8 hours)',
      'any.required': 'Duration is required',
    }),
  reason: Joi.string()
    .max(500)
    .optional()
    .trim()
    .messages({
      'string.max': 'Reason must not exceed 500 characters',
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .trim()
    .messages({
      'string.max': 'Notes must not exceed 1000 characters',
    }),
}).unknown(false);

export const rescheduleAppointmentSchema = Joi.object({
  newDateTime: futureDateSchema,
}).unknown(false);

export const updateAppointmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid('COMPLETED', 'CANCELLED', 'NO_SHOW')
    .required()
    .messages({
      'any.only': 'Status must be one of: COMPLETED, CANCELLED, NO_SHOW',
      'any.required': 'Status is required',
    }),
  cancelReason: Joi.string()
    .max(500)
    .optional()
    .trim()
    .messages({
      'string.max': 'Cancel reason must not exceed 500 characters',
    }),
}).unknown(false);

export const appointmentIdSchema = Joi.object({
  id: Joi.string()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.guid': 'Appointment ID must be a valid UUID',
      'any.required': 'Appointment ID is required',
    }),
}).unknown(false);

// ============ PAYMENT SCHEMAS ============

export const createOrderSchema = Joi.object({
  planType: Joi.string()
    .valid('FREE', 'BASIC', 'PREMIUM', 'PLUS')
    .required()
    .messages({
      'any.only': 'Plan type must be one of: FREE, BASIC, PREMIUM, PLUS',
      'any.required': 'Plan type is required',
    }),
}).unknown(false);

export const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string()
    .required()
    .pattern(/^order_/)
    .messages({
      'any.required': 'Razorpay Order ID is required',
      'string.pattern.base': 'Invalid Razorpay Order ID format',
    }),
  razorpay_payment_id: Joi.string()
    .required()
    .pattern(/^pay_/)
    .messages({
      'any.required': 'Razorpay Payment ID is required',
      'string.pattern.base': 'Invalid Razorpay Payment ID format',
    }),
  razorpay_signature: Joi.string()
    .required()
    .hex()
    .length(64)
    .messages({
      'any.required': 'Razorpay Signature is required',
      'string.hex': 'Signature must be a valid hex string',
      'string.length': 'Signature must be exactly 64 characters',
    }),
  planType: Joi.string()
    .valid('FREE', 'BASIC', 'PREMIUM', 'PLUS')
    .required()
    .messages({
      'any.only': 'Plan type must be one of: FREE, BASIC, PREMIUM, PLUS',
      'any.required': 'Plan type is required',
    }),
}).unknown(false);

export const paginationSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional()
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
    }),
  skip: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .optional()
    .messages({
      'number.min': 'Skip must be 0 or greater',
    }),
}).unknown(false);

// ============ THERAPIST SCHEMAS ============

export const therapistRegistrationSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  specialization: Joi.string()
    .min(3)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'Specialization must be at least 3 characters',
      'string.max': 'Specialization must not exceed 100 characters',
      'any.required': 'Specialization is required',
    }),
  licenseNumber: Joi.string()
    .min(5)
    .max(50)
    .required()
    .uppercase()
    .trim()
    .messages({
      'string.min': 'License number must be at least 5 characters',
      'string.max': 'License number must not exceed 50 characters',
      'any.required': 'License number is required',
    }),
  yearsOfExperience: Joi.number()
    .integer()
    .min(0)
    .max(60)
    .required()
    .messages({
      'number.min': 'Years of experience must be 0 or more',
      'number.max': 'Years of experience must not exceed 60',
      'any.required': 'Years of experience is required',
    }),
  phoneNumber: phoneSchema.required(),
  bio: Joi.string()
    .max(1000)
    .optional()
    .trim()
    .messages({
      'string.max': 'Bio must not exceed 1000 characters',
    }),
}).unknown(false);

// ============ CRISIS SUPPORT SCHEMAS ============

export const crisisMessageSchema = Joi.object({
  message: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .trim()
    .messages({
      'string.min': 'Message must not be empty',
      'string.max': 'Message must not exceed 2000 characters',
      'any.required': 'Message is required',
    }),
  severity: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    .optional()
    .messages({
      'any.only': 'Severity must be one of: LOW, MEDIUM, HIGH, CRITICAL',
    }),
}).unknown(false);

// ============ SEARCH SCHEMAS ============

export const searchSchema = Joi.object({
  query: Joi.string()
    .min(1)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'Search query must not be empty',
      'string.max': 'Search query must not exceed 100 characters',
      'any.required': 'Search query is required',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional(),
  offset: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .optional(),
}).unknown(false);

// ============ FILTER SCHEMAS ============

export const appointmentFilterSchema = Joi.object({
  status: Joi.string()
    .valid('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
    .optional()
    .messages({
      'any.only': 'Status must be one of: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW',
    }),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  therapistId: Joi.string().uuid({ version: 'uuidv4' }).optional(),
}).unknown(false);

// ============ RATING SCHEMAS ============

export const ratingSchema = Joi.object({
  appointmentId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.guid': 'Appointment ID must be a valid UUID',
      'any.required': 'Appointment ID is required',
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must not exceed 5',
      'any.required': 'Rating is required',
    }),
  comment: Joi.string()
    .max(500)
    .optional()
    .trim()
    .messages({
      'string.max': 'Comment must not exceed 500 characters',
    }),
}).unknown(false);
