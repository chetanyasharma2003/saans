const groqAiService = require('../../services/groqAiService');

describe('Groq AI Service', () => {
  describe('Crisis Detection', () => {
    test('should detect crisis keywords', () => {
      const result = groqAiService.detectCrisisIndicators('I want to hurt myself');
      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.resources).toBeDefined();
      expect(result.resources.length).toBeGreaterThan(0);
    });

    test('should not flag non-crisis messages', () => {
      const result = groqAiService.detectCrisisIndicators('I am feeling a bit down today');
      expect(result.isCrisis).toBe(false);
    });

    test('should include all crisis resources', () => {
      const result = groqAiService.detectCrisisIndicators('I want to die');
      const resourceNames = result.resources.map(r => r.name);
      expect(resourceNames).toContain('🆘 AASRA');
      expect(resourceNames).toContain('📞 iCall');
    });
  });

  describe('Sentiment Analysis', () => {
    test('should analyze sentiment of text', async () => {
      const result = await groqAiService.analyzeSentiment('I am feeling great today!');
      expect(result).toHaveProperty('sentiment');
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
    });

    test('should return neutral for empty text', async () => {
      const result = await groqAiService.analyzeSentiment('');
      expect(result.sentiment).toBe('neutral');
      expect(result.confidence).toBe(0);
    });
  });

  describe('Mood Analysis', () => {
    test('should analyze mood trends', async () => {
      const moodEntries = [
        { mood: 3, notes: 'Feeling okay', createdAt: '2026-09-20' },
        { mood: 4, notes: 'Better today', createdAt: '2026-09-21' },
        { mood: 5, notes: 'Excellent!', createdAt: '2026-09-22' }
      ];

      const result = await groqAiService.analyzeMoodTrends(moodEntries);
      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.entriesAnalyzed).toBe(3);
    });

    test('should handle empty mood entries', async () => {
      const result = await groqAiService.analyzeMoodTrends([]);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Counselor Response', () => {
    test('should generate compassionate responses', async () => {
      const response = await groqAiService.generateCounselorResponse('I am anxious');
      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
      expect(response.message.length).toBeGreaterThan(0);
    });

    test('should always return a message', async () => {
      const response = await groqAiService.generateCounselorResponse('test');
      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();
    });
  });

  describe('Wellness Tips', () => {
    test('should generate wellness tips', async () => {
      const tip = await groqAiService.generateWellnessTip();
      expect(tip.success).toBe(true);
      expect(tip.tip).toBeDefined();
      expect(tip.tip.length).toBeGreaterThan(0);
    });
  });
});
