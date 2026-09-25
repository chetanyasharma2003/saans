const mongoose = require('mongoose');

// Sample appointment data - FUTURE dates only, correct schema fields
module.exports = [
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439001'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439010'),
    status: 'confirmed',
    scheduledAt: new Date('2026-09-26T10:00:00Z'),
    duration: 60,
    type: 'video',
    price: 800,
    notes: 'Initial consultation for anxiety management',
    paymentStatus: 'pending'
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439001'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    status: 'confirmed',
    scheduledAt: new Date('2026-09-26T14:00:00Z'),
    duration: 45,
    type: 'video',
    price: 800,
    notes: 'Follow-up session for anxiety management',
    paymentStatus: 'pending'
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439002'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    status: 'confirmed',
    scheduledAt: new Date('2026-09-27T11:00:00Z'),
    duration: 60,
    type: 'video',
    price: 900,
    notes: 'Initial consultation for depression',
    paymentStatus: 'pending'
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439002'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    status: 'confirmed',
    scheduledAt: new Date('2026-09-27T15:30:00Z'),
    duration: 45,
    type: 'audio',
    price: 900,
    notes: 'Couples therapy session',
    paymentStatus: 'pending'
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439003'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    status: 'confirmed',
    scheduledAt: new Date('2026-09-26T09:00:00Z'),
    duration: 60,
    type: 'video',
    price: 750,
    notes: 'Career-related anxiety consultation',
    paymentStatus: 'pending'
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439003'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'),
    status: 'confirmed',
    scheduledAt: new Date('2026-09-28T10:30:00Z'),
    duration: 60,
    type: 'video',
    price: 750,
    notes: 'Continue career planning and anxiety management',
    paymentStatus: 'pending'
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439004'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439016'),
    status: 'confirmed',
    scheduledAt: new Date('2026-09-29T14:00:00Z'),
    duration: 90,
    type: 'video',
    price: 1000,
    notes: 'PTSD trauma assessment and treatment planning',
    paymentStatus: 'pending'
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439005'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439017'),
    status: 'confirmed',
    scheduledAt: new Date('2026-09-30T16:00:00Z'),
    duration: 60,
    type: 'video',
    price: 1200,
    notes: 'Depression and anxiety co-morbidity assessment',
    paymentStatus: 'pending'
  },
  {
    therapistId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439006'),
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439018'),
    status: 'confirmed',
    scheduledAt: new Date('2026-09-29T11:00:00Z'),
    duration: 60,
    type: 'video',
    price: 1300,
    notes: 'Eating disorder and anxiety disorder consultation',
    paymentStatus: 'pending'
  }
];
