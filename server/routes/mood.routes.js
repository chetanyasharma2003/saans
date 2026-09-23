const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');
const { authenticateToken } = require('../middleware/auth');

// ============ GET MOOD ENTRIES ============
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId: req.userId,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: entries,
      total: entries.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET RECENT MOOD ============
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await MoodEntry.findOne({
      userId: req.userId,
      date: { $gte: today },
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET MOOD STATISTICS ============
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId: req.userId,
      date: { $gte: startDate },
    });

    if (entries.length === 0) {
      return res.json({
        success: true,
        data: {
          today: null,
          thisWeekAverage: 0,
          average: 0,
          streak: 0,
          totalEntries: 0,
        },
      });
    }

    const moods = entries.map(e => e.mood);
    const average = moods.reduce((a, b) => a + b, 0) / moods.length;

    // Week average
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEntries = entries.filter(e => e.date >= weekStart);
    const weekAverage = weekEntries.length > 0
      ? weekEntries.reduce((sum, e) => sum + e.mood, 0) / weekEntries.length
      : 0;

    // Today's mood
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntry = entries.find(e => new Date(e.date).toDateString() === today.toDateString());

    res.json({
      success: true,
      data: {
        today: todayEntry?.mood || null,
        thisWeekAverage: weekAverage.toFixed(1),
        average: average.toFixed(1),
        streak: calculateStreak(entries),
        totalEntries: entries.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CREATE MOOD ENTRY ============
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { mood, activities, notes, tags } = req.body;

    if (!mood || mood < 1 || mood > 10) {
      return res.status(400).json({ error: 'Mood must be between 1 and 10' });
    }

    const entry = new MoodEntry({
      userId: req.userId,
      mood,
      moodLabel: getMoodLabel(mood),
      intensity: mood <= 4 ? 'low' : mood <= 7 ? 'medium' : 'high',
      activities: activities || [],
      notes,
      tags: tags || [],
      date: new Date(),
      time: new Date().toLocaleTimeString(),
    });

    await entry.save();

    res.status(201).json({
      success: true,
      message: 'Mood entry created',
      data: entry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE MOOD ENTRY ============
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await MoodEntry.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }

    const { mood, activities, notes, tags } = req.body;

    if (mood) {
      entry.mood = mood;
      entry.moodLabel = getMoodLabel(mood);
      entry.intensity = mood <= 4 ? 'low' : mood <= 7 ? 'medium' : 'high';
    }
    if (activities) entry.activities = activities;
    if (notes) entry.notes = notes;
    if (tags) entry.tags = tags;

    await entry.save();

    res.json({
      success: true,
      message: 'Mood entry updated',
      data: entry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DELETE MOOD ENTRY ============
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await MoodEntry.deleteOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }

    res.json({
      success: true,
      message: 'Mood entry deleted',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ HELPER FUNCTIONS ============

function getMoodLabel(mood) {
  const labels = ['', 'Terrible', 'Bad', 'Sad', 'Down', 'Neutral', 'OK', 'Good', 'Great', 'Excellent', 'Amazing'];
  return labels[mood] || 'Neutral';
}

function calculateStreak(entries) {
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toDateString();
    const hasEntry = entries.some(e => new Date(e.date).toDateString() === dateStr);

    if (hasEntry) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

module.exports = router;
