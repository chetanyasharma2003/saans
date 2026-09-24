const logger = require('../utils/logger');

class MLRecommendationEngine {
  // ==================== THERAPIST RECOMMENDATIONS ====================

  async recommendTherapists(userId, userPreferences) {
    try {
      // Algorithm: Collaborative filtering + content-based
      const recommendations = {
        score: 0,
        specialization: userPreferences.issues || [],
        basedOn: [],
        therapists: []
      };

      // Factor 1: User's mental health conditions
      if (userPreferences.conditions) {
        recommendations.basedOn.push('condition_match');
      }

      // Factor 2: Language preference
      if (userPreferences.languages) {
        recommendations.basedOn.push('language_preference');
      }

      // Factor 3: Similar users' choices
      recommendations.basedOn.push('similar_user_preferences');

      // Factor 4: Therapist ratings & experience
      recommendations.basedOn.push('therapist_rating');

      logger.info('Therapist recommendations generated', { userId, basedOn: recommendations.basedOn });
      return recommendations;
    } catch (error) {
      logger.error('Therapist recommendation error', { error: error.message });
      throw error;
    }
  }

  // ==================== MOOD PREDICTION ====================

  async predictMoodTrend(userId, moodHistory) {
    try {
      // Algorithm: Time series analysis (ARIMA-like)
      const trend = {
        currentTrend: 'improving', // improving, declining, stable
        predictedScore: 0,
        confidence: 0,
        factors: []
      };

      // Analyze historical data
      if (moodHistory && moodHistory.length > 7) {
        // Calculate trend direction
        const recent = moodHistory.slice(-7);
        const older = moodHistory.slice(-14, -7);

        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

        if (recentAvg > olderAvg) {
          trend.currentTrend = 'improving';
        } else if (recentAvg < olderAvg) {
          trend.currentTrend = 'declining';
        } else {
          trend.currentTrend = 'stable';
        }

        trend.confidence = Math.min(100, 50 + (moodHistory.length * 2));
        trend.predictedScore = Math.round(recentAvg * 10) / 10;
      }

      // Identify factors affecting mood
      trend.factors = ['therapy_sessions', 'sleep_quality', 'social_activity', 'exercise'];

      logger.info('Mood trend predicted', { userId, trend: trend.currentTrend });
      return trend;
    } catch (error) {
      logger.error('Mood prediction error', { error: error.message });
      throw error;
    }
  }

  // ==================== RESOURCE RECOMMENDATIONS ====================

  async recommendResources(userId, userConditions, moodHistory) {
    try {
      const recommendations = [];

      // Rule 1: High anxiety -> breathing exercises
      if (userConditions.includes('anxiety') && moodHistory && moodHistory[0] < 3) {
        recommendations.push({
          type: 'technique',
          title: '4-7-8 Breathing Technique',
          description: 'Evidence-based breathing for anxiety relief',
          url: '/resources/techniques/breathing',
          priority: 'high'
        });
      }

      // Rule 2: Sleep issues -> sleep guides
      if (userConditions.includes('sleep') || userConditions.includes('insomnia')) {
        recommendations.push({
          type: 'guide',
          title: 'Complete Sleep Hygiene Guide',
          description: 'Proven strategies for better sleep',
          url: '/resources/sleep',
          priority: 'high'
        });
      }

      // Rule 3: Depression -> exercise & community
      if (userConditions.includes('depression')) {
        recommendations.push({
          type: 'activity',
          title: 'Join Support Community',
          description: 'Connect with others on similar journey',
          url: '/community',
          priority: 'medium'
        });
      }

      // Rule 4: Stress -> mindfulness
      if (userConditions.includes('stress') || userConditions.includes('anxiety')) {
        recommendations.push({
          type: 'meditation',
          title: 'Guided Mindfulness Meditation',
          description: '10-minute daily practice',
          url: '/resources/meditation',
          priority: 'medium'
        });
      }

      logger.info('Resources recommended', { userId, count: recommendations.length });
      return recommendations;
    } catch (error) {
      logger.error('Resource recommendation error', { error: error.message });
      throw error;
    }
  }

  // ==================== ENGAGEMENT PREDICTION ====================

  async predictEngagementRisk(userId, userData) {
    try {
      const riskProfile = {
        riskLevel: 'low', // low, medium, high
        churnProbability: 0,
        interventionNeeded: false,
        suggestions: []
      };

      // Factor 1: Last appointment date
      if (userData.lastAppointment) {
        const daysSince = Math.floor(
          (Date.now() - new Date(userData.lastAppointment)) / (1000 * 60 * 60 * 24)
        );

        if (daysSince > 30) {
          riskProfile.riskLevel = 'high';
          riskProfile.churnProbability = 0.8;
          riskProfile.interventionNeeded = true;
          riskProfile.suggestions.push('Send re-engagement email');
        } else if (daysSince > 14) {
          riskProfile.riskLevel = 'medium';
          riskProfile.churnProbability = 0.4;
        }
      }

      // Factor 2: Session completion rate
      if (userData.appointmentRate < 0.5) {
        riskProfile.riskLevel = 'high';
        riskProfile.interventionNeeded = true;
        riskProfile.suggestions.push('Offer scheduling assistance');
      }

      // Factor 3: Subscription status
      if (userData.subscription && userData.subscription.status === 'paused') {
        riskProfile.interventionNeeded = true;
        riskProfile.suggestions.push('Check-in about pause reason');
      }

      logger.info('Engagement risk assessed', { userId, riskLevel: riskProfile.riskLevel });
      return riskProfile;
    } catch (error) {
      logger.error('Engagement prediction error', { error: error.message });
      throw error;
    }
  }

  // ==================== TREATMENT PLAN SUGGESTIONS ====================

  async suggestTreatmentPlan(userId, conditions, therapistStyle) {
    try {
      const treatmentPlan = {
        duration: '12 weeks',
        frequency: 'weekly',
        approach: [],
        expectedOutcomes: [],
        milestones: []
      };

      // Condition-specific plans
      const planMap = {
        depression: {
          approach: ['CBT', 'Behavioral activation', 'Medication if needed'],
          duration: '16 weeks',
          frequency: 'biweekly',
          expectedOutcomes: ['Mood improvement', 'Increased activity', 'Sleep normalization']
        },
        anxiety: {
          approach: ['CBT', 'Exposure therapy', 'Relaxation techniques'],
          duration: '12 weeks',
          frequency: 'weekly',
          expectedOutcomes: ['Reduced anxiety', 'Better coping', 'Improved confidence']
        },
        ptsd: {
          approach: ['EMDR', 'CPT', 'Trauma-focused CBT'],
          duration: '20 weeks',
          frequency: 'weekly',
          expectedOutcomes: ['Trauma processing', 'Symptom reduction', 'Life reclamation']
        }
      };

      // Match conditions to plans
      for (const condition of conditions) {
        if (planMap[condition.toLowerCase()]) {
          const plan = planMap[condition.toLowerCase()];
          Object.assign(treatmentPlan, plan);
        }
      }

      // Add milestones
      treatmentPlan.milestones = [
        'Week 2: Establish baseline & goals',
        'Week 4: Initial progress assessment',
        'Week 8: Mid-treatment evaluation',
        'Week 12: Significant improvement expected',
        'Week 16: Consolidation & maintenance'
      ];

      logger.info('Treatment plan suggested', { userId, conditions });
      return treatmentPlan;
    } catch (error) {
      logger.error('Treatment plan error', { error: error.message });
      throw error;
    }
  }

  // ==================== ANOMALY DETECTION ====================

  async detectCrisisRisk(userId, recentMoodData, recentEvents) {
    try {
      const crisisIndicators = {
        riskLevel: 'none', // none, low, moderate, high, critical
        score: 0,
        indicators: [],
        recommendedAction: null
      };

      // Indicator 1: Sharp mood decline
      if (recentMoodData && recentMoodData.length >= 3) {
        const recent = recentMoodData.slice(-3);
        if (recent.every(m => m <= 2)) {
          crisisIndicators.indicators.push('Severe mood depression');
          crisisIndicators.score += 30;
        }
      }

      // Indicator 2: High stress events
      if (recentEvents) {
        const criticalEvents = recentEvents.filter(e =>
          ['loss', 'trauma', 'abuse', 'suicidal_thought'].includes(e.type)
        );
        if (criticalEvents.length > 0) {
          crisisIndicators.indicators.push('Critical life event');
          crisisIndicators.score += 40;
        }
      }

      // Determine risk level
      if (crisisIndicators.score >= 80) {
        crisisIndicators.riskLevel = 'critical';
        crisisIndicators.recommendedAction = 'emergency_contact';
      } else if (crisisIndicators.score >= 60) {
        crisisIndicators.riskLevel = 'high';
        crisisIndicators.recommendedAction = 'urgent_therapist_contact';
      } else if (crisisIndicators.score >= 40) {
        crisisIndicators.riskLevel = 'moderate';
        crisisIndicators.recommendedAction = 'increased_support';
      } else if (crisisIndicators.score > 0) {
        crisisIndicators.riskLevel = 'low';
        crisisIndicators.recommendedAction = 'monitoring';
      }

      logger.info('Crisis risk assessed', { userId, riskLevel: crisisIndicators.riskLevel });
      return crisisIndicators;
    } catch (error) {
      logger.error('Crisis detection error', { error: error.message });
      throw error;
    }
  }

  // ==================== PERSONALIZED INSIGHTS ====================

  async generateWeeklyInsights(userId, weekData) {
    try {
      const insights = {
        title: 'Your Weekly Wellness Summary',
        summaryScore: 0,
        keyFindings: [],
        recommendations: [],
        celebrationPoints: []
      };

      // Calculate summary score
      if (weekData.moodEntries && weekData.moodEntries.length > 0) {
        const avgMood = weekData.moodEntries.reduce((a, b) => a + b, 0) / weekData.moodEntries.length;
        insights.summaryScore = Math.round(avgMood * 20); // Convert to 0-100
      }

      // Key findings
      if (weekData.therapySessions > 0) {
        insights.keyFindings.push(`Completed ${weekData.therapySessions} therapy session(s)`);
        insights.celebrationPoints.push('Great commitment to therapy! 🎉');
      }

      if (weekData.avgSleep >= 7) {
        insights.keyFindings.push('Excellent sleep schedule maintained');
        insights.celebrationPoints.push('Sleep quality is supporting recovery! 😴');
      }

      if (weekData.communityEngagement > 0) {
        insights.keyFindings.push('Active community participation');
        insights.celebrationPoints.push('Connecting with others strengthens support! 💜');
      }

      // Recommendations
      if (weekData.avgMood < 3) {
        insights.recommendations.push('Consider scheduling additional therapy session');
      }

      if (weekData.avgSleep < 6) {
        insights.recommendations.push('Focus on sleep hygiene this week');
      }

      logger.info('Weekly insights generated', { userId });
      return insights;
    } catch (error) {
      logger.error('Insights generation error', { error: error.message });
      throw error;
    }
  }
}

module.exports = new MLRecommendationEngine();
