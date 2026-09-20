import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Analytics Service
 * Provides mood insights, trends, patterns, and data export
 */
export class AnalyticsService {
  /**
   * Get mood trends for a specific period
   */
  static async getMoodTrends(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const moodEntries = await prisma.moodEntry.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (moodEntries.length === 0) {
        return {
          period: days,
          entries: [],
          statistics: {
            average: 0,
            min: 0,
            max: 0,
            trend: 'STABLE',
          },
        };
      }

      const scores = moodEntries.map((e) => e.moodScore);
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      const min = Math.min(...scores);
      const max = Math.max(...scores);

      const midPoint = Math.floor(scores.length / 2);
      const firstHalf = scores.slice(0, midPoint);
      const secondHalf = scores.slice(midPoint);
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const trend =
        secondAvg > firstAvg + 1
          ? 'IMPROVING'
          : secondAvg < firstAvg - 1
            ? 'DECLINING'
            : 'STABLE';

      return {
        period: days,
        entries: moodEntries.map((e) => ({
          date: e.createdAt,
          score: e.moodScore,
          category: e.moodCategory,
        })),
        statistics: {
          average: Math.round(average * 10) / 10,
          min,
          max,
          trend,
          dataPoints: moodEntries.length,
        },
      };
    } catch (error) {
      logger.error('Failed to get mood trends', { error, userId });
      throw error;
    }
  }

  /**
   * Get mood patterns
   */
  static async getMoodPatterns(userId: string) {
    try {
      const moodEntries = await prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (moodEntries.length === 0) {
        return { patterns: [] };
      }

      const hourlyPattern: { [key: number]: number[] } = {};
      const dayPattern: { [key: number]: number[] } = {};

      moodEntries.forEach((entry) => {
        const hour = entry.createdAt.getHours();
        const day = entry.createdAt.getDay();

        if (!hourlyPattern[hour]) hourlyPattern[hour] = [];
        if (!dayPattern[day]) dayPattern[day] = [];

        hourlyPattern[hour].push(entry.moodScore);
        dayPattern[day].push(entry.moodScore);
      });

      return {
        hourlyPatterns: Object.entries(hourlyPattern).map(([hour, scores]) => ({
          hour: parseInt(hour),
          averageMood: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
          frequency: scores.length,
        })),
        dailyPatterns: Object.entries(dayPattern).map(([day, scores]) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
          averageMood: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
          frequency: scores.length,
        })),
      };
    } catch (error) {
      logger.error('Failed to get mood patterns', { error, userId });
      throw error;
    }
  }

  /**
   * Generate mood insights
   */
  static async generateMoodInsights(userId: string) {
    try {
      const trends = await this.getMoodTrends(userId, 30);
      const patterns = await this.getMoodPatterns(userId);

      return {
        trends,
        patterns,
        insights: [
          `Your mood has been ${trends.statistics.trend.toLowerCase()} over the last 30 days.`,
          `Your average mood score is ${trends.statistics.average} out of 10.`,
          `Best day of week: Your mood is typically best ${patterns.dailyPatterns?.reduce((prev, current) => (prev.averageMood > current.averageMood ? prev : current))?.day || 'varies'}.`,
        ],
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to generate mood insights', { error, userId });
      throw error;
    }
  }

  /**
   * Export mood data
   */
  static async exportMoodData(userId: string, format: 'JSON' | 'CSV' = 'JSON') {
    try {
      const moodEntries = await prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (format === 'JSON') {
        return {
          format: 'JSON',
          data: moodEntries,
          count: moodEntries.length,
          exportedAt: new Date().toISOString(),
        };
      }

      if (format === 'CSV') {
        const headers = ['Date', 'Score', 'Category', 'Notes'];
        const rows = moodEntries.map((entry) => [
          entry.createdAt.toISOString(),
          entry.moodScore,
          entry.moodCategory,
          entry.notes || '',
        ]);

        return {
          format: 'CSV',
          data: [headers, ...rows],
          count: moodEntries.length,
          exportedAt: new Date().toISOString(),
        };
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      logger.error('Failed to export mood data', { error, userId });
      throw error;
    }
  }
}
