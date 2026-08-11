// @ts-nocheck

import { PrismaClient } from '@prisma/client';
import { ApiError, ErrorMessages, ErrorCodes, HttpStatus } from '../utils/errorHandler.js';

const prisma = new PrismaClient();

export interface CreateMoodEntryInput {
  moodScore: number;
  moodCategory: string;
  symptoms?: string[];
  triggers?: string[];
  notes?: string;
  location?: string;
  weather?: string;
}

export interface MoodAnalytics {
  totalEntries: number;
  averageScore: number;
  mostFrequentMood: string;
  recentTrend: number[];
  streakDays: number;
  last7DaysAverage: number;
}

class MoodService {
  /**
   * Track a new mood entry
   */
  async trackMood(userId: string, input: CreateMoodEntryInput) {
    try {
      // Validate mood score
      if (!Number.isInteger(input.moodScore) || input.moodScore < 1 || input.moodScore > 10) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Mood score must be an integer between 1 and 10',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Validate mood category
      const validCategories = ['Happy', 'Calm', 'Anxious', 'Sad', 'Excited'];
      if (!validCategories.includes(input.moodCategory)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          `Mood category must be one of: ${validCategories.join(', ')}`,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Create mood entry
      const moodEntry = await prisma.moodEntry.create({
        data: {
          userId,
          moodScore: input.moodScore,
          moodCategory: input.moodCategory,
          symptoms: input.symptoms || [],
          triggers: input.triggers || [],
          notes: input.notes || null,
          location: input.location || null,
          weather: input.weather || null,
        },
      });

      return {
        success: true,
        message: 'Mood entry saved successfully',
        data: moodEntry,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
    }
  }

  /**
   * Get user's mood history with pagination
   */
  async getUserMoods(userId: string, limit: number = 30, skip: number = 0) {
    try {
      const [moodEntries, totalCount] = await Promise.all([
        prisma.moodEntry.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
        }),
        prisma.moodEntry.count({ where: { userId } }),
      ]);

      return {
        success: true,
        data: moodEntries,
        pagination: {
          total: totalCount,
          limit,
          skip,
          hasMore: skip + limit < totalCount,
        },
      };
    } catch (error: any) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
    }
  }

  /**
   * Get mood analytics for user
   */
  async getMoodAnalytics(userId: string): Promise<MoodAnalytics> {
    try {
      const allEntries = await prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (allEntries.length === 0) {
        return {
          totalEntries: 0,
          averageScore: 0,
          mostFrequentMood: 'N/A',
          recentTrend: [],
          streakDays: 0,
          last7DaysAverage: 0,
        };
      }

      // Calculate total entries
      const totalEntries = allEntries.length;

      // Calculate average score
      const averageScore =
        parseFloat((allEntries.reduce((sum, e) => sum + e.moodScore, 0) / totalEntries).toFixed(1));

      // Find most frequent mood
      const moodCounts: Record<string, number> = {};
      allEntries.forEach((entry) => {
        moodCounts[entry.moodCategory] = (moodCounts[entry.moodCategory] || 0) + 1;
      });
      const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      // Calculate last 7 days average
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const last7DaysEntries = allEntries.filter((e) => new Date(e.createdAt) >= sevenDaysAgo);
      const last7DaysAverage =
        last7DaysEntries.length > 0
          ? parseFloat((last7DaysEntries.reduce((sum, e) => sum + e.moodScore, 0) / last7DaysEntries.length).toFixed(1))
          : 0;

      // Calculate recent trend (last 7 entries)
      const recentTrend = allEntries.slice(0, 7).reverse().map((e) => e.moodScore);

      // Calculate streak (consecutive days with entries)
      let streakDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        const hasEntry = allEntries.some((e) => e.createdAt.toISOString().split('T')[0] === dateStr);

        if (hasEntry) {
          streakDays++;
        } else if (i > 0) {
          // Only break if we've already found entries and now missing one
          break;
        }
      }

      return {
        totalEntries,
        averageScore,
        mostFrequentMood,
        recentTrend,
        streakDays,
        last7DaysAverage,
      };
    } catch (error: any) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
    }
  }

  /**
   * Get mood entries for specific date range
   */
  async getMoodsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const entries = await prisma.moodEntry.findMany({
        where: {
          userId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: entries,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      };
    } catch (error: any) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
    }
  }

  /**
   * Delete a mood entry
   */
  async deleteMoodEntry(userId: string, entryId: string) {
    try {
      // Verify ownership
      const entry = await prisma.moodEntry.findUnique({
        where: { id: entryId },
      });

      if (!entry || entry.userId !== userId) {
        throw new ApiError(
          HttpStatus.FORBIDDEN,
          'You do not have permission to delete this mood entry',
          true,
          ErrorCodes.AUTHORIZATION_FAILED
        );
      }

      await prisma.moodEntry.delete({
        where: { id: entryId },
      });

      return {
        success: true,
        message: 'Mood entry deleted successfully',
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
    }
  }

  /**
   * Update mood entry
   */
  async updateMoodEntry(
    userId: string,
    entryId: string,
    input: Partial<CreateMoodEntryInput>
  ) {
    try {
      // Verify ownership
      const entry = await prisma.moodEntry.findUnique({
        where: { id: entryId },
      });

      if (!entry || entry.userId !== userId) {
        throw new ApiError(
          HttpStatus.FORBIDDEN,
          'You do not have permission to update this mood entry',
          true,
          ErrorCodes.AUTHORIZATION_FAILED
        );
      }

      // Validate mood score if provided
      if (input.moodScore !== undefined) {
        if (!Number.isInteger(input.moodScore) || input.moodScore < 1 || input.moodScore > 10) {
          throw new ApiError(
            HttpStatus.BAD_REQUEST,
            'Mood score must be an integer between 1 and 10',
            true,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      const updatedEntry = await prisma.moodEntry.update({
        where: { id: entryId },
        data: {
          ...(input.moodScore !== undefined && { moodScore: input.moodScore }),
          ...(input.moodCategory && { moodCategory: input.moodCategory }),
          ...(input.symptoms && { symptoms: input.symptoms }),
          ...(input.triggers && { triggers: input.triggers }),
          ...(input.notes !== undefined && { notes: input.notes || null }),
          ...(input.location !== undefined && { location: input.location || null }),
          ...(input.weather !== undefined && { weather: input.weather || null }),
        },
      });

      return {
        success: true,
        message: 'Mood entry updated successfully',
        data: updatedEntry,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
    }
  }
}

export default new MoodService();
