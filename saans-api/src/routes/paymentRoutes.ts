// @ts-nocheck

import { Router } from 'express';
import paymentController from '../controllers/paymentController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';
import { paymentLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/payments/plans:
 *   get:
 *     summary: Get subscription plans
 *     description: Get list of available subscription plans
 *     tags:
 *       - Payments
 *     responses:
 *       200:
 *         description: Plans retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plan'
 */
router.get('/plans', (req, res, next) => paymentController.getPlans(req, res, next));

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     summary: Create payment order
 *     description: Create a Razorpay order for a subscription plan
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateOrderResponse'
 *       400:
 *         description: Invalid plan ID
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/create-order',
  verifyToken,
  isAuthenticated,
  paymentLimiter,
  (req, res, next) => paymentController.createOrder(req, res, next),
);

/**
 * @swagger
 * /api/payments/verify-payment:
 *   post:
 *     summary: Verify payment
 *     description: Verify Razorpay payment signature and activate subscription
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment verified and subscription activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Invalid payment signature
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/verify-payment',
  verifyToken,
  isAuthenticated,
  paymentLimiter,
  (req, res, next) => paymentController.verifyPayment(req, res, next),
);

/**
 * @swagger
 * /api/payments/subscription-status:
 *   get:
 *     summary: Get subscription status
 *     description: Get user's current subscription status and details
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/subscription-status',
  verifyToken,
  isAuthenticated,
  (req, res, next) => paymentController.getSubscriptionStatus(req, res, next),
);

/**
 * @swagger
 * /api/payments/cancel-subscription:
 *   post:
 *     summary: Cancel subscription
 *     description: Cancel user's active subscription
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 nullable: true
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post(
  '/cancel-subscription',
  verifyToken,
  isAuthenticated,
  (req, res, next) => paymentController.cancelSubscription(req, res, next),
);

/**
 * @swagger
 * /api/payments/payment-history:
 *   get:
 *     summary: Get payment history
 *     description: Get user's payment transaction history
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Payment history retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/payment-history',
  verifyToken,
  isAuthenticated,
  (req, res, next) => paymentController.getPaymentHistory(req, res, next),
);

export default router;
