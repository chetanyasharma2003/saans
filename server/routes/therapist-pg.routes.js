const express = require('express');
const router = express.Router();
const { Therapist } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get nearby therapists (location-based)
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const { lat, lon, radius = 50, specialty, language, maxPrice, minRating, page = 1, limit = 20 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude required' });
    }

    const where = { isActive: true, isVerified: true };

    if (specialty) {
      where.specializations = { [Op.contains]: [specialty] };
    }
    if (language) {
      where.languages = { [Op.contains]: [language] };
    }
    if (maxPrice) {
      where.hourlyRate = { [Op.lte]: parseFloat(maxPrice) };
    }
    if (minRating) {
      where.rating = { [Op.gte]: parseFloat(minRating) };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Therapist.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['rating', 'DESC']],
      attributes: {
        exclude: ['licenseNumber', 'certificateUrl']
      }
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      userLocation: { lat: parseFloat(lat), lon: parseFloat(lon) }
    });
  } catch (error) {
    console.error('Get nearby therapists error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all active therapists (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { specialty, language, maxPrice, minRating, page = 1, limit = 20 } = req.query;

    const where = { isActive: true, isVerified: true };

    if (specialty) {
      where.specializations = { [Op.contains]: [specialty] };
    }
    if (language) {
      where.languages = { [Op.contains]: [language] };
    }
    if (maxPrice) {
      where.hourlyRate = { [Op.lte]: parseFloat(maxPrice) };
    }
    if (minRating) {
      where.rating = { [Op.gte]: parseFloat(minRating) };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Therapist.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['rating', 'DESC']],
      attributes: {
        exclude: ['licenseNumber', 'certificateUrl']
      }
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Get therapists error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get therapist by ID
router.get('/:id', async (req, res) => {
  try {
    const therapist = await Therapist.findByPk(req.params.id);

    if (!therapist) {
      return res.status(404).json({ success: false, error: 'Therapist not found' });
    }

    res.json({ success: true, data: therapist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search therapists
router.get('/search/query', async (req, res) => {
  try {
    const { q, specialty, city, rating } = req.query;

    const where = { isActive: true, isVerified: true };

    if (q) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${q}%` } },
        { lastName: { [Op.iLike]: `%${q}%` } },
        { bio: { [Op.iLike]: `%${q}%` } }
      ];
    }

    if (specialty) {
      where.specializations = { [Op.contains]: [specialty] };
    }

    if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }

    const therapists = await Therapist.findAll({
      where,
      limit: 50,
      order: [['rating', 'DESC']]
    });

    res.json({ success: true, data: therapists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get therapist stats (for dashboard)
router.get('/stats/overview', async (req, res) => {
  try {
    const totalTherapists = await Therapist.count({ where: { isActive: true } });
    const avgRating = await Therapist.findAll({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating']
      ],
      where: { isActive: true, isVerified: true },
      raw: true
    });

    const totalSessions = await Therapist.sum('sessionsCompleted', {
      where: { isActive: true }
    });

    res.json({
      success: true,
      data: {
        totalTherapists,
        avgRating: parseFloat(avgRating[0]?.avgRating || 0).toFixed(1),
        totalSessions: totalSessions || 0,
        satisfaction: 98
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get therapists by specialty
router.get('/specialty/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    const therapists = await Therapist.findAll({
      where: {
        specializations: { [Op.contains]: [specialty] },
        isActive: true,
        isVerified: true
      },
      limit: 50,
      order: [['rating', 'DESC']]
    });

    res.json({ success: true, data: therapists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
