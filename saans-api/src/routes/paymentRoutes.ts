// @ts-nocheck

import { Router } from 'express';
import paymentController from '../controllers/paymentController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';
import { paymentLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Public routes
router.get('/plans', (req, res, next) => paymentController.getPlans(req, res, next));

// Protected routes (require authentication) with rate limiting
router.post(
  '/create-order',
  verifyToken,
  isAuthenticated,
  paymentLimiter,
  (req, res, next) => paymentController.createOrder(req, res, next),
);

router.post(
  '/verify-payment',
  verifyToken,
  isAuthenticated,
  paymentLimiter,
  (req, res, next) => paymentController.verifyPayment(req, res, next),
);

router.get(
  '/subscription-status',
  verifyToken,
  isAuthenticated,
  (req, res, next) => paymentController.getSubscriptionStatus(req, res, next),
);

router.post(
  '/cancel-subscription',
  verifyToken,
  isAuthenticated,
  (req, res, next) => paymentController.cancelSubscription(req, res, next),
);

router.get(
  '/payment-history',
  verifyToken,
  isAuthenticated,
  (req, res, next) => paymentController.getPaymentHistory(req, res, next),
);

export default router;
