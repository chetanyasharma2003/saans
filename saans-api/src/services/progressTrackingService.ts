import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ProgressTrackingService {
  // Add progress metric
  async addMetric(userId: string, metricName: string, value: number, notes?: string) {
    try {
      return await prisma.progressMetric.create({
        data: {
          userId,
          metricName,
          value,
          notes,
        },
      });
    } catch (error) {
      throw new Error(`Failed to add metric: ${error}`);
    }
  }

  // Get mood trend
  async getMoodTrend(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const moodEntries = await prisma.moodEntry.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const trend = moodEntries.map((entry) => ({
        date: entry.createdAt,
        score: entry.moodScore,
        category: entry.moodCategory,
      }));

      const avgScore = moodEntries.length > 0 ? moodEntries.reduce((sum, e) => sum + e.moodScore, 0) / moodEntries.length : 0;

      return {
        trend,
        average: avgScore,
        dataPoints: moodEntries.length,
      };
    } catch (error) {
      throw new Error(`Failed to get mood trend: ${error}`);
    }
  }

  // Get symptom improvement
  async getSymptomImprovement(userId: string) {
    try {
      const metrics = await prisma.progressMetric.findMany({
        where: {
          userId,
          metricName: {
            in: ['Anxiety Score', 'Depression Score', 'Sleep Quality', 'Energy Level'],
          },
        },
        orderBy: { date: 'desc' },
        take: 100,
      });

      const grouped: any = {};
      metrics.forEach((m) => {
        if (!grouped[m.metricName]) {
          grouped[m.metricName] = [];
        }
        grouped[m.metricName].push({
          date: m.date,
          value: m.value,
        });
      });

      return grouped;
    } catch (error) {
      throw new Error(`Failed to get symptom improvement: ${error}`);
    }
  }

  // Add milestone
  async addMilestone(userId: string, title: string, description: string, celebrationMessage?: string) {
    try {
      return await prisma.recoveryMilestone.create({
        data: {
          userId,
          title,
          description,
          celebrationMessage,
        },
      });
    } catch (error) {
      throw new Error(`Failed to add milestone: ${error}`);
    }
  }

  // Get recovery percentage
  async getRecoveryPercentage(userId: string) {
    try {
      const milestones = await prisma.recoveryMilestone.findMany({
        where: { userId },
      });

      const metrics = await prisma.progressMetric.findMany({
        where: { userId },
      });

      // Simple recovery percentage calculation
      const recovery = Math.min(100, Math.round((milestones.length * 10 + metrics.length * 2) / 5));

      return {
        percentage: recovery,
        milestones: milestones.length,
        metrics: metrics.length,
      };
    } catch (error) {
      throw new Error(`Failed to calculate recovery percentage: ${error}`);
    }
  }

  // Get all milestones
  async getMilestones(userId: string) {
    try {
      return await prisma.recoveryMilestone.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      });
    } catch (error) {
      throw new Error(`Failed to get milestones: ${error}`);
    }
  }
}

export default new ProgressTrackingService();
