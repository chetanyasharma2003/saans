// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/paymentService.js';
import { SubscriptionPlan } from '@prisma/client';
import { ApiError, ErrorMessages, ErrorCodes, HttpStatus } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

export class PaymentController {
  /**
   * POST /payments/create-order
   * Create a Razorpay order for subscription
   */
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const { planType } = req.body;

      if (!planType) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Plan type is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Validate plan type
      const validPlans: SubscriptionPlan[] = ['FREE', 'BASIC', 'PREMIUM', 'PLUS'];
      if (!validPlans.includes(planType)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          `Invalid plan type. Valid options: ${validPlans.join(', ')}`,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.info('Creating payment order', { planType }, userId, requestId);

      const order = await paymentService.createRazorpayOrder(userId, planType);

      logger.info('Payment order created', {  planType }, userId, requestId);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Create order failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Create order error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.PAYMENT_PROCESSING_ERROR,
          true,
          ErrorCodes.VALIDATION_FAILED
        )
      );
    }
  }

  /**
   * POST /payments/verify-payment
   * Verify payment signature and update subscription
   */
  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Order ID, Payment ID, and Signature are required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (!planType) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Plan type is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.info('Verifying payment', { planType }, userId, requestId);

      // Verify signature
      const signatureVerification = await paymentService.verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!signatureVerification.isValid) {
        // Record failed payment attempt
        try {
          await paymentService.recordFailedPayment(
            userId,
            planType,
            'Invalid signature',
          );
        } catch (recordError) {
          logger.warn('Failed to record payment attempt', recordError);
        }

        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Invalid payment signature. Payment cannot be verified.',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Update user subscription
      const result = await paymentService.updateUserSubscription(
        userId,
        razorpay_order_id,
        razorpay_payment_id,
        planType,
      );

      logger.info('Payment verified and subscription updated', { planType }, userId, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: result.message,
        data: result.subscription,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Verify payment failed: ${error.message}`, undefined, userId, requestId);

        // Record failed payment
        if (planType && userId) {
          try {
            await paymentService.recordFailedPayment(userId, planType, error.message);
          } catch (recordError) {
            logger.warn('Failed to record payment failure', recordError);
          }
        }

        return next(error);
      }

      logger.error('Verify payment error', error, undefined, userId, requestId);

      // Record failed payment
      if (planType && userId) {
        try {
          await paymentService.recordFailedPayment(userId, planType, error.message);
        } catch (recordError) {
          logger.warn('Failed to record payment failure', recordError);
        }
      }

      next(
        new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.PAYMENT_PROCESSING_ERROR,
          true,
          ErrorCodes.VALIDATION_FAILED
        )
      );
    }
  }

  /**
   * GET /payments/subscription-status
   * Check user subscription status
   */
  async getSubscriptionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      logger.debug('Fetching subscription status', undefined, userId, requestId);

      const status = await paymentService.getSubscriptionStatus(userId);

      logger.info('Subscription status retrieved', { plan: status.plan }, userId, requestId);
      res.status(HttpStatus.OK).json({ 
        success: true,
        data: status,
      });
    } catch (error: any) {
      logger.error('Get subscription status error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /payments/cancel-subscription
   * Cancel user subscription
   */
  async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      logger.info('Cancelling subscription', undefined, userId, requestId);

      const result = await paymentService.cancelSubscription(userId);

      logger.info('Subscription cancelled', undefined, userId, requestId);
      res.status(HttpStatus.OK).json({ 
        success: true,
        message: result.message,
        data: result.subscription,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Cancel subscription failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Cancel subscription error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.BAD_REQUEST,
          true,
          ErrorCodes.VALIDATION_FAILED
        )
      );
    }
  }

  /**
   * GET /payments/payment-history
   * Get user payment history
   */
  async getPaymentHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const limit = parseInt((req.query.limit as string) || '10', 10);
      const skip = parseInt((req.query.skip as string) || '0', 10);

      // Validate pagination parameters
      if (limit < 1 || limit > 100) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_PAGINATION,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (skip < 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Skip must be non-negative',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Fetching payment history', { limit, skip }, userId, requestId);

      const history = await paymentService.getPaymentHistory(userId, limit, skip);

      logger.info('Payment history retrieved', { count: history.payments.length }, userId, requestId);
      res.status(HttpStatus.OK).json({ 
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
      if (error instanceof ApiError) {
        logger.warn(`Get payment history failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Get payment history error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /payments/plans
   * Get available subscription plans and pricing
   */
  async getPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = _req.headers['x-request-id'] as string;

    try {
      const plans = {
        BASIC: {
          name: 'Basic',
          price: 99,
          currency: 'INR',
          billingCycle: 'monthly',
          features: [
            'Unlimited AI chat',
            'Mood tracking',
            'Therapy session booking (2/month)',
            'Resource library',
            'Crisis support',
          ],
        },
        PREMIUM: {
          name: 'Premium',
          price: 299,
          currency: 'INR',
          billingCycle: 'monthly',
          features: [
            'Unlimited AI chat',
            'Priority AI responses',
            'Mood tracking with insights',
            'Therapy sessions (4/month)',
            'Full resource library',
            'Crisis support with priority',
            'Personalized wellness plans',
          ],
        },
        PLUS: {
          name: 'Plus',
          price: 499,
          currency: 'INR',
          billingCycle: 'monthly',
          features: [
            'Unlimited AI chat',
            'Priority AI responses',
            'Advanced mood analytics',
            'Unlimited therapy sessions',
            'Full resource library',
            'Dedicated crisis support',
            'Personalized wellness plans',
            'One-on-one consultation',
            'Monthly progress reports',
          ],
        },
      };

      logger.debug('Fetching subscription plans', undefined, undefined, requestId);

      res.status(HttpStatus.OK).json({ 
        success: true,
        data: plans,
      });
    } catch (error: any) {
      logger.error('Get plans error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }
}

export default new PaymentController();
