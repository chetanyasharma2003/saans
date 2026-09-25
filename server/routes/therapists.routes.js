const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Therapist = require('../models/Therapist');
// Simplified for MVP - locationMatcher not needed yet
const logger = require('../utils/logger');

// Get nearby therapists based on user location
router.get(
  '/nearby',
  auth,
  [
    query('lat').isFloat({ min: -90, max: 90 }).toFloat(),
    query('lon').isFloat({ min: -180, max: 180 }).toFloat(),
    query('radius').optional().isInt({ min: 1, max: 500 }).toInt(),
    query('specialty').optional().isString().trim(),
    query('language').optional().isString().trim(),
    query('maxPrice').optional().isInt({ min: 1 }).toInt(),
    query('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { lat, lon, radius = 50, specialty, language, maxPrice, minRating } = req.query;
      const userCoordinates = [parseFloat(lon), parseFloat(lat)];

      const filters = {};
      if (specialty) filters.specialties = [specialty];
      if (language) filters.languages = [language];
      if (maxPrice) filters.maxPrice = maxPrice;
      if (minRating) filters.minRating = minRating;

      // MVP: Simple therapist search without complex geolocation
      let therapists = await Therapist.find({});

      // Apply filters
      if (specialty) {
        therapists = therapists.filter(t =>
          t.specialties && t.specialties.includes(specialty)
        );
      }
      if (language) {
        therapists = therapists.filter(t =>
          t.languages && t.languages.includes(language)
        );
      }
      if (maxPrice) {
        therapists = therapists.filter(t => t.hourlyRate <= maxPrice);
      }
      if (minRating) {
        therapists = therapists.filter(t => t.rating >= minRating);
      }

      // Add mock distances for now
      const enrichedTherapists = therapists.map(t => ({
        ...t.toObject(),
        distanceKm: Math.floor(Math.random() * 50) + 1
      }));

      logger.info(`Found ${enrichedTherapists.length} nearby therapists`, {
        userId: req.userId,
        lat,
        lon,
        radius
      });

      res.json({
        success: true,
        data: enrichedTherapists,
        count: enrichedTherapists.length
      });
    } catch (error) {
      next(error);
    }
  }
);

// Search therapists by name or keyword
router.get(
  '/search',
  auth,
  [query('q').notEmpty().isString().trim()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { q } = req.query;

      const therapists = await Therapist.find({
        $or: [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { specialties: { $regex: q, $options: 'i' } }
        ],
        isActive: true,
        'verification.status': 'approved'
      })
        .select('-license.licenseDocument')
        .limit(20);

      res.json({
        success: true,
        data: therapists,
        count: therapists.length
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get therapist profile by ID
router.get('/:id', auth, async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.params.id)
      .populate('ratings.reviews.userId', 'firstName lastName profileImage')
      .select('-license.licenseDocument');

    if (!therapist || !therapist.isActive) {
      return res.status(404).json({ success: false, error: 'Therapist not found' });
    }

    logger.info(`Therapist profile viewed`, { therapistId: req.params.id, userId: req.userId });

    res.json({ success: true, data: therapist });
  } catch (error) {
    next(error);
  }
});

// Get all specialties
router.get('/options/specialties', async (req, res) => {
  const specialties = [
    'anxiety',
    'depression',
    'trauma',
    'ptsd',
    'relationships',
    'grief',
    'stress',
    'addiction',
    'eating-disorders',
    'sleep-issues',
    'self-esteem',
    'career-counseling',
    'parenting',
    'teen-issues',
    'family-therapy'
  ];

  res.json({ success: true, data: specialties });
});

// Get all languages
router.get('/options/languages', async (req, res) => {
  const languages = ['English', 'Hindi', 'Spanish', 'French', 'Marathi', 'Tamil', 'Telugu'];

  res.json({ success: true, data: languages });
});

// Get top rated therapists
router.get(
  '/featured/top-rated',
  [query('limit').optional().isInt({ min: 1, max: 50 }).toInt()],
  async (req, res, next) => {
    try {
      const limit = req.query.limit || 10;

      const therapists = await Therapist.find({
        isActive: true,
        'verification.status': 'approved',
        'ratings.count': { $gte: 5 }
      })
        .sort({ 'ratings.average': -1 })
        .limit(limit)
        .select('-license.licenseDocument');

      res.json({ success: true, data: therapists, count: therapists.length });
    } catch (error) {
      next(error);
    }
  }
);

// Submit review for therapist
router.post(
  '/:id/review',
  auth,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('text').optional().isString().trim().isLength({ max: 500 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { rating, text } = req.body;
      const therapistId = req.params.id;

      const therapist = await Therapist.findById(therapistId);
      if (!therapist) {
        return res.status(404).json({ success: false, error: 'Therapist not found' });
      }

      // Check if user already reviewed
      const existingReview = therapist.ratings.reviews.find((r) => r.userId.equals(req.userId));
      if (existingReview) {
        return res.status(400).json({ success: false, error: 'You already reviewed this therapist' });
      }

      therapist.ratings.reviews.push({
        userId: req.userId,
        rating,
        text: text || '',
        date: new Date(),
        verified: true // User authenticated
      });

      await therapist.save();

      logger.info(`Review submitted for therapist`, {
        therapistId,
        userId: req.userId,
        rating
      });

      res.json({
        success: true,
        message: 'Review submitted successfully',
        data: therapist.ratings
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get therapist availability
router.get('/:id/availability', async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.params.id).select('availability pricing');

    if (!therapist) {
      return res.status(404).json({ success: false, error: 'Therapist not found' });
    }

    res.json({
      success: true,
      data: {
        availability: therapist.availability,
        pricing: therapist.pricing
      }
    });
  } catch (error) {
    next(error);
  }
});

// Filter therapists with multiple criteria
router.post(
  '/filter',
  auth,
  [
    body('specialties').optional().isArray(),
    body('languages').optional().isArray(),
    body('minRating').optional().isFloat({ min: 0, max: 5 }),
    body('maxPrice').optional().isInt({ min: 1 }),
    body('sessionFormat').optional().isArray(),
    body('lat').isFloat({ min: -90, max: 90 }).toFloat(),
    body('lon').isFloat({ min: -180, max: 180 }).toFloat(),
    body('radius').optional().isInt({ min: 1, max: 500 }).toInt()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { specialties, languages, minRating, maxPrice, sessionFormat, lat, lon, radius = 50 } =
        req.body;

      const filters = {};
      if (specialties) filters.specialties = specialties;
      if (languages) filters.languages = languages;
      if (minRating) filters.minRating = minRating;
      if (maxPrice) filters.maxPrice = maxPrice;
      if (sessionFormat) filters.sessionFormat = sessionFormat;

      const therapists = await locationMatcher.findTherapistsByMultipleCriteria(
        filters,
        [lon, lat],
        radius
      );

      res.json({
        success: true,
        data: therapists,
        count: therapists.length,
        filters: req.body
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
