# Integration Examples - Input Validation Middleware

Quick reference for integrating validation middleware into existing routes.

## Example 1: Auth Routes (Complete)

**File:** `src/routes/authRoutes.ts`

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

---

## Example 2: Appointment Routes (Complete)

**File:** `src/routes/appointmentRoutes.ts`

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

/**
 * POST /api/appointments/book
 * Body: { therapistId, scheduledAt, duration, reason?, notes? }
 */
router.post('/book', validate({ schema: bookAppointmentSchema }), (req, res) =>
  appointmentController.bookAppointment(req, res)
);

/**
 * GET /api/appointments/my-appointments
 * Query: status?, from?, to?, therapistId?
 */
router.get(
  '/my-appointments',
  validate({ schema: appointmentFilterSchema, dataPath: 'query' }),
  (req, res) => appointmentController.getMyAppointments(req, res)
);

/**
 * GET /api/appointments/therapist-appointments/:therapistId
 */
router.get('/therapist-appointments/:therapistId', (req, res) =>
  appointmentController.getTherapistAppointments(req, res)
);

/**
 * GET /api/appointments/:id
 */
router.get('/:id', (req, res) => appointmentController.getAppointmentDetails(req, res));

/**
 * PUT /api/appointments/:id/status
 * Body: { status, cancelReason? }
 */
router.put(
  '/:id/status',
  validate({ schema: updateAppointmentStatusSchema }),
  (req, res) => appointmentController.updateAppointmentStatus(req, res)
);

/**
 * POST /api/appointments/:id/reschedule
 * Body: { newDateTime }
 */
router.post(
  '/:id/reschedule',
  validate({ schema: rescheduleAppointmentSchema }),
  (req, res) => appointmentController.rescheduleAppointment(req, res)
);

/**
 * POST /api/appointments/:id/cancel
 * Body: { reason? }
 */
router.post('/:id/cancel', (req, res) =>
  appointmentController.cancelAppointment(req, res)
);

/**
 * GET /api/appointments/availability/:therapistId
 * Query: dateTime, duration
 */
router.get('/availability/:therapistId', (req, res) =>
  appointmentController.checkAvailability(req, res)
);

export default router;
```

---

## Example 3: Payment Routes (Complete)

**File:** `src/routes/paymentRoutes.ts`

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

// Protected routes (require authentication)

/**
 * POST /api/payments/create-order
 * Body: { planType }
 */
router.post(
  '/create-order',
  verifyToken,
  isAuthenticated,
  validate({ schema: createOrderSchema }),
  (req, res) => paymentController.createOrder(req, res)
);

/**
 * POST /api/payments/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType }
 */
router.post(
  '/verify-payment',
  verifyToken,
  isAuthenticated,
  validate({ schema: verifyPaymentSchema }),
  (req, res) => paymentController.verifyPayment(req, res)
);

/**
 * GET /api/payments/subscription-status
 */
router.get(
  '/subscription-status',
  verifyToken,
  isAuthenticated,
  (req, res) => paymentController.getSubscriptionStatus(req, res)
);

/**
 * POST /api/payments/cancel-subscription
 */
router.post(
  '/cancel-subscription',
  verifyToken,
  isAuthenticated,
  (req, res) => paymentController.cancelSubscription(req, res)
);

/**
 * GET /api/payments/payment-history
 * Query: limit (1-100, default 10), skip (default 0)
 */
router.get(
  '/payment-history',
  verifyToken,
  isAuthenticated,
  validate({ schema: paginationSchema, dataPath: 'query' }),
  (req, res) => paymentController.getPaymentHistory(req, res)
);

export default router;
```

---

## Example 4: Update app.ts (Global Setup)

**File:** `src/app.ts`

```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sanitizationMiddleware, suspiciousActivityLogger } from './middleware/validationMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import therapistRoutes from './routes/therapistRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import crisisRoutes from './routes/crisisRoutes.js';

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

// Global sanitization middleware (NEW)
app.use(sanitizationMiddleware);

// Suspicious activity logging (NEW)
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

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API status
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'operational',
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// Appointment routes
app.use('/api/appointments', appointmentRoutes);

// Therapist routes
app.use('/api/therapists', therapistRoutes);

// Payment routes
app.use('/api/payments', paymentRoutes);

// Crisis routes
app.use('/api/crisis', crisisRoutes);

// =============== ERROR HANDLING ===============

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  });
});

export default app;
```

---

## Example 5: Using Validation Utils in Service

**File:** `src/services/authService.ts`

```typescript
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validatePasswordStrength } from '../middleware/validationMiddleware.js';
import { normalizeEmail, isDisposableEmail } from '../utils/validationUtils.js';
import prisma from '../utils/prismaClient.js';

export class AuthService {
  async register({ email, password, name, role }: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    // Email is already validated by middleware, but normalize it
    const normalizedEmail = normalizeEmail(email);

    // Check for disposable email (optional, adds extra security)
    if (isDisposableEmail(normalizedEmail)) {
      throw new Error('Temporary email addresses are not allowed');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Password is already validated by middleware for strength
    // But you might want to hash it here
    const passwordHash = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        name,
        role: role || 'PATIENT',
      },
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // New password is already validated by middleware for strength
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Old password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcryptjs.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash },
    });

    return { message: 'Password changed successfully' };
  }
}

export default new AuthService();
```

---

## Example 6: Using Validation Utils in Controller

**File:** `src/controllers/paymentController.ts`

```typescript
import { Request, Response } from 'express';
import paymentService from '../services/paymentService.js';
import { validatePrice, validatePagination, rupeesToPaise, paiseToRupees } from '../utils/validationUtils.js';

export class PaymentController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { planType } = req.body;

      // Data is already validated by middleware
      // But you can add additional business logic validation

      const order = await paymentService.createRazorpayOrder(userId, planType);

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(400).json({
        error: error.message || 'Failed to create order',
      });
    }
  }

  async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      let limit = parseInt((req.query.limit as string) || '10', 10);
      let skip = parseInt((req.query.skip as string) || '0', 10);

      // Validate pagination (already validated by middleware, but extra check)
      const paginationCheck = validatePagination(limit, skip);
      if (!paginationCheck.valid) {
        res.status(400).json({
          error: paginationCheck.errors.join(', '),
        });
        return;
      }

      limit = paginationCheck.limit;
      skip = paginationCheck.skip;

      const history = await paymentService.getPaymentHistory(userId, limit, skip);

      res.status(200).json({
        success: true,
        data: history.payments,
        pagination: {
          total: history.total,
          limit,
          skip,
          pages: Math.ceil(history.total / limit),
        },
      });
    } catch (error: any) {
      console.error('Get payment history error:', error);
      res.status(400).json({
        error: error.message || 'Failed to get payment history',
      });
    }
  }
}

export default new PaymentController();
```

---

## Example 7: Testing Validation

**Test Email Validation**

```bash
# Should fail - invalid email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'

# Response:
# {
#   "error": "Validation failed",
#   "statusCode": 400,
#   "details": [{
#     "field": "email",
#     "message": "Please provide a valid email address"
#   }]
# }
```

**Test Password Strength**

```bash
# Should fail - weak password
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "weak",
    "name": "John Doe"
  }'

# Response:
# {
#   "error": "Validation failed",
#   "statusCode": 400,
#   "details": [{
#     "field": "password",
#     "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)"
#   }]
# }
```

**Test Phone Number Validation**

```bash
# Should fail - invalid phone
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "phoneNumber": "1234567890"
  }'

# Response:
# {
#   "error": "Validation failed",
#   "statusCode": 400,
#   "details": [{
#     "field": "phoneNumber",
#     "message": "Phone number must be 10 digits starting with 6-9 (Indian format)"
#   }]
# }
```

**Test XSS Prevention**

```bash
# Should be sanitized
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "<script>alert(1)</script>"
  }'

# The script tag will be removed automatically
# Logged to Winston: "Potential XSS attempt detected"
```

---

## Migration Path

1. **Phase 1**: Update auth routes first (most critical)
2. **Phase 2**: Update appointment routes
3. **Phase 3**: Update payment routes
4. **Phase 4**: Update other routes
5. **Phase 5**: Add global sanitization in app.ts
6. **Phase 6**: Test thoroughly
7. **Phase 7**: Deploy to production

---

## Rollback Plan

If issues arise:

1. Remove `validate()` middleware from specific routes
2. Keep `sanitizationMiddleware` as it's low-risk
3. Test controllers directly
4. Gradually re-add validation

---

**Integration complete. Ready for deployment.**
