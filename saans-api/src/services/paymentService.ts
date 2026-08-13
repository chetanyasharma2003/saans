import Razorpay from 'razorpay';
import { createHmac } from 'crypto';
import { PrismaClient, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Razorpay instance (lazy load to prevent crash if credentials missing)
let razorpay: any;
const initRazorpay = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// Subscription plan pricing in rupees
const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, { price: number; features: string[] }> = {
  FREE: {
    price: 0,
    features: [
      'Limited AI chat (5 per day)',
      'Mood tracking',
      'Basic resources',
    ],
  },
  BASIC: {
    price: 99,
    features: [
      'Unlimited AI chat',
      'Mood tracking',
      'Therapy session booking (2/month)',
      'Resource library',
      'Crisis support',
    ],
  },
  PREMIUM: {
    price: 299,
    features: [
      'Unlimited AI chat',
      'Priority AI responses',
      'Mood tracking with insights',
      'Therapy sessions (4/month)',
      'Full resource library',
      'Crisis support with priority',
      'Personalized wellness plans',
    ],
  },
  PLUS: {
    price: 499,
    features: [
      'Unlimited AI chat',
      'Priority AI responses',
      'Advanced mood analytics',
      'Unlimited therapy sessions',
      'Full resource library',
      'Dedicated crisis support',
      'Personalized wellness plans',
      'One-on-one consultation',
      'Monthly progress reports',
    ],
  },
};

interface RazorpayOrder {
  amount: number;
  currency: string;
  receipt: string;
  description: string;
  customer_notify: number;
  notes: {
    userId: string;
    planType: SubscriptionPlan;
  };
}

interface RazorpayPayment {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class PaymentService {
  /**
   * Create a Razorpay order for subscription
   */
  async createRazorpayOrder(
    userId: string,
    planType: SubscriptionPlan,
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    planType: string;
  }> {
    // Validate plan type
    if (!SUBSCRIPTION_PLANS[planType]) {
      throw new Error(`Invalid subscription plan: ${planType}`);
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const planDetails = SUBSCRIPTION_PLANS[planType];
    const amountInPaise = planDetails.price * 100; // Razorpay expects amount in paise

    try {
      // Create order with Razorpay
      const orderData: RazorpayOrder = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${userId}_${Date.now()}`,
        description: `SAANS ${planType} Subscription`,
        customer_notify: 1,
        notes: {
          userId,
          planType,
        },
      };

      const razorpayInstance = initRazorpay();
      if (!razorpayInstance) {
        throw new Error('Razorpay credentials not configured');
      }
      const order = await razorpayInstance.orders.create(orderData);

      // Verify order creation
      if (!order.id) {
        throw new Error('Failed to create Razorpay order');
      }

      return {
        orderId: order.id as string,
        amount: planDetails.price,
        currency: 'INR',
        planType,
      };
    } catch (error: any) {
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature from Razorpay webhook
   */
  async verifyPaymentSignature(payment: RazorpayPayment): Promise<{
    isValid: boolean;
    message: string;
  }> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payment;

      // Create signature
      const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      // Verify signature
      const isValid = expectedSignature === razorpay_signature;

      if (!isValid) {
        return {
          isValid: false,
          message: 'Invalid payment signature',
        };
      }

      return {
        isValid: true,
        message: 'Signature verified successfully',
      };
    } catch (error: any) {
      throw new Error(`Signature verification failed: ${error.message}`);
    }
  }

  /**
   * Update user subscription after successful payment
   */
  async updateUserSubscription(
    userId: string,
    _orderId: string,
    paymentId: string,
    planType: SubscriptionPlan,
  ): Promise<{
    subscription: any;
    message: string;
  }> {
    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!SUBSCRIPTION_PLANS[planType]) {
        throw new Error(`Invalid subscription plan: ${planType}`);
      }

      const planDetails = SUBSCRIPTION_PLANS[planType];

      // Calculate subscription end date (30 days from now)
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Create or update subscription
      const subscription = await prisma.subscription.upsert({
        where: { userId },
        update: {
          type: planType,
          endDate,
          autoRenewal: true,
          features: SUBSCRIPTION_PLANS[planType].features,
          aiChatLimit: planType === 'FREE' ? 5 : -1,
          aiChatsUsed: 0,
          therapySessionLimit:
            planType === 'FREE' ? 0 : planType === 'BASIC' ? 2 : planType === 'PREMIUM' ? 4 : -1,
          therapySessionsUsed: 0,
          updatedAt: new Date(),
        },
        create: {
          userId,
          type: planType,
          endDate,
          autoRenewal: true,
          features: SUBSCRIPTION_PLANS[planType].features,
          aiChatLimit: planType === 'FREE' ? 5 : -1,
          aiChatsUsed: 0,
          therapySessionLimit:
            planType === 'FREE' ? 0 : planType === 'BASIC' ? 2 : planType === 'PREMIUM' ? 4 : -1,
          therapySessionsUsed: 0,
        },
      });

      // Record payment
      await prisma.payment.create({
        data: {
          userId,
          amount: planDetails.price,
          currency: 'INR',
          subscriptionType: planType,
          billingCycle: 'monthly',
          status: 'COMPLETED',
          gateway: 'razorpay',
          transactionId: paymentId,
        },
      });

      // Update user premium status
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: planType !== 'FREE',
          subscriptionEndDate: endDate,
        },
      });

      return {
        subscription,
        message: 'Subscription updated successfully',
      };
    } catch (error: any) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    subscription: any;
    daysRemaining: number | null;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const subscription = user.subscription;

      if (!subscription) {
        return {
          isActive: false,
          subscription: null,
          daysRemaining: null,
        };
      }

      const now = new Date();
      const isActive = subscription.endDate > now;
      const daysRemaining = isActive
        ? Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        isActive,
        subscription,
        daysRemaining: isActive ? daysRemaining : null,
      };
    } catch (error: any) {
      throw new Error(`Failed to get subscription status: ${error.message}`);
    }
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string): Promise<{
    subscription: any;
    message: string;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.subscription) {
        throw new Error('No active subscription to cancel');
      }

      // Update subscription to FREE
      const subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          type: 'FREE',
          autoRenewal: false,
          endDate: new Date(),
          features: SUBSCRIPTION_PLANS.FREE.features,
          aiChatLimit: 5,
          aiChatsUsed: 0,
          therapySessionLimit: 0,
          therapySessionsUsed: 0,
        },
      });

      // Update user premium status
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false,
          subscriptionEndDate: new Date(),
        },
      });

      return {
        subscription,
        message: 'Subscription cancelled successfully',
      };
    } catch (error: any) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(
    userId: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<{
    payments: any[];
    total: number;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
        }),
        prisma.payment.count({
          where: { userId },
        }),
      ]);

      return {
        payments,
        total,
      };
    } catch (error: any) {
      throw new Error(`Failed to get payment history: ${error.message}`);
    }
  }

  /**
   * Record failed payment attempt
   */
  async recordFailedPayment(
    userId: string,
    planType: SubscriptionPlan,
    errorMessage: string,
  ): Promise<void> {
    try {
      const planDetails = SUBSCRIPTION_PLANS[planType];

      await prisma.payment.create({
        data: {
          userId,
          amount: planDetails.price,
          currency: 'INR',
          subscriptionType: planType,
          billingCycle: 'monthly',
          status: 'FAILED',
          gateway: 'razorpay',
          transactionId: `failed_${userId}_${Date.now()}`,
        },
      });
    } catch (dbError) {
      console.error('Failed to record payment error:', dbError);
      console.error('Original error:', errorMessage);
    }
  }
}

export default new PaymentService();
