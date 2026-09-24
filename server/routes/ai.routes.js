const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// ============ AI CHAT ENDPOINT ============
router.post('/chat', authenticateToken, async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Mock AI response for now (would integrate with Groq/OpenAI later)
    const mockResponses = [
      'I understand you\'re going through something challenging. It\'s important to remember that you\'re not alone in this journey. Would you like to talk more about what\'s on your mind?',
      'That\'s a great observation. Many people experience similar feelings. Have you considered speaking with a therapist about this?',
      'Your wellbeing is important. What specific areas would you like support with today?',
      'Thank you for sharing. It takes courage to open up. Let\'s explore this together - what would help you feel better right now?',
      'I hear you. Mental health is a journey, and every step forward counts. Would you like resources or professional help?'
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    res.json({
      success: true,
      message: randomResponse,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
