const express = require('express');
const router = express.Router();
const { Subscription } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');

// Get user subscriptions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current active subscription
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.userId, status: 'active' },
      order: [['renewalDate', 'DESC']],
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          plan: 'free',
          status: 'active',
          features: {
            therapy_sessions: 0,
            ai_counselor: false,
            community_access: false,
            resources_access: false,
          },
        },
      });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get subscription details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create subscription
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { plan, billingCycle, price } = req.body;

    if (!plan || !billingCycle || !price) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Cancel existing active subscription
    await Subscription.update(
      { status: 'cancelled', cancelledAt: new Date() },
      { where: { userId: req.userId, status: 'active' } }
    );

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingCycle === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (billingCycle === 'annually') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await Subscription.create({
      userId: req.userId,
      plan,
      status: 'active',
      billingCycle,
      price,
      startDate,
      endDate,
      renewalDate: endDate,
      features: getFeaturesByPlan(plan),
    });

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel subscription
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    await subscription.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: req.body.reason,
    });

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to get features by plan
function getFeaturesByPlan(plan) {
  const features = {
    free: {
      therapy_sessions: 0,
      ai_counselor: true,
      community_access: true,
      resources_access: true,
      appointment_booking: false,
    },
    basic: {
      therapy_sessions: 2,
      ai_counselor: true,
      community_access: true,
      resources_access: true,
      appointment_booking: true,
    },
    premium: {
      therapy_sessions: 8,
      ai_counselor: true,
      community_access: true,
      resources_access: true,
      appointment_booking: true,
    },
    pro: {
      therapy_sessions: 16,
      ai_counselor: true,
      community_access: true,
      resources_access: true,
      appointment_booking: true,
    },
  };

  return features[plan] || features.free;
}

module.exports = router;
