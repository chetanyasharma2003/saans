const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MoodEntry = require('../models/MoodEntry');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const mlEngine = require('../services/mlEngine');
const logger = require('../utils/logger');

// Get therapist recommendations
router.get('/therapists', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const recommendations = await mlEngine.recommendTherapists(req.userId, {
      conditions: user.healthConditions,
      languages: user.languages,
      budget: user.budget
    });

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
});

// Get mood trend prediction
router.get('/mood-trend', auth, async (req, res, next) => {
  try {
    const moodEntries = await MoodEntry.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30)
      .select('moodScore');

    const scores = moodEntries.map(e => e.moodScore).reverse();
    const trend = await mlEngine.predictMoodTrend(req.userId, scores);

    res.json({
      success: true,
      data: trend,
      historicalData: scores
    });
  } catch (error) {
    next(error);
  }
});

// Get resource recommendations
router.get('/resources', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const moodEntries = await MoodEntry.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(7)
      .select('moodScore');

    const moodTrend = moodEntries.map(e => e.moodScore);
    const recommendations = await mlEngine.recommendResources(
      req.userId,
      user.healthConditions,
      moodTrend
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
});

// Get engagement risk assessment
router.get('/engagement-risk', auth, async (req, res, next) => {
  try {
    const lastAppointment = await Appointment.findOne({
      userId: req.userId,
      status: 'completed'
    }).sort({ endTime: -1 });

    const totalAppointments = await Appointment.countDocuments({ userId: req.userId });
    const completedAppointments = await Appointment.countDocuments({
      userId: req.userId,
      status: 'completed'
    });

    const riskAssessment = await mlEngine.predictEngagementRisk(req.userId, {
      lastAppointment: lastAppointment?.endTime,
      appointmentRate: totalAppointments > 0 ? completedAppointments / totalAppointments : 0,
      subscription: req.user.subscription
    });

    res.json({
      success: true,
      data: riskAssessment
    });
  } catch (error) {
    next(error);
  }
});

// Get suggested treatment plan
router.get('/treatment-plan', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const treatmentPlan = await mlEngine.suggestTreatmentPlan(
      req.userId,
      user.healthConditions,
      user.therapistPreference
    );

    res.json({
      success: true,
      data: treatmentPlan
    });
  } catch (error) {
    next(error);
  }
});

// Detect crisis risk
router.get('/crisis-detection', auth, async (req, res, next) => {
  try {
    const moodEntries = await MoodEntry.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(7)
      .select('moodScore date');

    const recentEvents = []; // In production, fetch from user's event log

    const crisisRisk = await mlEngine.detectCrisisRisk(
      req.userId,
      moodEntries.map(e => e.moodScore),
      recentEvents
    );

    res.json({
      success: true,
      data: crisisRisk
    });
  } catch (error) {
    next(error);
  }
});

// Get weekly insights
router.get('/weekly-insights', auth, async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const moodEntries = await MoodEntry.find({
      userId: req.userId,
      date: { $gte: sevenDaysAgo }
    });

    const appointments = await Appointment.countDocuments({
      userId: req.userId,
      status: 'completed',
      endTime: { $gte: sevenDaysAgo }
    });

    const avgMood = moodEntries.length > 0
      ? moodEntries.reduce((sum, e) => sum + e.moodScore, 0) / moodEntries.length
      : 0;

    const avgSleep = moodEntries.length > 0
      ? moodEntries.reduce((sum, e) => sum + (e.sleepHours || 0), 0) / moodEntries.length
      : 0;

    const insights = await mlEngine.generateWeeklyInsights(req.userId, {
      moodEntries: moodEntries.map(e => e.moodScore),
      avgMood,
      avgSleep,
      therapySessions: appointments,
      communityEngagement: 0
    });

    res.json({
      success: true,
      data: insights,
      metadata: {
        period: 'last 7 days',
        entriesCount: moodEntries.length,
        appointmentsCount: appointments
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get personalized dashboard suggestions
router.get('/dashboard-suggestions', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const suggestions = [];

    // Get recommendations for different sections
    const therapists = await mlEngine.recommendTherapists(req.userId, {
      conditions: user.healthConditions
    });

    const resources = await mlEngine.recommendResources(req.userId, user.healthConditions, []);

    const moodEntries = await MoodEntry.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(7)
      .select('moodScore');

    const moodTrend = await mlEngine.predictMoodTrend(
      req.userId,
      moodEntries.map(e => e.moodScore)
    );

    suggestions.push({
      section: 'recommended_therapists',
      data: therapists,
      priority: 'high'
    });

    suggestions.push({
      section: 'recommended_resources',
      data: resources,
      priority: 'high'
    });

    suggestions.push({
      section: 'mood_insight',
      data: moodTrend,
      priority: 'medium'
    });

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
