const axios = require('axios');
const logger = require('../utils/logger');

class GroqAiService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseUrl = 'https://api.groq.com/openai/v1';
    this.model = 'mixtral-8x7b-32768';
  }

  async makeRequest(messages, temperature = 0.7, maxTokens = 500) {
    try {
      if (!this.apiKey) {
        logger.warn('GROQ_API_KEY not set, using fallback responses');
        return null;
      }

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('Groq API Error', {
        message: error.message,
        status: error.response?.status
      });
      return null;
    }
  }

  async generateCounselorResponse(userMessage, userContext = {}) {
    try {
      const systemPrompt = `You are SAANS - a compassionate AI mental health counselor.

GUIDELINES:
- Provide supportive, non-judgmental guidance
- Listen actively and empathetically
- Never diagnose or prescribe medication
- Encourage professional therapy when needed
- Be culturally sensitive (India-aware)
- Keep responses concise (under 300 words)
- Use simple, clear language
- Show genuine care and understanding

RESPONSE FORMAT:
- Start with validation of feelings
- Ask thoughtful follow-up questions
- Suggest positive coping strategies
- Encourage self-care
- Offer hope and support`;

      const aiResponse = await this.makeRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ], 0.8, 400);

      if (aiResponse) {
        return {
          success: true,
          message: aiResponse,
          source: 'groq',
          timestamp: new Date()
        };
      }

      // Fallback response
      return {
        success: true,
        message: "I hear you. Your feelings are valid and important. Would you like to talk more about what's troubling you? Sometimes sharing helps us feel less alone.",
        source: 'fallback',
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Counselor response generation failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        fallback: "Thank you for trusting me with this. Have you considered reaching out to a therapist? They can provide professional support."
      };
    }
  }

  async analyzeMoodTrends(moodEntries) {
    try {
      if (moodEntries.length === 0) {
        return {
          success: false,
          error: 'No mood entries to analyze'
        };
      }

      const moodSummary = moodEntries
        .slice(0, 14)
        .map(e => `${e.createdAt?.substring(0, 10) || 'N/A'}: Mood ${e.mood}/5${e.notes ? ` - "${e.notes}"` : ''}`)
        .join('\n');

      const prompt = `Analyze these mood entries and provide insights:\n\n${moodSummary}\n\nProvide:
1. Overall trend (improving/declining/stable)
2. Key patterns observed
3. 2-3 positive coping suggestions
Keep it brief and encouraging.`;

      const analysis = await this.makeRequest([
        {
          role: 'system',
          content: 'You are a mental health analyst. Provide brief, supportive insights on mood patterns.'
        },
        { role: 'user', content: prompt }
      ], 0.6, 300);

      if (analysis) {
        return {
          success: true,
          analysis,
          entriesAnalyzed: moodEntries.length
        };
      }

      return {
        success: true,
        analysis: "Your mood shows natural fluctuations, which is healthy. Notice what activities help you feel better and incorporate more of those.",
        entriesAnalyzed: moodEntries.length
      };
    } catch (error) {
      logger.error('Mood analysis failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  async detectCrisisIndicators(userMessage) {
    const crisisKeywords = [
      'suicide', 'kill myself', 'self harm', 'hurt myself',
      'overdose', 'cutting', 'giving up', 'no point', 'end it',
      'won\'t make it', 'want to die', 'better off dead'
    ];

    const messageLC = userMessage.toLowerCase();
    const foundKeywords = crisisKeywords.filter(keyword => messageLC.includes(keyword));

    if (foundKeywords.length > 0) {
      logger.warn('Crisis indicators detected', { keywords: foundKeywords });
      return {
        isCrisis: true,
        severity: 'high',
        message: '🚨 I\'m concerned about what you\'ve shared. Your safety is important to us. Please reach out to crisis support immediately.',
        resources: [
          {
            name: '🆘 AASRA',
            phone: '9820466726',
            description: 'Suicide prevention hotline',
            available: '24/7'
          },
          {
            name: '📞 iCall',
            phone: '9152987821',
            description: 'Emotional support',
            available: '24/7'
          },
          {
            name: '❤️ Vandrevala Foundation',
            phone: '9999 666 555',
            description: 'Mental health support',
            available: '24/7'
          },
          {
            name: '🏥 NIMHANS Crisis',
            phone: '080-4611 9999',
            description: 'Emergency mental health',
            available: '24/7'
          }
        ]
      };
    }

    return { isCrisis: false };
  }

  async analyzeSentiment(text) {
    try {
      if (!text || text.trim().length === 0) {
        return { sentiment: 'neutral', confidence: 0 };
      }

      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'Analyze sentiment. Respond with ONLY one word: positive, negative, or neutral'
        },
        { role: 'user', content: text }
      ], 0.3, 10);

      if (response) {
        const sentiment = response.toLowerCase().trim();
        if (['positive', 'negative', 'neutral'].includes(sentiment)) {
          return {
            sentiment,
            confidence: 0.85,
            timestamp: new Date()
          };
        }
      }

      return {
        sentiment: 'neutral',
        confidence: 0.5,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Sentiment analysis failed', { error: error.message });
      return {
        sentiment: 'neutral',
        confidence: 0,
        error: error.message
      };
    }
  }

  async generateWellnessTip() {
    try {
      const prompt = `Generate ONE mental wellness tip for someone struggling with stress or anxiety.
Make it actionable, positive, and under 50 words. No bullet points, just plain text.`;

      const tip = await this.makeRequest([
        {
          role: 'system',
          content: 'You are a mental wellness expert. Provide practical, encouraging tips.'
        },
        { role: 'user', content: prompt }
      ], 0.9, 100);

      return {
        success: true,
        tip: tip || "Take a deep breath. You're doing your best, and that's enough for today.",
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Wellness tip generation failed', { error: error.message });
      return {
        success: true,
        tip: "Remember to take care of yourself today. You deserve kindness and compassion - especially from yourself.",
        timestamp: new Date()
      };
    }
  }

  async suggestTherapist(userSituation) {
    try {
      const prompt = `Based on this situation: "${userSituation}"
Suggest what type of therapist might help (max 2 types) and 1-2 sentence reasoning.
Format: "Type: [therapist type] - Reason: [brief reason]"`;

      const suggestion = await this.makeRequest([
        {
          role: 'system',
          content: 'You are a mental health advisor. Suggest appropriate therapist types briefly.'
        },
        { role: 'user', content: prompt }
      ], 0.7, 150);

      return {
        success: true,
        suggestion: suggestion || "A therapist specializing in cognitive behavioral therapy could help you work through this.",
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Therapist suggestion failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new GroqAiService();
