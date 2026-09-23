const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// ============ GET ALL THERAPISTS ============
router.get('/', async (req, res) => {
  try {
    const { specialty, language, minRating, maxPrice } = req.query;
    const query = { role: 'therapist', status: 'active' };

    if (specialty) query['therapistProfile.specialties'] = specialty;
    if (language) query['therapistProfile.languages'] = language;
    if (minRating) query['therapistProfile.rating'] = { $gte: parseFloat(minRating) };
    if (maxPrice) query['therapistProfile.price'] = { $lte: parseInt(maxPrice) };

    const therapists = await User.find(query).select('-password');

    res.json({
      success: true,
      data: therapists,
      total: therapists.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET SINGLE THERAPIST ============
router.get('/:id', async (req, res) => {
  try {
    const therapist = await User.findOne({
      _id: req.params.id,
      role: 'therapist',
    }).select('-password');

    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }

    res.json({
      success: true,
      data: therapist,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET SPECIALTIES ============
router.get('/options/specialties', async (req, res) => {
  try {
    const specialties = [
      { id: '1', name: 'Anxiety & Stress', count: 45 },
      { id: '2', name: 'Depression', count: 38 },
      { id: '3', name: 'Relationships', count: 42 },
      { id: '4', name: 'PTSD & Trauma', count: 28 },
      { id: '5', name: 'Addiction', count: 22 },
      { id: '6', name: 'Grief & Loss', count: 18 },
    ];

    res.json({
      success: true,
      data: specialties,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET LANGUAGES ============
router.get('/options/languages', async (req, res) => {
  try {
    const languages = ['English', 'Hindi', 'Spanish', 'Mandarin', 'French', 'German'];

    res.json({
      success: true,
      data: languages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
