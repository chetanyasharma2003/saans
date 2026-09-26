const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Subscription = require('../models/Subscription');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const razorpay = require('razorpay');

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Stripe payment intent
router.post('/stripe/create-intent', authenticateToken, async (req, res, next) => {
  try {
    const { amount, appointmentId, description } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      metadata: {
        userId: req.userId,
        appointmentId,
        description
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    next(error);
  }
});

// Confirm Stripe payment
router.post('/stripe/confirm', authenticateToken, async (req, res, next) => {
  try {
    const { paymentIntentId, appointmentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, error: 'Payment not confirmed' });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.userId,
      appointmentId,
      amount: paymentIntent.amount / 100,
      currency: 'INR',
      paymentMethod: 'stripe',
      transactionId: paymentIntent.id,
      status: 'completed'
    });

    await payment.save();

    // Update appointment
    await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'completed' });

    res.json({ success: true, message: 'Payment confirmed', data: payment });
  } catch (error) {
    next(error);
  }
});

// Create Razorpay order
router.post('/razorpay/create-order', authenticateToken, async (req, res, next) => {
  try {
    const { amount, appointmentId, description } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `appt_${appointmentId}`,
      notes: {
        userId: req.userId,
        appointmentId,
        description
      }
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency
    });
  } catch (error) {
    next(error);
  }
});

// Verify Razorpay payment
router.post('/razorpay/verify', authenticateToken, async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, appointmentId } = req.body;

    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    const payment = new Payment({
      userId: req.userId,
      appointmentId,
      paymentMethod: 'razorpay',
      transactionId: paymentId,
      status: 'completed'
    });

    await payment.save();

    // Update appointment
    await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'completed' });

    res.json({ success: true, message: 'Payment verified', data: payment });
  } catch (error) {
    next(error);
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const payments = await Payment.find({ userId: req.userId })
      .populate('appointmentId', 'therapistId scheduledAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Payment.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      data: payments,
      total,
      hasMore: offset + payments.length < total
    });
  } catch (error) {
    next(error);
  }
});

// Get payment stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const totalSpent = await Payment.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.userId), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paymentsByMethod = await Payment.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.userId) } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalSpent: totalSpent[0]?.total || 0,
        paymentsByMethod,
        totalPayments: await Payment.countDocuments({ userId: req.userId })
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
