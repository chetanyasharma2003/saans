/**
 * Payment Integration Types and Constants
 */

// Subscription plan types
export enum SubscriptionPlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  PLUS = 'PLUS',
}

// Payment status types
export enum PaymentStatusType {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Subscription plan details
export interface SubscriptionPlan {
  name: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
}

// Razorpay order response
export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  planType: SubscriptionPlanType;
}

// Payment verification payload
export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planType: SubscriptionPlanType;
}

// Subscription status response
export interface SubscriptionStatus {
  isActive: boolean;
  subscription: SubscriptionDetails | null;
  daysRemaining: number | null;
}

// Subscription details
export interface SubscriptionDetails {
  id: string;
  userId: string;
  type: SubscriptionPlanType;
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  features: string[];
  aiChatLimit: number;
  aiChatsUsed: number;
  therapySessionLimit: number;
  therapySessionsUsed: number;
  createdAt: string;
  updatedAt: string;
}

// Payment history item
export interface PaymentHistoryItem {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  subscriptionType: SubscriptionPlanType;
  billingCycle: string;
  status: PaymentStatusType;
  gateway: string;
  transactionId: string;
  refundAmount?: number | null;
  refundedAt?: string | null;
  invoiceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Payment history response
export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    pages: number;
  };
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Plan pricing constants
export const PLAN_PRICES: Record<SubscriptionPlanType, number> = {
  [SubscriptionPlanType.FREE]: 0,
  [SubscriptionPlanType.BASIC]: 99,
  [SubscriptionPlanType.PREMIUM]: 299,
  [SubscriptionPlanType.PLUS]: 499,
};

// Plan features
export const PLAN_FEATURES: Record<SubscriptionPlanType, string[]> = {
  [SubscriptionPlanType.FREE]: [
    'Limited AI chat (5 per day)',
    'Mood tracking',
    'Basic resources',
  ],
  [SubscriptionPlanType.BASIC]: [
    'Unlimited AI chat',
    'Mood tracking',
    'Therapy session booking (2/month)',
    'Resource library',
    'Crisis support',
  ],
  [SubscriptionPlanType.PREMIUM]: [
    'Unlimited AI chat',
    'Priority AI responses',
    'Mood tracking with insights',
    'Therapy sessions (4/month)',
    'Full resource library',
    'Crisis support with priority',
    'Personalized wellness plans',
  ],
  [SubscriptionPlanType.PLUS]: [
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
};

// Therapy session limits per plan
export const THERAPY_SESSION_LIMITS: Record<SubscriptionPlanType, number> = {
  [SubscriptionPlanType.FREE]: 0,
  [SubscriptionPlanType.BASIC]: 2,
  [SubscriptionPlanType.PREMIUM]: 4,
  [SubscriptionPlanType.PLUS]: -1, // Unlimited
};

// AI chat limits per plan
export const AI_CHAT_LIMITS: Record<SubscriptionPlanType, number> = {
  [SubscriptionPlanType.FREE]: 5, // 5 per day
  [SubscriptionPlanType.BASIC]: -1, // Unlimited
  [SubscriptionPlanType.PREMIUM]: -1, // Unlimited
  [SubscriptionPlanType.PLUS]: -1, // Unlimited
};

// Helper functions
export const isSubscriptionActive = (endDate: string | Date): boolean => {
  const date = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return date > new Date();
};

export const getDaysRemaining = (endDate: string | Date): number | null => {
  const date = typeof endDate === 'string' ? new Date(endDate) : endDate;
  if (date <= new Date()) {
    return null;
  }
  return Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  });
  return formatter.format(amount);
};

export const getPlanDisplayName = (planType: SubscriptionPlanType): string => {
  const names: Record<SubscriptionPlanType, string> = {
    [SubscriptionPlanType.FREE]: 'Free',
    [SubscriptionPlanType.BASIC]: 'Basic',
    [SubscriptionPlanType.PREMIUM]: 'Premium',
    [SubscriptionPlanType.PLUS]: 'Plus',
  };
  return names[planType];
};

export const sortPlansByPrice = (
  plans: SubscriptionPlanType[],
): SubscriptionPlanType[] => {
  return plans.sort((a, b) => PLAN_PRICES[a] - PLAN_PRICES[b]);
};

export const getHighestPricedPlan = (): SubscriptionPlanType => {
  return SubscriptionPlanType.PLUS;
};

export const getLowestPricedPaidPlan = (): SubscriptionPlanType => {
  return SubscriptionPlanType.BASIC;
};

export const isFreePlan = (planType: SubscriptionPlanType): boolean => {
  return planType === SubscriptionPlanType.FREE;
};

export const isPremiumPlan = (planType: SubscriptionPlanType): boolean => {
  return planType !== SubscriptionPlanType.FREE;
};
