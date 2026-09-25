const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

/**
 * Payment Routes - Stripe, Razorpay, Wallet Integration
 */

// ============ STRIPE PAYMENTS ============

// Create Stripe payment intent
router.post('/stripe/create-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, description, appointmentId } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    await paymentService.validatePaymentAmount(amount);

    const result = await paymentService.createStripePaymentIntent(
      req.user._id,
      amount,
      description,
      { appointmentId }
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Create Stripe intent failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Confirm Stripe payment
router.post('/stripe/confirm', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    if (!paymentIntentId || !paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment Intent ID and Payment ID are required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    const payment = await paymentService.confirmStripePayment(paymentIntentId, paymentId);

    logger.info('Stripe payment confirmed', {
      userId: req.user._id,
      paymentId
    });

    res.json({
      success: true,
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Confirm Stripe payment failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ RAZORPAY PAYMENTS ============

// Create Razorpay order
router.post('/razorpay/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, description, appointmentId } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    await paymentService.validatePaymentAmount(amount);

    const result = await paymentService.createRazorpayOrder(
      req.user._id,
      amount,
      description,
      { appointmentId }
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Create Razorpay order failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Verify Razorpay signature
router.post('/razorpay/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment details',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    const payment = await paymentService.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    logger.info('Razorpay payment verified', {
      userId: req.user._id,
      orderId: razorpayOrderId
    });

    res.json({
      success: true,
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Verify Razorpay signature failed', { error: error.message });

    res.status(400).json({
      success: false,
      error: error.message,
      statusCode: 400,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ WALLET PAYMENTS ============

// Create wallet payment
router.post('/wallet/create', authenticateToken, async (req, res) => {
  try {
    const { amount, description, appointmentId } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    await paymentService.validatePaymentAmount(amount);

    const payment = await paymentService.createWalletPayment(
      req.user._id,
      amount,
      description,
      { appointmentId }
    );

    res.json({
      success: true,
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Create wallet payment failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Complete wallet payment
router.post('/wallet/:paymentId/complete', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await paymentService.completeWalletPayment(paymentId);

    logger.info('Wallet payment completed', {
      userId: req.user._id,
      paymentId
    });

    res.json({
      success: true,
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Complete wallet payment failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ REFUNDS ============

// Create refund
router.post('/:paymentId/refund', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Refund amount is required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Verify payment ownership
    const payment = await paymentService.getPaymentById(paymentId, req.user._id);

    let refund;
    if (payment.paymentMethod === 'stripe') {
      refund = await paymentService.createStripeRefund(paymentId, amount);
    } else if (payment.paymentMethod === 'razorpay') {
      refund = await paymentService.createRazorpayRefund(paymentId, amount);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Refunds not supported for this payment method',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Refund created', {
      userId: req.user._id,
      paymentId,
      amount
    });

    res.json({
      success: true,
      data: refund,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Create refund failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ PAYMENT QUERIES ============

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await paymentService.getPaymentHistory(
      req.user._id,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: result.payments,
      pagination: {
        limit: result.limit,
        offset: result.offset,
        total: result.total
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get payment history failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get payment by ID
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentById(paymentId, req.user._id);

    res.json({
      success: true,
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get payment failed', { error: error.message });

    res.status(404).json({
      success: false,
      error: error.message,
      statusCode: 404,
      timestamp: new Date().toISOString()
    });
  }
});

// Get payment stats
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await paymentService.getPaymentStats(req.user._id);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get payment stats failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ INVOICES ============

// Generate invoice
router.get('/:paymentId/invoice', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Verify ownership
    await paymentService.getPaymentById(paymentId, req.user._id);

    const invoice = await paymentService.generateInvoice(paymentId);

    logger.info('Invoice generated', {
      userId: req.user._id,
      paymentId
    });

    res.json({
      success: true,
      data: invoice,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Generate invoice failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ SUBSCRIPTIONS ============

// Get user's active subscription
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const Subscription = require('../models/Subscription');

    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: { $in: ['active', 'pending'] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subscription || {
        status: 'inactive',
        plan: null,
        renewsAt: null,
        price: 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get subscription failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
