# Input Validation Middleware - Integration Guide

## Overview

This guide explains how to use the input validation middleware in the SAANS Mental Health Platform API. The validation system provides:

- **Schema-based validation** using Joi
- **XSS prevention** and input sanitization
- **Password strength validation**
- **Email validation**
- **Phone number validation** (India format)
- **Price/amount validation**
- **Date validation**
- **Comprehensive error handling**
- **Security logging**

## Quick Start

### 1. Basic Route Validation

#### Before (Old Way - Unsafe)

```typescript
import { Router } from 'express';
import authController from '../controllers/authController.js';

const router = Router();

router.post('/register', (req, res) => {
  // Minimal validation in controller
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  authController.register(req, res);
});
```

#### After (New Way - Production-Ready)

```typescript
import { Router } from 'express';
import authController from '../controllers/authController.js';
import { validate, sanitizationMiddleware } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../schemas/validationSchemas.js';

const router = Router();

// Apply sanitization globally
router.use(sanitizationMiddleware);

// Register with validation
router.post('/register', validate({ schema: registerSchema }), (req, res) =>
  authController.register(req, res)
);

// Login with validation
router.post('/login', validate({ schema: loginSchema }), (req, res) =>
  authController.login(req, res)
);

export default router;
```

### 2. Update Routes with Validation

#### Auth Routes

```typescript
import { Router } from 'express';
import authController from '../controllers/authController.js';
import { validate, sanitizationMiddleware } from '../middleware/validationMiddleware.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../schemas/validationSchemas.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// Apply sanitization globally for this router
router.use(sanitizationMiddleware);

// Public routes
router.post('/register', validate({ schema: registerSchema }), (req, res) =>
  authController.register(req, res)
);

router.post('/login', validate({ schema: loginSchema }), (req, res) =>
  authController.login(req, res)
);

router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));

router.post('/logout', (req, res) => authController.logout(req, res));

// Protected routes
router.get('/me', verifyToken, isAuthenticated, (req, res) =>
  authController.getCurrentUser(req, res)
);

router.put(
  '/profile',
  verifyToken,
  isAuthenticated,
  validate({ schema: updateProfileSchema }),
  (req, res) => authController.updateProfile(req, res)
);

router.post(
  '/change-password',
  verifyToken,
  isAuthenticated,
  validate({ schema: changePasswordSchema }),
  (req, res) => authController.changePassword(req, res)
);

export default router;
```

#### Appointment Routes

```typescript
import { Router } from 'express';
import appointmentController from '../controllers/appointmentController.js';
import { validate, sanitizationMiddleware } from '../middleware/validationMiddleware.js';
import {
  bookAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentStatusSchema,
  appointmentFilterSchema,
} from '../schemas/validationSchemas.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// Apply sanitization globally
router.use(sanitizationMiddleware);

// All appointment routes require authentication
router.use(verifyToken, isAuthenticated);

// Book appointment
router.post('/book', validate({ schema: bookAppointmentSchema }), (req, res) =>
  appointmentController.bookAppointment(req, res)
);

// Get my appointments with query validation
router.get(
  '/my-appointments',
  validate({ schema: appointmentFilterSchema, dataPath: 'query' }),
  (req, res) => appointmentController.getMyAppointments(req, res)
);

// Get therapist appointments
router.get('/therapist-appointments/:therapistId', (req, res) =>
  appointmentController.getTherapistAppointments(req, res)
);

// Get appointment details
router.get('/:id', (req, res) => appointmentController.getAppointmentDetails(req, res));

// Update appointment status
router.put(
  '/:id/status',
  validate({ schema: updateAppointmentStatusSchema }),
  (req, res) => appointmentController.updateAppointmentStatus(req, res)
);

// Reschedule appointment
router.post(
  '/:id/reschedule',
  validate({ schema: rescheduleAppointmentSchema }),
  (req, res) => appointmentController.rescheduleAppointment(req, res)
);

// Cancel appointment
router.post('/:id/cancel', (req, res) =>
  appointmentController.cancelAppointment(req, res)
);

export default router;
```

#### Payment Routes

```typescript
import { Router } from 'express';
import paymentController from '../controllers/paymentController.js';
import { validate, sanitizationMiddleware } from '../middleware/validationMiddleware.js';
import {
  createOrderSchema,
  verifyPaymentSchema,
  paginationSchema,
} from '../schemas/validationSchemas.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// Apply sanitization globally
router.use(sanitizationMiddleware);

// Public routes
router.get('/plans', (req, res) => paymentController.getPlans(req, res));

// Protected routes
router.post(
  '/create-order',
  verifyToken,
  isAuthenticated,
  validate({ schema: createOrderSchema }),
  (req, res) => paymentController.createOrder(req, res)
);

router.post(
  '/verify-payment',
  verifyToken,
  isAuthenticated,
  validate({ schema: verifyPaymentSchema }),
  (req, res) => paymentController.verifyPayment(req, res)
);

router.get('/subscription-status', verifyToken, isAuthenticated, (req, res) =>
  paymentController.getSubscriptionStatus(req, res)
);

router.post('/cancel-subscription', verifyToken, isAuthenticated, (req, res) =>
  paymentController.cancelSubscription(req, res)
);

router.get(
  '/payment-history',
  verifyToken,
  isAuthenticated,
  validate({ schema: paginationSchema, dataPath: 'query' }),
  (req, res) => paymentController.getPaymentHistory(req, res)
);

export default router;
```

### 3. Global Sanitization Middleware in app.ts

```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sanitizationMiddleware, suspiciousActivityLogger } from './middleware/validationMiddleware.js';
import authRoutes from './routes/authRoutes.js';
// ... other imports

dotenv.config();

const app: Express = express();

// =============== MIDDLEWARE ===============

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Global sanitization middleware
app.use(sanitizationMiddleware);

// Suspicious activity logging
app.use(suspiciousActivityLogger);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// =============== ROUTES ===============

// ... rest of the app.ts code

export default app;
```

## Validation Schemas Reference

### Register Schema

```typescript
{
  email: "user@example.com",           // valid email
  password: "SecurePass123!",           // min 8 chars, uppercase, lowercase, number, special char
  name: "John Doe",                     // 2-100 chars, letters/spaces/hyphens only
  role?: "PATIENT" | "THERAPIST"        // optional, defaults to PATIENT
}
```

### Login Schema

```typescript
{
  email: "user@example.com",
  password: "SecurePass123!"
}
```

### Update Profile Schema

```typescript
{
  name?: "John Doe",
  bio?: "Mental health professional",
  phoneNumber?: "9876543210",           // 10 digits, starts with 6-9
  avatar?: "https://example.com/avatar.jpg",
  specialization?: "Cognitive Behavioral Therapy",
  yearsOfExperience?: 5
}
```

### Book Appointment Schema

```typescript
{
  therapistId: "550e8400-e29b-41d4-a716-446655440000",  // UUID
  scheduledAt: "2024-09-01T14:00:00Z",                  // future date
  duration: 60,                                          // 15-480 minutes
  reason?: "Anxiety counseling",
  notes?: "First session, please prepare documents"
}
```

### Create Order Schema

```typescript
{
  planType: "BASIC" | "PREMIUM" | "PLUS"  // subscription plan
}
```

### Verify Payment Schema

```typescript
{
  razorpay_order_id: "order_1A9Pox99su63qX",
  razorpay_payment_id: "pay_1A9Pox99su63qY",
  razorpay_signature: "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
  planType: "BASIC" | "PREMIUM" | "PLUS"
}
```

## Utility Functions

### Using Validation Utils

```typescript
import {
  validateEmail,
  validatePasswordStrength,
  validateIndianPhoneNumber,
  validatePrice,
  validateDate,
  validateRequiredFields,
} from '../middleware/validationMiddleware.js';

import {
  formatValidationErrors,
  validatePagination,
  normalizeEmail,
  formatPhoneNumber,
  rupeesToPaise,
  paiseToRupees,
} from '../utils/validationUtils.js';

// Validate email
const emailCheck = validateEmail('user@example.com');
if (!emailCheck.valid) {
  console.error(emailCheck.message);
}

// Validate password strength
const passwordCheck = validatePasswordStrength('MyPass123!');
if (!passwordCheck.valid) {
  console.error(`${passwordCheck.message} (Strength: ${passwordCheck.strength})`);
}

// Validate phone number
const phoneCheck = validateIndianPhoneNumber('9876543210');
if (!phoneCheck.valid) {
  console.error(phoneCheck.message);
}

// Validate price
const priceCheck = validatePrice(299.99, { min: 1, max: 10000 });
if (!priceCheck.valid) {
  console.error(priceCheck.message);
}

// Validate date
const dateCheck = validateDate('2024-09-01T14:00:00Z', { mustBeFuture: true });
if (!dateCheck.valid) {
  console.error(dateCheck.message);
} else {
  console.log('Valid date:', dateCheck.date);
}

// Validate required fields
const requiredCheck = validateRequiredFields(req.body, ['email', 'password', 'name']);
if (!requiredCheck.valid) {
  console.error('Missing fields:', requiredCheck.missingFields);
}

// Format validation errors for response
const { error } = schema.validate(req.body);
const formattedErrors = formatValidationErrors(error);

// Validate pagination
const paginationCheck = validatePagination(req.query.limit, req.query.skip);
if (!paginationCheck.valid) {
  console.error(paginationCheck.errors);
}

// Normalize email
const normalizedEmail = normalizeEmail('USER@EXAMPLE.COM'); // 'user@example.com'

// Format phone number
const formattedPhone = formatPhoneNumber('9876-543-210'); // '9876543210'

// Currency conversion
const paise = rupeesToPaise(299.99); // 29999
const rupees = paiseToRupees(29999); // 299.99
```

## Error Responses

### Validation Error Response

```json
{
  "error": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)"
    }
  ]
}
```

### XSS Prevention Response

```json
{
  "error": "Invalid input: request data too large",
  "statusCode": 400
}
```

## Security Features

### XSS Prevention

The middleware automatically sanitizes all inputs by removing:

- `<script>` tags
- `javascript:` protocol
- Event handlers (`onclick`, `onload`, etc.)
- `<iframe>`, `<embed>`, `<object>` tags
- `eval()` and `expression()` functions
- VBScript protocol
- Data URIs with HTML
- Null bytes

### Input Length Validation

- Maximum input length: 10,000 characters
- Prevents buffer overflow attacks
- Logs suspicious inputs

### Password Strength Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)
- Maximum 128 characters

### Email Validation

- Valid RFC 5322 format (simplified)
- Maximum 255 characters
- Automatically lowercased and trimmed

### Phone Number Validation (India)

- Exactly 10 digits
- Must start with 6-9 (mobile numbers)
- Format: `XXXXXXXXXXX` where first digit is 6-9

### Date Validation

- ISO 8601 format required
- Future date checking optional
- Timezone aware

## Best Practices

### 1. Always Sanitize User Input

```typescript
app.use(sanitizationMiddleware);
```

### 2. Use Schema Validation for All Endpoints

```typescript
router.post(
  '/endpoint',
  validate({ schema: mySchema }),
  controller.handler
);
```

### 3. Validate Query Parameters

```typescript
router.get(
  '/search',
  validate({ schema: searchSchema, dataPath: 'query' }),
  controller.handler
);
```

### 4. Validate Route Parameters

```typescript
router.get(
  '/:id',
  validate({ schema: idSchema, dataPath: 'params' }),
  controller.handler
);
```

### 5. Handle Validation Errors Gracefully

```typescript
const { error, value } = schema.validate(req.body);
if (error) {
  const errors = formatValidationErrors(error);
  return res.status(400).json({
    error: 'Validation failed',
    details: errors,
  });
}
```

### 6. Log Suspicious Activity

The middleware automatically logs:

- XSS attempts
- Input length violations
- Validation failures
- Failed authentication attempts
- Payment verification failures

## Testing Validation

### Test Email Validation

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### Test Password Strength

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "weak",
    "name": "John Doe"
  }'
```

### Test Phone Number Validation

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "phoneNumber": "1234567890"
  }'
```

### Test XSS Prevention

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "<script>alert(1)</script>"
  }'
```

## Production Deployment Checklist

- [ ] Enable HTTPS
- [ ] Set strong CORS origin
- [ ] Enable rate limiting (recommend redis-rate-limit)
- [ ] Set NODE_ENV=production
- [ ] Enable logging to file
- [ ] Set up monitoring for validation errors
- [ ] Enable HTTPS for payment endpoints
- [ ] Test all validation schemas
- [ ] Review security headers
- [ ] Test XSS prevention
- [ ] Verify password hashing (bcrypt)
- [ ] Set up database connection pooling
- [ ] Enable request ID logging for tracing

## Troubleshooting

### Validation always fails

1. Check if schema is properly imported
2. Verify data structure matches schema
3. Check Joi error messages for details
4. Enable debug logging

### XSS prevention blocking legitimate input

1. Review dangerous patterns in validationMiddleware.ts
2. Adjust sanitization rules if needed
3. Consider using CSP headers instead
4. Test with sample inputs

### Performance issues with validation

1. Cache schema validation results if applicable
2. Use `abortEarly: true` in validation options
3. Optimize custom validation functions
4. Monitor logging performance

## Additional Resources

- [Joi Documentation](https://joi.dev/)
- [OWASP Input Validation](https://owasp.org/www-community/attacks/xss/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/nodejs-security/)
