import { PrismaClient, SubscriptionPlan } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Subscription Service
 * Manages user subscriptions and billing
 */
export class SubscriptionService {
  /**
   * Get available subscription plans
   */
  static async getAvailablePlans() {
    try {
      return [
        {
          id: 'FREE',
          name: 'Free',
          price: 0,
          currency: 'INR',
          features: [
            'Unlimited mood tracking',
            'Basic analytics',
            '1 appointment per month',
          ],
        },
        {
          id: 'STANDARD',
          name: 'Standard',
          price: 299,
          currency: 'INR',
          features: [
            'Unlimited mood tracking',
            'Advanced analytics',
            '4 appointments per month',
            'Chat support',
          ],
        },
        {
          id: 'PREMIUM',
          name: 'Premium',
          price: 699,
          currency: 'INR',
          features: [
            'Unlimited mood tracking',
            'AI-powered insights',
            'Unlimited appointments',
            '24/7 chat support',
            'Video consultations',
            'Health reports',
          ],
        },
      ];
    } catch (error) {
      logger.error('Failed to get available plans', { error });
      throw error;
    }
  }

  /**
   * Get plan details
   */
  static async getPlanDetails(planId: SubscriptionPlan) {
    try {
      const plans = await this.getAvailablePlans();
      return plans.find((p) => p.id === planId);
    } catch (error) {
      logger.error('Failed to get plan details', { error, planId });
      throw error;
    }
  }

  /**
   * Create subscription
   */
  static async createSubscription(userId: string, planId: SubscriptionPlan) {
    try {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const subscription = await prisma.subscription.create({
        data: {
          userId,
          type: planId,
          startDate: new Date(),
          endDate,
          autoRenewal: true,
          features: await this.getFeaturesList(planId),
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: planId !== 'FREE' },
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to create subscription', { error, userId, planId });
      throw error;
    }
  }

  /**
   * Get user subscription
   */
  static async getUserSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription || subscription.endDate < new Date()) {
        throw new Error('No active subscription');
      }

      return subscription;
    } catch (error) {
      logger.error('Failed to get user subscription', { error, userId });
      throw error;
    }
  }

  /**
   * Check if user can book appointment
   */
  static async canBookAppointment(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      return !!subscription;
    } catch {
      return false;
    }
  }

  /**
   * Upgrade subscription
   */
  static async upgradeSubscription(userId: string, newPlanId: SubscriptionPlan) {
    try {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          type: newPlanId,
          endDate,
          features: await this.getFeaturesList(newPlanId),
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: newPlanId !== 'FREE' },
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to upgrade subscription', { error, userId, newPlanId });
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          endDate: new Date(),
          autoRenewal: false,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false },
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to cancel subscription', { error, userId });
      throw error;
    }
  }

  /**
   * Pause subscription
   */
  static async pauseSubscription(userId: string, durationDays: number = 30) {
    try {
      const pausedUntil = new Date();
      pausedUntil.setDate(pausedUntil.getDate() + durationDays);

      const subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          endDate: pausedUntil,
          autoRenewal: false,
        },
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to pause subscription', { error, userId });
      throw error;
    }
  }

  /**
   * Check and renew subscriptions
   */
  static async checkAndRenewSubscriptions() {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          autoRenewal: true,
          endDate: { lte: new Date() },
        },
      });

      const renewalCount = subscriptions.length;

      for (const sub of subscriptions) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { endDate },
        });
      }

      return renewalCount;
    } catch (error) {
      logger.error('Failed to check and renew subscriptions', { error });
      throw error;
    }
  }

  /**
   * Get subscription usage
   */
  static async getSubscriptionUsage(userId: string) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const bookings = await prisma.therapyBooking.findMany({
        where: { userId },
      });

      const planLimits: { [key: string]: number } = {
        FREE: 1,
        STANDARD: 4,
        PREMIUM: -1,
      };

      return {
        subscriptionId: subscription.id,
        plan: subscription.type,
        appointmentsUsed: bookings.filter((b) => b.status !== 'CANCELLED').length,
        appointmentLimit: planLimits[subscription.type] || 0,
        renewalDate: subscription.endDate,
      };
    } catch (error) {
      logger.error('Failed to get subscription usage', { error, userId });
      throw error;
    }
  }

  /**
   * Helper: Get features list for a plan
   */
  private static async getFeaturesList(planId: SubscriptionPlan): Promise<string[]> {
    const features: { [key: string]: string[] } = {
      FREE: [
        'Unlimited mood tracking',
        'Basic analytics',
        '1 appointment per month',
      ],
      STANDARD: [
        'Unlimited mood tracking',
        'Advanced analytics',
        '4 appointments per month',
        'Chat support',
      ],
      PREMIUM: [
        'Unlimited mood tracking',
        'AI-powered insights',
        'Unlimited appointments',
        '24/7 chat support',
        'Video consultations',
        'Health reports',
      ],
    };

    return features[planId] || [];
  }
}
