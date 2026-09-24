const mongoose = require('mongoose');

module.exports = [
  // User 1: Premium Subscriber
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439010'),
    plan: 'premium',
    planDetails: {
      name: 'Premium Therapy',
      price: 2999,
      currency: 'INR',
      billingCycle: 'monthly',
      features: [
        '4 therapy sessions/month',
        'Chat with therapist (unlimited)',
        'Priority booking',
        'Mood tracking analytics',
        'Progress reports',
        'Resource library access',
        'Ad-free experience'
      ]
    },
    status: 'active',
    startDate: new Date('2026-08-25'),
    endDate: new Date('2026-09-25'),
    renewalDate: new Date('2026-10-25'),
    paymentMethod: 'stripe',
    autoRenew: true,
    sessionsIncluded: 4,
    sessionsUsed: 2,
    unlimitedSessions: false,
    therapistAccessLevel: 'premium',
    createdAt: new Date('2026-08-25')
  },

  // User 2: Elite Subscriber
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    plan: 'elite',
    planDetails: {
      name: 'Elite Wellness',
      price: 5999,
      currency: 'INR',
      billingCycle: 'quarterly',
      features: [
        'Unlimited therapy sessions',
        'Priority therapist selection',
        '24/7 crisis support',
        'Advanced analytics',
        'Personalized treatment plans',
        'Medication coordination',
        'Family therapy sessions',
        'Premium resources',
        'Ad-free + offline access'
      ]
    },
    status: 'active',
    startDate: new Date('2026-07-22'),
    endDate: new Date('2026-10-22'),
    renewalDate: new Date('2026-10-22'),
    paymentMethod: 'razorpay',
    autoRenew: true,
    sessionsIncluded: 0,
    sessionsUsed: 6,
    unlimitedSessions: true,
    therapistAccessLevel: 'elite',
    createdAt: new Date('2026-07-22')
  },

  // User 3: Basic Subscriber
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    plan: 'basic',
    planDetails: {
      name: 'Basic Wellness',
      price: 999,
      currency: 'INR',
      billingCycle: 'monthly',
      features: [
        '2 therapy sessions/month',
        'Mood tracking',
        'Resource library',
        'Basic analytics',
        'Community access'
      ]
    },
    status: 'active',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-10-01'),
    renewalDate: new Date('2026-10-01'),
    paymentMethod: 'card',
    autoRenew: true,
    sessionsIncluded: 2,
    sessionsUsed: 1,
    unlimitedSessions: false,
    therapistAccessLevel: 'basic',
    createdAt: new Date('2026-09-01')
  },

  // User 4: Paused Subscription
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'),
    plan: 'premium',
    planDetails: {
      name: 'Premium Therapy',
      price: 2999,
      currency: 'INR',
      billingCycle: 'monthly',
      features: [
        '4 therapy sessions/month',
        'Chat with therapist (unlimited)',
        'Priority booking',
        'Mood tracking analytics'
      ]
    },
    status: 'paused',
    startDate: new Date('2026-06-15'),
    endDate: new Date('2026-09-15'),
    renewalDate: new Date('2026-10-15'),
    paymentMethod: 'stripe',
    autoRenew: false,
    sessionsIncluded: 4,
    sessionsUsed: 3,
    unlimitedSessions: false,
    therapistAccessLevel: 'premium',
    createdAt: new Date('2026-06-15')
  },

  // User 5: Cancelled Subscription
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439016'),
    plan: 'premium',
    planDetails: {
      name: 'Premium Therapy',
      price: 2999,
      currency: 'INR',
      billingCycle: 'monthly',
      features: []
    },
    status: 'cancelled',
    startDate: new Date('2026-05-10'),
    endDate: new Date('2026-09-10'),
    cancelledAt: new Date('2026-09-10'),
    cancellationReason: 'Improved mental health, pausing for now',
    paymentMethod: 'stripe',
    autoRenew: false,
    sessionsIncluded: 4,
    sessionsUsed: 12,
    unlimitedSessions: false,
    therapistAccessLevel: 'premium',
    createdAt: new Date('2026-05-10')
  },

  // User 6: Elite Annual
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439017'),
    plan: 'elite',
    planDetails: {
      name: 'Elite Wellness',
      price: 59999,
      currency: 'INR',
      billingCycle: 'annual',
      features: [
        'Unlimited therapy sessions',
        '24/7 crisis support',
        'Personalized treatment plans',
        'Family therapy'
      ]
    },
    status: 'active',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2027-01-15'),
    renewalDate: new Date('2027-01-15'),
    paymentMethod: 'razorpay',
    autoRenew: true,
    sessionsIncluded: 0,
    sessionsUsed: 35,
    unlimitedSessions: true,
    therapistAccessLevel: 'elite',
    createdAt: new Date('2026-01-15')
  }
];
