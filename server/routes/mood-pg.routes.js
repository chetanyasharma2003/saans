const express = require('express');
const router = express.Router();
const { MoodEntry } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get mood entries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { days = 30, limit = 50 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await MoodEntry.findAll({
      where: {
        userId: req.userId,
        date: { [Op.gte]: startDate },
      },
      order: [['date', 'DESC']],
      limit: parseInt(limit),
    });

    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get mood stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await MoodEntry.findAll({
      where: {
        userId: req.userId,
        date: { [Op.gte]: startDate },
      },
    });

    if (entries.length === 0) {
      return res.json({
        success: true,
        data: {
          averageMood: 0,
          averageStress: 0,
          averageAnxiety: 0,
          averageEnergy: 0,
          totalEntries: 0,
          trend: 'No data',
          moodBreakdown: {},
        },
      });
    }

    const moodValues = entries.map(e => e.mood).filter(m => m);
    const stressValues = entries.map(e => e.stress).filter(s => s);
    const anxietyValues = entries.map(e => e.anxiety).filter(a => a);
    const energyValues = entries.map(e => e.energy).filter(e => e);

    const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b) / arr.length).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        averageMood: parseFloat(avg(moodValues)),
        averageStress: parseFloat(avg(stressValues)),
        averageAnxiety: parseFloat(avg(anxietyValues)),
        averageEnergy: parseFloat(avg(energyValues)),
        totalEntries: entries.length,
        moodBreakdown: {
          veryBad: moodValues.filter(m => m === 1).length,
          bad: moodValues.filter(m => m === 2).length,
          neutral: moodValues.filter(m => m === 3).length,
          good: moodValues.filter(m => m === 4).length,
          excellent: moodValues.filter(m => m === 5).length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create mood entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { mood, energy, stress, anxiety, notes, activities, sleepHours, exerciseMinutes } = req.body;

    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ success: false, error: 'Mood must be between 1 and 5' });
    }

    const entry = await MoodEntry.create({
      userId: req.userId,
      mood,
      energy: energy || null,
      stress: stress || null,
      anxiety: anxiety || null,
      notes,
      activities: activities || [],
      sleepHours: sleepHours || null,
      exerciseMinutes: exerciseMinutes || null,
      date: new Date(),
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get mood entry by date
router.get('/date/:date', authenticateToken, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const entry = await MoodEntry.findOne({
      where: {
        userId: req.userId,
        date: { [Op.gte]: date, [Op.lt]: nextDate },
      },
    });

    if (!entry) {
      return res.status(404).json({ success: false, error: 'No mood entry for this date' });
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
