const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const MentalHealthResource = require('../models/MentalHealthResource');
const logger = require('../utils/logger');

// Get all conditions
router.get('/conditions', async (req, res, next) => {
  try {
    const resources = await MentalHealthResource.find({ status: 'published' })
      .select('condition.name condition.description condition.prevalence');

    const conditions = resources.map(r => ({
      name: r.condition.name,
      description: r.condition.description,
      prevalence: r.condition.prevalence
    }));

    res.json({ success: true, data: conditions });
  } catch (error) {
    next(error);
  }
});

// Get single resource guide
router.get('/guide/:conditionName', auth, async (req, res, next) => {
  try {
    const resource = await MentalHealthResource.findOne({
      'condition.name': new RegExp(`^${req.params.conditionName}$`, 'i'),
      status: 'published'
    });

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    // Increment views
    resource.views += 1;
    await resource.save();

    // Log access
    logger.info('Resource guide viewed', {
      condition: resource.condition.name,
      userId: req.user._id
    });

    res.json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
});

// Get comprehensive list of all guides
router.get('/all-guides', async (req, res, next) => {
  try {
    const resources = await MentalHealthResource.find({ status: 'published' })
      .select('condition.name condition.description condition.prevalence views shares saves')
      .sort({ views: -1 })
      .limit(100);

    res.json({
      success: true,
      data: resources,
      count: resources.length
    });
  } catch (error) {
    next(error);
  }
});

// Search resources
router.get('/search', [
  query('q').notEmpty().isString().trim()
], async (req, res, next) => {
  try {
    const { q } = req.query;

    const resources = await MentalHealthResource.find({
      $text: { $search: q },
      status: 'published'
    })
      .select('condition.name condition.description symptoms treatments')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
});

// Get resources by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const categoryMap = {
      'anxiety': ['anxiety', 'panic', 'phobia'],
      'depression': ['depression', 'mood'],
      'trauma': ['trauma', 'ptsd'],
      'relationships': ['relationships', 'family', 'couples'],
      'work': ['work', 'stress', 'burnout'],
      'sleep': ['sleep', 'insomnia'],
      'eating': ['eating-disorders', 'anorexia', 'bulimia'],
      'addiction': ['addiction', 'substance']
    };

    const keywords = categoryMap[req.params.category] || [req.params.category];

    const resources = await MentalHealthResource.find({
      'condition.name': { $in: keywords },
      status: 'published'
    })
      .select('condition.name condition.description symptoms treatments')
      .limit(50);

    res.json({
      success: true,
      data: resources,
      category: req.params.category
    });
  } catch (error) {
    next(error);
  }
});

// Get quick tips for condition
router.get('/tips/:conditionName', auth, async (req, res, next) => {
  try {
    const resource = await MentalHealthResource.findOne({
      'condition.name': new RegExp(`^${req.params.conditionName}$`, 'i'),
      status: 'published'
    }).select('selfHelpTips lifestyleChanges');

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Tips not found' });
    }

    res.json({
      success: true,
      data: {
        condition: req.params.conditionName,
        tips: resource.selfHelpTips,
        lifestyleChanges: resource.lifestyleChanges
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get treatments for condition
router.get('/treatments/:conditionName', async (req, res, next) => {
  try {
    const resource = await MentalHealthResource.findOne({
      'condition.name': new RegExp(`^${req.params.conditionName}$`, 'i'),
      status: 'published'
    }).select('treatments');

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Treatments not found' });
    }

    res.json({
      success: true,
      data: {
        condition: req.params.conditionName,
        treatments: resource.treatments
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get crisis resources for condition
router.get('/crisis/:conditionName', async (req, res, next) => {
  try {
    const resource = await MentalHealthResource.findOne({
      'condition.name': new RegExp(`^${req.params.conditionName}$`, 'i'),
      status: 'published'
    }).select('crisisResources whenToSeekHelp');

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Crisis resources not found' });
    }

    res.json({
      success: true,
      data: {
        condition: req.params.conditionName,
        redFlags: resource.whenToSeekHelp?.redFlags || [],
        emergencySignals: resource.whenToSeekHelp?.emergencySignals || [],
        crisisResources: resource.crisisResources || []
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get FAQs for condition
router.get('/faqs/:conditionName', async (req, res, next) => {
  try {
    const resource = await MentalHealthResource.findOne({
      'condition.name': new RegExp(`^${req.params.conditionName}$`, 'i'),
      status: 'published'
    }).select('faqs');

    if (!resource) {
      return res.status(404).json({ success: false, error: 'FAQs not found' });
    }

    res.json({
      success: true,
      data: {
        condition: req.params.conditionName,
        faqs: resource.faqs || []
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mark resource as helpful
router.post('/mark-helpful/:id', auth, async (req, res, next) => {
  try {
    const resource = await MentalHealthResource.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'quality.userHelpfulCount': 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    res.json({ success: true, message: 'Thank you for your feedback' });
  } catch (error) {
    next(error);
  }
});

// Get related conditions
router.get('/related/:conditionName', async (req, res, next) => {
  try {
    const resource = await MentalHealthResource.findOne({
      'condition.name': new RegExp(`^${req.params.conditionName}$`, 'i')
    }).select('relatedConditions');

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    const relatedResources = await MentalHealthResource.find({
      'condition.name': { $in: resource.relatedConditions || [] },
      status: 'published'
    })
      .select('condition.name condition.description')
      .limit(5);

    res.json({
      success: true,
      data: relatedResources
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
