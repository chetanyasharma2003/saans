const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// Get all subscription plans
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await Subscription.find({ status: 'active' }).sort({ price: 1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
});

// Get user's active subscription
router.get('/user/active', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('subscription');

    if (!user.subscription) {
      return res.json({
        success: true,
        data: null,
        message: 'No active subscription'
      });
    }

    res.json({
      success: true,
      data: user.subscription,
      daysRemaining: Math.ceil(
        (new Date(user.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)
      )
    });
  } catch (error) {
    next(error);
  }
});

// Subscribe to plan
router.post('/subscribe', authenticateToken, async (req, res, next) => {
  try {
    const { planId, paymentMethod } = req.body;

    const plan = await Subscription.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    await User.findByIdAndUpdate(req.userId, {
      subscription: planId,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: endDate,
      subscriptionStatus: 'active'
    });

    res.json({
      success: true,
      message: 'Subscription activated',
      data: {
        planName: plan.name,
        endDate,
        daysRemaining: plan.durationDays
      }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      subscription: null,
      subscriptionStatus: 'cancelled'
    });

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    next(error);
  }
});

// Upgrade subscription
router.post('/upgrade', authenticateToken, async (req, res, next) => {
  try {
    const { newPlanId } = req.body;

    const user = await User.findById(req.userId);
    const newPlan = await Subscription.findById(newPlanId);

    if (!newPlan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + newPlan.durationDays);

    await User.findByIdAndUpdate(req.userId, {
      subscription: newPlanId,
      subscriptionEndDate: endDate
    });

    res.json({
      success: true,
      message: 'Subscription upgraded',
      newPlan: newPlan.name,
      endDate
    });
  } catch (error) {
    next(error);
  }
});

// Get subscription history
router.get('/user/history', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('subscriptionHistory');

    res.json({
      success: true,
      data: user.subscriptionHistory || []
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
