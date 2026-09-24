const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Subscription = require('../models/Subscription');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

// ==================== STRIPE PAYMENTS ====================

// Create Stripe payment intent
router.post('/stripe/create-intent', auth, [
  body('amount').isFloat({ min: 0 }).toFloat(),
  body('type').isIn(['appointment', 'subscription', 'topup']),
  body('appointmentId').optional().isMongoId()
], async (req, res, next) => {
  try {
    const { amount, type, appointmentId } = req.body;

    const paymentIntent = await paymentService.createStripePaymentIntent(
      amount,
      'inr',
      {
        userId: req.user._id.toString(),
        type,
        appointmentId: appointmentId || null
      }
    );

    res.json({ success: true, data: paymentIntent });
  } catch (error) {
    next(error);
  }
});

// Confirm Stripe payment
router.post('/stripe/confirm', auth, [
  body('paymentIntentId').notEmpty().isString()
], async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    const result = await paymentService.confirmStripePayment(paymentIntentId);

    if (result.success) {
      // Create payment record
      const payment = await Payment.create({
        userId: req.user._id,
        amount: req.body.amount || 0,
        currency: 'INR',
        paymentMethod: 'stripe',
        status: 'completed',
        transactionId: paymentIntentId,
        metadata: { type: req.body.type }
      });

      logger.info('Stripe payment confirmed', { paymentId: payment._id });

      // Send confirmation email
      await notificationService.sendAppointmentConfirmation(
        req.user.email,
        req.user.name,
        { /* appointment details */ }
      );
    }

    res.json({ success: result.success, data: result });
  } catch (error) {
    next(error);
  }
});

// ==================== RAZORPAY PAYMENTS ====================

// Create Razorpay order
router.post('/razorpay/create-order', auth, [
  body('amount').isFloat({ min: 0 }).toFloat(),
  body('type').isIn(['appointment', 'subscription', 'topup'])
], async (req, res, next) => {
  try {
    const { amount, type, appointmentId } = req.body;

    const order = await paymentService.createRazorpayOrder(
      amount,
      'INR',
      `order_${Date.now()}`,
      {
        userId: req.user._id.toString(),
        type,
        email: req.user.email
      }
    );

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Verify Razorpay payment
router.post('/razorpay/verify', auth, [
  body('orderId').notEmpty().isString(),
  body('paymentId').notEmpty().isString(),
  body('signature').notEmpty().isString()
], async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const result = await paymentService.verifyRazorpayPayment(orderId, paymentId, signature);

    if (result.success) {
      const payment = await Payment.create({
        userId: req.user._id,
        amount: req.body.amount || 0,
        currency: 'INR',
        paymentMethod: 'razorpay',
        status: 'completed',
        transactionId: paymentId,
        metadata: { orderId, type: req.body.type }
      });

      logger.info('Razorpay payment verified', { paymentId: payment._id });
    }

    res.json({ success: result.success });
  } catch (error) {
    next(error);
  }
});

// ==================== SUBSCRIPTIONS ====================

// Create subscription
router.post('/subscribe', auth, [
  body('plan').isIn(['basic', 'premium', 'elite']),
  body('paymentMethod').isIn(['stripe', 'razorpay'])
], async (req, res, next) => {
  try {
    const { plan, paymentMethod } = req.body;

    const planPrices = {
      basic: 999,
      premium: 2999,
      elite: 5999
    };

    const subscription = await Subscription.create({
      userId: req.user._id,
      plan,
      planDetails: {
        name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        price: planPrices[plan],
        currency: 'INR',
        billingCycle: 'monthly'
      },
      status: 'active',
      paymentMethod,
      autoRenew: true
    });

    // Send subscription confirmation
    await notificationService.sendSubscriptionConfirmation(
      req.user.email,
      req.user.name,
      {
        plan,
        amount: planPrices[plan],
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        features: ['Access to therapists', 'Mood tracking', 'Community']
      }
    );

    res.json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
});

// Cancel subscription
router.post('/cancel-subscription/:subscriptionId', auth, async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.subscriptionId,
      {
        status: 'cancelled',
        cancelledAt: new Date()
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    logger.info('Subscription cancelled', { subscriptionId: req.params.subscriptionId });

    res.json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
});

// Get subscription status
router.get('/subscription-status', auth, async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    });

    res.json({
      success: true,
      data: subscription || { status: 'no_subscription' }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== REFUNDS ====================

// Request refund
router.post('/refund/:paymentId', auth, [
  body('reason').notEmpty().isString(),
  body('amount').optional().isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    let refundResult;
    if (payment.paymentMethod === 'stripe') {
      refundResult = await paymentService.refundStripePayment(
        payment.transactionId,
        req.body.amount,
        req.body.reason
      );
    } else if (payment.paymentMethod === 'razorpay') {
      refundResult = await paymentService.refundRazorpayPayment(
        payment.transactionId,
        req.body.amount
      );
    }

    if (refundResult.success) {
      payment.status = 'refunded';
      payment.refundId = refundResult.refundId;
      await payment.save();

      logger.info('Refund processed', { paymentId: req.params.paymentId });
    }

    res.json({ success: refundResult.success, data: refundResult });
  } catch (error) {
    next(error);
  }
});

// ==================== PAYMENT HISTORY ====================

// Get payment history
router.get('/history', auth, async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== WEBHOOKS ====================

// Stripe webhook
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const event = paymentService.handleStripeWebhook(req.body, req.headers['stripe-signature']);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntentId = event.data.object.id;
      logger.info('Stripe payment succeeded', { paymentIntentId });
    }

    if (event.type === 'customer.subscription.updated') {
      logger.info('Stripe subscription updated');
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// Razorpay webhook
router.post('/webhook/razorpay', express.json(), async (req, res, next) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const result = paymentService.handleRazorpayWebhook(req.body, webhookSignature);

    if (result.valid) {
      const event = result.payload.event;
      logger.info('Razorpay webhook received', { event });

      if (event === 'payment.authorized') {
        logger.info('Razorpay payment authorized');
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
