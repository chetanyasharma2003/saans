const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const groqAiService = require('../services/groqAiService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// AI Counselor Chat
router.post('/chat', authenticateToken, async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    logger.info('AI chat request', {
      userId: req.userId,
      messageLength: message.length
    });

    // Check for crisis indicators first
    const crisisCheck = await groqAiService.detectCrisisIndicators(message);
    if (crisisCheck.isCrisis) {
      logger.warn('Crisis detected', { userId: req.userId });
      return res.json({
        success: true,
        isCrisis: true,
        severity: crisisCheck.severity,
        message: crisisCheck.message,
        resources: crisisCheck.resources
      });
    }

    // Get AI response
    const aiResponse = await groqAiService.generateCounselorResponse(message, {
      userId: req.userId
    });

    if (!aiResponse.success && aiResponse.error) {
      logger.error('AI response generation failed', {
        error: aiResponse.error
      });
    }

    res.json({
      success: true,
      message: aiResponse.message,
      source: aiResponse.source,
      isCrisis: false,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('AI chat error', { error: error.message });
    next(error);
  }
});

// Analyze Mood Trends
router.post('/analyze-mood', authenticateToken, async (req, res, next) => {
  try {
    const { moodEntries } = req.body;

    if (!Array.isArray(moodEntries) || moodEntries.length === 0) {
      return res.status(400).json({
        error: 'Mood entries array required (minimum 1 entry)'
      });
    }

    if (moodEntries.length > 30) {
      return res.status(400).json({
        error: 'Maximum 30 entries per analysis'
      });
    }

    logger.info('Mood analysis request', {
      userId: req.userId,
      entryCount: moodEntries.length
    });

    const analysis = await groqAiService.analyzeMoodTrends(moodEntries);

    if (!analysis.success) {
      return res.status(500).json(analysis);
    }

    res.json({
      success: true,
      analysis: analysis.analysis,
      entriesAnalyzed: analysis.entriesAnalyzed,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Mood analysis error', { error: error.message });
    next(error);
  }
});

// Sentiment Analysis
router.post('/sentiment', authenticateToken, async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for sentiment analysis' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text exceeds 5000 character limit' });
    }

    const result = await groqAiService.analyzeSentiment(text);

    res.json({
      success: true,
      sentiment: result.sentiment,
      confidence: result.confidence,
      timestamp: result.timestamp
    });
  } catch (error) {
    logger.error('Sentiment analysis error', { error: error.message });
    next(error);
  }
});

// Get Wellness Tip
router.get('/wellness-tip', authenticateToken, async (req, res, next) => {
  try {
    const tip = await groqAiService.generateWellnessTip();

    res.json({
      success: true,
      tip: tip.tip,
      timestamp: tip.timestamp
    });
  } catch (error) {
    logger.error('Wellness tip generation error', { error: error.message });
    next(error);
  }
});

// Suggest Therapist Based on Situation
router.post('/suggest-therapist', authenticateToken, async (req, res, next) => {
  try {
    const { situation } = req.body;

    if (!situation || situation.trim().length === 0) {
      return res.status(400).json({
        error: 'Situation description is required'
      });
    }

    if (situation.length > 1000) {
      return res.status(400).json({
        error: 'Situation description exceeds 1000 characters'
      });
    }

    logger.info('Therapist suggestion request', {
      userId: req.userId,
      situationLength: situation.length
    });

    const suggestion = await groqAiService.suggestTherapist(situation);

    if (!suggestion.success) {
      return res.status(500).json(suggestion);
    }

    res.json({
      success: true,
      suggestion: suggestion.suggestion,
      timestamp: suggestion.timestamp
    });
  } catch (error) {
    logger.error('Therapist suggestion error', { error: error.message });
    next(error);
  }
});

// Send Wellness Email
router.post('/send-wellness-email', authenticateToken, async (req, res, next) => {
  try {
    const { emailType, recipient } = req.body;

    if (!emailType || !recipient) {
      return res.status(400).json({
        error: 'emailType and recipient are required'
      });
    }

    const validTypes = [
      'wellness-tip',
      'mood-reminder',
      'appointment-reminder',
      'weekly-report'
    ];

    if (!validTypes.includes(emailType)) {
      return res.status(400).json({
        error: `Invalid emailType. Must be one of: ${validTypes.join(', ')}`
      });
    }

    logger.info('Wellness email request', {
      userId: req.userId,
      emailType,
      recipient
    });

    // For now, just return success (email would be sent in production)
    res.json({
      success: true,
      message: `${emailType} email prepared for ${recipient}`,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Wellness email error', { error: error.message });
    next(error);
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'SAANS AI Service',
    status: 'operational',
    groqConfigured: !!process.env.GROQ_API_KEY,
    timestamp: new Date()
  });
});

module.exports = router;
