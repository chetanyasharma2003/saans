/**
 * Payment Routes - Stripe Integration
 * Complete payment processing for therapy sessions
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const { Appointment, Payment, User, Therapist } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { z } = require('zod');

// Validation schemas
const paymentIntentSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethodId: z.string().optional()
});

const webhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any()
  })
});

/**
 * Create Payment Intent
 * POST /api/payments/create-intent
 */
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { appointmentId, amount } = paymentIntentSchema.parse(req.body);

    // Verify appointment exists and belongs to user
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment || appointment.userId !== req.user.id) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Get therapist details
    const therapist = await Therapist.findByPk(appointment.therapistId);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        appointmentId,
        userId: req.user.id,
        therapistId: appointment.therapistId,
        sessionDate: appointment.scheduledAt.toISOString()
      },
      description: `Therapy session with ${therapist.firstName} ${therapist.lastName}`
    });

    // Store payment intent record
    await Payment.create({
      appointmentId: appointmentId,
      userId: req.user.id,
      therapistId: appointment.therapistId,
      amount: amount,
      currency: 'usd',
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      appointmentId: appointmentId
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Confirm Payment
 * POST /api/payments/confirm
 */
router.post('/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId } = z.object({
      paymentIntentId: z.string()
    }).parse(req.body);

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const appointmentId = paymentIntent.metadata.appointmentId;

      // Update payment record
      await Payment.update(
        {
          status: 'completed',
          stripeChargeId: paymentIntent.charges.data[0]?.id,
          completedAt: new Date()
        },
        { where: { stripePaymentIntentId: paymentIntentId } }
      );

      // Update appointment as paid
      await Appointment.update(
        {
          status: 'confirmed',
          isPaid: true,
          paidAt: new Date()
        },
        { where: { id: appointmentId } }
      );

      // Send receipt email
      // await emailService.sendReceipt(appointment);

      res.json({
        message: 'Payment successful',
        paymentIntentId,
        status: 'completed'
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Process Refund
 * POST /api/payments/refund
 */
router.post('/refund', protect, async (req, res) => {
  try {
    const { appointmentId, reason } = z.object({
      appointmentId: z.string().uuid(),
      reason: z.string().optional()
    }).parse(req.body);

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment || appointment.userId !== req.user.id) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const payment = await Payment.findOne({
      where: { appointmentId: appointmentId, status: 'completed' }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Process refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: reason || 'requested_by_customer',
      metadata: {
        appointmentId: appointmentId,
        userId: req.user.id
      }
    });

    // Update payment record
    await Payment.update(
      {
        status: 'refunded',
        stripeRefundId: refund.id,
        refundedAt: new Date(),
        refundReason: reason
      },
      { where: { id: payment.id } }
    );

    // Update appointment
    await Appointment.update(
      { status: 'cancelled', isPaid: false },
      { where: { id: appointmentId } }
    );

    res.json({
      message: 'Refund processed',
      refundId: refund.id,
      amount: payment.amount,
      status: 'completed'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Webhook handler for Stripe events
 * POST /api/payments/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get Payment History
 * GET /api/payments/history
 */
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const payments = await Payment.findAll({
      where,
      include: [
        {
          model: Appointment,
          attributes: ['id', 'scheduledAt', 'duration', 'therapistId']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const total = await Payment.count({ where });

    res.json({
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get Invoice
 * GET /api/payments/:paymentId/invoice
 */
router.get('/:paymentId/invoice', protect, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.paymentId);

    if (!payment || payment.userId !== req.user.id) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Generate invoice PDF (simplified)
    const invoiceContent = `
      INVOICE
      -------
      Date: ${new Date().toLocaleDateString()}
      Amount: $${payment.amount}
      Status: ${payment.status}
      Description: Therapy Session Payment
    `;

    res.json({
      invoiceId: `INV-${payment.id}`,
      amount: payment.amount,
      date: payment.createdAt,
      status: payment.status
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper functions
async function handlePaymentSucceeded(paymentIntent) {
  const appointmentId = paymentIntent.metadata.appointmentId;
  await Appointment.update(
    { isPaid: true, status: 'confirmed' },
    { where: { id: appointmentId } }
  );
}

async function handlePaymentFailed(paymentIntent) {
  const appointmentId = paymentIntent.metadata.appointmentId;
  await Appointment.update(
    { isPaid: false },
    { where: { id: appointmentId } }
  );
}

async function handleChargeRefunded(charge) {
  // Handle refund
}

async function handleInvoiceCreated(invoice) {
  // Store invoice
}

module.exports = router;
