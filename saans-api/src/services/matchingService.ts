import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Matching Service
 * Provides therapist-patient matching functionality
 */
export class MatchingService {
  /**
   * Get matching therapists for a user
   */
  static async getMatchingTherapists(userId: string, preferences?: any) {
    try {
      const therapists = await prisma.therapist.findMany({
        where: {
          isAvailable: true,
        },
        include: {
          user: true,
          therapyBookings: true,
        },
      });

      const therapistsWithScores = therapists.map((therapist) => ({
        ...therapist,
        matchScore: Math.random() * 100, // Placeholder scoring
      }));

      return therapistsWithScores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);
    } catch (error) {
      logger.error('Failed to get matching therapists', { error, userId });
      throw error;
    }
  }

  /**
   * Calculate match score between user and therapist
   */
  static async getTherapistMatchScore(userId: string, therapistId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { moodEntries: true },
      });

      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId },
        include: { user: true },
      });

      if (!user || !therapist) {
        throw new Error('User or therapist not found');
      }

      // Calculate compatibility score
      const specialization = (therapist.specialization || []).length > 0 ? 30 : 10;
      const experience = (therapist.yearsOfExperience || 0) * 2;
      const rating = (therapist.averageRating || 0) * 5;
      const availability = therapist.isAvailable ? 25 : 0;

      const totalScore = Math.min(100, specialization + experience + rating + availability);

      return {
        userId,
        therapistId,
        score: Math.round(totalScore),
        components: {
          specialization,
          experience,
          rating,
          availability,
        },
        recommendation: totalScore >= 70 ? 'Highly Recommended' : 'Recommended',
      };
    } catch (error) {
      logger.error('Failed to calculate match score', { error, userId, therapistId });
      throw error;
    }
  }

  /**
   * Accept a therapist match
   */
  static async acceptTherapistMatch(userId: string, therapistId: string) {
    try {
      // Create a booking as a proxy for accepting match
      const scheduledAt = new Date();
      scheduledAt.setHours(scheduledAt.getHours() + 24); // Default to 24 hours later

      const booking = await prisma.therapyBooking.create({
        data: {
          userId,
          therapistId,
          scheduledAt,
          duration: 60,
          status: 'SCHEDULED',
          meetingUrl: '',
          price: 500,
          paymentId: '',
        },
      });

      return { ...booking, matchAccepted: true };
    } catch (error) {
      logger.error('Failed to accept therapist match', { error, userId, therapistId });
      throw error;
    }
  }

  /**
   * Get user's accepted matches
   */
  static async getUserAcceptedMatches(userId: string) {
    try {
      const bookings = await prisma.therapyBooking.findMany({
        where: {
          userId,
          status: 'SCHEDULED',
        },
        include: {
          therapist: { include: { user: true } },
        },
      });

      return bookings;
    } catch (error) {
      logger.error('Failed to get user accepted matches', { error, userId });
      throw error;
    }
  }

  /**
   * Dismiss a therapist match
   */
  static async dismissTherapistMatch(userId: string, therapistId: string) {
    try {
      const result = await prisma.therapyBooking.updateMany({
        where: {
          userId,
          therapistId,
          status: 'SCHEDULED',
        },
        data: {
          status: 'CANCELLED',
        },
      });

      return result;
    } catch (error) {
      logger.error('Failed to dismiss therapist match', { error, userId, therapistId });
      throw error;
    }
  }
}
