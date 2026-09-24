const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Razorpay = process.env.RAZORPAY_KEY_ID ? require('razorpay') : null;
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Payment Service
 * Handles Stripe, Razorpay, and wallet payments
 */

class PaymentService {
  constructor() {
    if (Razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    }
  }

  // ============ STRIPE PAYMENT ============

  async createStripePaymentIntent(userId, amount, description, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'inr',
        description,
        metadata: {
          userId,
          ...metadata
        }
      });

      const payment = new Payment({
        userId,
        amount,
        currency: 'INR',
        paymentMethod: 'stripe',
        status: 'pending',
        paymentGatewayId: paymentIntent.id,
        metadata: { description, ...metadata }
      });

      await payment.save();

      logger.info('Stripe payment intent created', {
        userId,
        amount,
        paymentId: payment._id
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
        amount,
        currency: 'INR'
      };
    } catch (error) {
      logger.error('Stripe payment intent creation failed', { error: error.message });
      throw error;
    }
  }

  async confirmStripePayment(paymentIntentId, paymentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        const payment = await Payment.findByIdAndUpdate(
          paymentId,
          {
            status: 'completed',
            transactionId: paymentIntentId,
            completedAt: new Date()
          },
          { new: true }
        );

        logger.info('Stripe payment confirmed', {
          paymentId,
          transactionId: paymentIntentId
        });

        return payment;
      }

      throw new Error(`Payment status: ${paymentIntent.status}`);
    } catch (error) {
      logger.error('Stripe payment confirmation failed', { error: error.message });
      throw error;
    }
  }

  async createStripeRefund(paymentId, amount) {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment || payment.paymentMethod !== 'stripe') {
        throw new Error('Payment not found or not a Stripe payment');
      }

      const refund = await stripe.refunds.create({
        payment_intent: payment.transactionId,
        amount: Math.round(amount * 100)
      });

      await Payment.findByIdAndUpdate(paymentId, {
        'refund.refundId': refund.id,
        'refund.amount': amount,
        'refund.status': 'completed',
        'refund.refundedAt': new Date(),
        status: 'refunded'
      });

      logger.info('Stripe refund created', {
        paymentId,
        refundId: refund.id,
        amount
      });

      return refund;
    } catch (error) {
      logger.error('Stripe refund creation failed', { error: error.message });
      throw error;
    }
  }

  // ============ RAZORPAY PAYMENT ============

  async createRazorpayOrder(userId, amount, description, metadata = {}) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId,
          ...metadata
        }
      };

      const order = await this.razorpay.orders.create(options);

      const payment = new Payment({
        userId,
        amount,
        currency: 'INR',
        paymentMethod: 'razorpay',
        status: 'pending',
        paymentGatewayId: order.id,
        orderId: order.id,
        metadata: { description, ...metadata }
      });

      await payment.save();

      logger.info('Razorpay order created', {
        userId,
        amount,
        orderId: order.id
      });

      return {
        orderId: order.id,
        paymentId: payment._id,
        amount,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      logger.error('Razorpay order creation failed', { error: error.message });
      throw error;
    }
  }

  async verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        throw new Error('Invalid signature');
      }

      const payment = await Payment.findOneAndUpdate(
        { orderId: razorpayOrderId },
        {
          status: 'completed',
          transactionId: razorpayPaymentId,
          paymentGatewayId: razorpayPaymentId,
          completedAt: new Date()
        },
        { new: true }
      );

      logger.info('Razorpay payment verified', {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId
      });

      return payment;
    } catch (error) {
      logger.error('Razorpay verification failed', { error: error.message });
      throw error;
    }
  }

  async createRazorpayRefund(paymentId, amount) {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment || payment.paymentMethod !== 'razorpay') {
        throw new Error('Payment not found or not a Razorpay payment');
      }

      const refund = await this.razorpay.payments.refund(payment.transactionId, {
        amount: Math.round(amount * 100)
      });

      await Payment.findByIdAndUpdate(paymentId, {
        'refund.refundId': refund.id,
        'refund.amount': amount,
        'refund.status': 'completed',
        'refund.refundedAt': new Date(),
        status: 'refunded'
      });

      logger.info('Razorpay refund created', {
        paymentId,
        refundId: refund.id,
        amount
      });

      return refund;
    } catch (error) {
      logger.error('Razorpay refund creation failed', { error: error.message });
      throw error;
    }
  }

  // ============ WALLET PAYMENT ============

  async createWalletPayment(userId, amount, description, metadata = {}) {
    try {
      const payment = new Payment({
        userId,
        amount,
        currency: 'INR',
        paymentMethod: 'wallet',
        status: 'pending',
        metadata: { description, ...metadata }
      });

      await payment.save();

      logger.info('Wallet payment created', {
        userId,
        amount,
        paymentId: payment._id
      });

      return payment;
    } catch (error) {
      logger.error('Wallet payment creation failed', { error: error.message });
      throw error;
    }
  }

  async completeWalletPayment(paymentId) {
    try {
      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          status: 'completed',
          transactionId: `wallet_${paymentId}`,
          completedAt: new Date()
        },
        { new: true }
      );

      logger.info('Wallet payment completed', { paymentId });

      return payment;
    } catch (error) {
      logger.error('Wallet payment completion failed', { error: error.message });
      throw error;
    }
  }

  // ============ PAYMENT QUERIES ============

  async getPaymentHistory(userId, limit = 20, offset = 0) {
    try {
      const payments = await Payment.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      const total = await Payment.countDocuments({ userId });

      return {
        payments,
        total,
        limit,
        offset
      };
    } catch (error) {
      logger.error('Payment history retrieval failed', { error: error.message });
      throw error;
    }
  }

  async getPaymentById(paymentId, userId) {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment || payment.userId.toString() !== userId.toString()) {
        throw new Error('Payment not found or unauthorized');
      }

      return payment;
    } catch (error) {
      logger.error('Payment retrieval failed', { error: error.message });
      throw error;
    }
  }

  async getPaymentStats(userId) {
    try {
      const stats = await Payment.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      return stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          amount: stat.totalAmount
        };
        return acc;
      }, {});
    } catch (error) {
      logger.error('Payment stats retrieval failed', { error: error.message });
      throw error;
    }
  }

  // ============ PAYMENT VALIDATION ============

  async validatePaymentAmount(amount) {
    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    // Minimum 1 INR, maximum 10,00,000 INR
    if (amount < 1 || amount > 1000000) {
      throw new Error('Payment amount out of range');
    }

    return true;
  }

  // ============ INVOICE GENERATION ============

  async generateInvoice(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('userId', 'firstName lastName email')
        .populate('appointmentId');

      if (!payment) {
        throw new Error('Payment not found');
      }

      const invoice = {
        invoiceId: `INV-${paymentId.toString().substring(0, 8).toUpperCase()}`,
        date: new Date().toISOString(),
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.metadata?.description,
        user: payment.userId,
        transactionId: payment.transactionId,
        paymentMethod: payment.paymentMethod
      };

      logger.info('Invoice generated', { paymentId });

      return invoice;
    } catch (error) {
      logger.error('Invoice generation failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = new PaymentService();
