const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const logger = require('../utils/logger');

class PaymentService {
  // ==================== STRIPE ====================

  async createStripePaymentIntent(amount, currency = 'inr', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        metadata,
        automatic_payment_methods: { enabled: true }
      });

      logger.info('Stripe payment intent created', { id: paymentIntent.id, amount });
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      logger.error('Stripe payment intent error', { error: error.message });
      throw error;
    }
  }

  async confirmStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      logger.error('Stripe payment confirmation error', { error: error.message });
      throw error;
    }
  }

  async createStripeSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        expand: ['latest_invoice.payment_intent']
      });

      logger.info('Stripe subscription created', { id: subscription.id });
      return {
        success: true,
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        status: subscription.status
      };
    } catch (error) {
      logger.error('Stripe subscription error', { error: error.message });
      throw error;
    }
  }

  async cancelStripeSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.del(subscriptionId);
      logger.info('Stripe subscription cancelled', { id: subscriptionId });
      return { success: true, status: subscription.status };
    } catch (error) {
      logger.error('Stripe cancellation error', { error: error.message });
      throw error;
    }
  }

  // ==================== RAZORPAY ====================

  async createRazorpayOrder(amount, currency = 'INR', receipt = '', notes = {}) {
    try {
      const response = await axios.post(
        'https://api.razorpay.com/v1/orders',
        {
          amount: Math.round(amount * 100), // Convert to paise
          currency,
          receipt,
          notes
        },
        {
          auth: {
            username: process.env.RAZORPAY_KEY_ID,
            password: process.env.RAZORPAY_KEY_SECRET
          }
        }
      );

      logger.info('Razorpay order created', { id: response.data.id, amount });
      return {
        success: true,
        orderId: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status
      };
    } catch (error) {
      logger.error('Razorpay order error', { error: error.message });
      throw error;
    }
  }

  async verifyRazorpayPayment(orderId, paymentId, signature) {
    try {
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = generatedSignature === signature;

      if (isValid) {
        logger.info('Razorpay payment verified', { orderId, paymentId });
      } else {
        logger.warn('Razorpay payment verification failed', { orderId, paymentId });
      }

      return { success: isValid };
    } catch (error) {
      logger.error('Razorpay verification error', { error: error.message });
      throw error;
    }
  }

  async createRazorpaySubscription(planId, customerId, notes = {}) {
    try {
      const response = await axios.post(
        'https://api.razorpay.com/v1/subscriptions',
        {
          plan_id: planId,
          customer_notify: 1,
          quantity: 1,
          notes
        },
        {
          auth: {
            username: process.env.RAZORPAY_KEY_ID,
            password: process.env.RAZORPAY_KEY_SECRET
          }
        }
      );

      logger.info('Razorpay subscription created', { id: response.data.id });
      return {
        success: true,
        subscriptionId: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      logger.error('Razorpay subscription error', { error: error.message });
      throw error;
    }
  }

  // ==================== REFUNDS ====================

  async refundStripePayment(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      });

      logger.info('Stripe refund processed', { id: refund.id });
      return { success: true, refundId: refund.id, status: refund.status };
    } catch (error) {
      logger.error('Stripe refund error', { error: error.message });
      throw error;
    }
  }

  async refundRazorpayPayment(paymentId, amount = null) {
    try {
      const response = await axios.post(
        `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
        amount ? { amount: Math.round(amount * 100) } : {},
        {
          auth: {
            username: process.env.RAZORPAY_KEY_ID,
            password: process.env.RAZORPAY_KEY_SECRET
          }
        }
      );

      logger.info('Razorpay refund processed', { paymentId });
      return { success: true, refundId: response.data.id, status: response.data.status };
    } catch (error) {
      logger.error('Razorpay refund error', { error: error.message });
      throw error;
    }
  }

  // ==================== WEBHOOKS ====================

  handleStripeWebhook(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      logger.info('Stripe webhook received', { type: event.type });
      return event;
    } catch (error) {
      logger.error('Stripe webhook error', { error: error.message });
      throw error;
    }
  }

  handleRazorpayWebhook(payload, signature) {
    try {
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      const isValid = generatedSignature === signature;
      logger.info('Razorpay webhook received', { valid: isValid });
      return { valid: isValid, payload };
    } catch (error) {
      logger.error('Razorpay webhook error', { error: error.message });
      throw error;
    }
  }
}

module.exports = new PaymentService();
