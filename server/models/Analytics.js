const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'user_signup',
      'user_login',
      'appointment_booked',
      'appointment_completed',
      'appointment_cancelled',
      'therapist_rated',
      'community_post_created',
      'community_post_upvoted',
      'resource_viewed',
      'mood_entry_created',
      'subscription_started',
      'subscription_renewed',
      'subscription_cancelled',
      'payment_completed',
      'payment_failed',
      'message_sent',
      'session_duration'
    ],
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist'
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  metadata: {
    duration: Number,
    rating: Number,
    amount: Number,
    currency: String,
    category: String,
    status: String,
    customData: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  date: {
    type: Date,
    default: () => new Date(new Date().setHours(0, 0, 0, 0))
  }
});

AnalyticsSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsSchema.index({ eventType: 1, date: -1 });
AnalyticsSchema.index({ userId: 1, timestamp: -1 });
AnalyticsSchema.index({ therapistId: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
