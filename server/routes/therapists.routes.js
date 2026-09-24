const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

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

// ============ GET ALL THERAPISTS ============
router.get('/', async (req, res) => {
  try {
    const { specialty, language, minRating, maxPrice } = req.query;

    // Mock therapist data
    const mockTherapists = [
      {
        _id: '1',
        name: 'Dr. Priya Singh',
        specialty: 'Anxiety & Stress',
        rating: 4.9,
        reviews: 128,
        price: 500,
        image: '👩‍⚕️',
        bio: 'Specializes in anxiety management and stress relief with 8+ years experience',
        languages: ['English', 'Hindi'],
        availability: 'Available Today',
      },
      {
        _id: '2',
        name: 'Dr. Rajesh Patel',
        specialty: 'Depression',
        rating: 4.8,
        reviews: 95,
        price: 450,
        image: '👨‍⚕️',
        bio: 'Expert in depression and mood disorders with compassionate approach',
        languages: ['English', 'Gujarati'],
        availability: 'Available Tomorrow',
      },
      {
        _id: '3',
        name: 'Dr. Meera Kapoor',
        specialty: 'Relationships',
        rating: 5.0,
        reviews: 156,
        price: 600,
        image: '👩‍⚕️',
        bio: 'Relationship counselor helping couples and individuals build healthy connections',
        languages: ['English', 'Hindi', 'Punjabi'],
        availability: 'Available Today',
      },
      {
        _id: '4',
        name: 'Dr. Amit Sharma',
        specialty: 'PTSD & Trauma',
        rating: 4.7,
        reviews: 82,
        price: 550,
        image: '👨‍⚕️',
        bio: 'Trauma-informed therapist specializing in PTSD and recovery',
        languages: ['English', 'Hindi'],
        availability: 'Available in 2 days',
      },
    ];

    // Filter by specialty or language if provided
    let filtered = mockTherapists;
    if (specialty) {
      filtered = filtered.filter(t => t.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    if (language) {
      filtered = filtered.filter(t => t.languages.includes(language));
    }
    if (minRating) {
      filtered = filtered.filter(t => t.rating >= parseFloat(minRating));
    }
    if (maxPrice) {
      filtered = filtered.filter(t => t.price <= parseInt(maxPrice));
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
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

module.exports = router;
