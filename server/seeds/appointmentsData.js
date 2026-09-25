const mongoose = require('mongoose');

// Sample appointment data with real therapist IDs from therapist seed data
module.exports = [
  // Priya Singh (Jaipur) - Anxiety/Depression
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439001'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439010'),
    status: 'completed',
    appointmentType: 'first-session',
    sessionDuration: 60,
    scheduledAt: new Date('2026-09-20T10:00:00Z'),
    duration: 60,
    price: 800,
    type: 'video',
    notes: 'Initial consultation for anxiety management',
    paymentStatus: 'completed',
    transactionId: 'pay_001',
    feedback: {
      rating: 4.8,
      comment: 'Excellent therapist! Very understanding and professional.',
      helpful: true
    }
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439001'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    status: 'confirmed',
    appointmentType: 'follow-up',
    sessionDuration: 45,
    startTime: new Date('2026-09-26T14:00:00Z'),
    endTime: new Date('2026-09-26T14:45:00Z'),
    price: 800,
    currency: 'INR',
    mode: 'video',
    notes: 'Follow-up session for anxiety management',
    paymentStatus: 'pending',
    rescheduleCount: 0,
    noShowCount: 0,
    createdAt: new Date('2026-09-22T10:15:00Z')
  },

  // Rajesh Kumar (Jaipur) - Depression/Relationships
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439002'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    status: 'completed',
    appointmentType: 'first-session',
    sessionDuration: 60,
    startTime: new Date('2026-09-18T11:00:00Z'),
    endTime: new Date('2026-09-18T12:00:00Z'),
    price: 900,
    currency: 'INR',
    mode: 'video',
    notes: 'Initial consultation for depression',
    therapistNotes: 'Patient experiencing moderate depression. Started medication referral process.',
    paymentStatus: 'completed',
    paymentId: 'pay_002',
    rating: 4.9,
    review: 'Very knowledgeable and empathetic.',
    rescheduleCount: 0,
    noShowCount: 0,
    createdAt: new Date('2026-09-17T09:00:00Z')
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439002'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    status: 'confirmed',
    appointmentType: 'follow-up',
    sessionDuration: 45,
    startTime: new Date('2026-09-27T15:30:00Z'),
    endTime: new Date('2026-09-27T16:15:00Z'),
    price: 900,
    currency: 'INR',
    mode: 'phone',
    notes: 'Couples therapy session',
    paymentStatus: 'pending',
    rescheduleCount: 1,
    noShowCount: 0,
    createdAt: new Date('2026-09-21T14:00:00Z')
  },

  // Meera Kapoor (Jaipur) - Anxiety/Career
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439003'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    status: 'completed',
    appointmentType: 'first-session',
    sessionDuration: 60,
    startTime: new Date('2026-09-19T09:00:00Z'),
    endTime: new Date('2026-09-19T10:00:00Z'),
    price: 750,
    currency: 'INR',
    mode: 'video',
    notes: 'Career-related anxiety consultation',
    therapistNotes: 'Good rapport established. Career counseling + anxiety management recommended.',
    paymentStatus: 'completed',
    paymentId: 'pay_003',
    rating: 4.7,
    review: 'Great insights on managing work stress.',
    rescheduleCount: 0,
    noShowCount: 0,
    createdAt: new Date('2026-09-18T16:45:00Z')
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439003'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'),
    status: 'confirmed',
    appointmentType: 'follow-up',
    sessionDuration: 60,
    startTime: new Date('2026-09-28T10:30:00Z'),
    endTime: new Date('2026-09-28T11:30:00Z'),
    price: 750,
    currency: 'INR',
    mode: 'video',
    notes: 'Continue career planning and anxiety management',
    paymentStatus: 'pending',
    rescheduleCount: 0,
    noShowCount: 0,
    createdAt: new Date('2026-09-22T11:20:00Z')
  },

  // Amit Sharma (Jaipur) - PTSD/Trauma
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439004'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439016'),
    status: 'completed',
    appointmentType: 'first-session',
    sessionDuration: 90,
    startTime: new Date('2026-09-17T14:00:00Z'),
    endTime: new Date('2026-09-17T15:30:00Z'),
    price: 1000,
    currency: 'INR',
    mode: 'video',
    notes: 'PTSD trauma assessment and treatment planning',
    therapistNotes: 'Comprehensive trauma history taken. EMDR therapy recommended.',
    paymentStatus: 'completed',
    paymentId: 'pay_004',
    rating: 4.6,
    review: 'Very professional and supportive during difficult session.',
    rescheduleCount: 0,
    noShowCount: 0,
    createdAt: new Date('2026-09-16T10:00:00Z')
  },

  // Vikram Patel (Delhi) - Depression/Anxiety
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439005'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439017'),
    status: 'completed',
    appointmentType: 'first-session',
    sessionDuration: 60,
    startTime: new Date('2026-09-21T16:00:00Z'),
    endTime: new Date('2026-09-21T17:00:00Z'),
    price: 1200,
    currency: 'INR',
    mode: 'video',
    notes: 'Depression and anxiety co-morbidity assessment',
    therapistNotes: 'Started CBT protocol. Patient responsive to treatment.',
    paymentStatus: 'completed',
    paymentId: 'pay_005',
    rating: 4.9,
    review: 'Excellent therapist. Changed my perspective completely.',
    rescheduleCount: 0,
    noShowCount: 0,
    createdAt: new Date('2026-09-20T12:30:00Z')
  },

  // Sanjana Desai (Mumbai) - Anxiety/Eating Disorders
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439006'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439018'),
    status: 'confirmed',
    appointmentType: 'first-session',
    sessionDuration: 60,
    startTime: new Date('2026-09-29T11:00:00Z'),
    endTime: new Date('2026-09-29T12:00:00Z'),
    price: 1300,
    currency: 'INR',
    mode: 'video',
    notes: 'Eating disorder and anxiety disorder consultation',
    paymentStatus: 'pending',
    rescheduleCount: 0,
    noShowCount: 0,
    createdAt: new Date('2026-09-22T09:15:00Z')
  }
];
