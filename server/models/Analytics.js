const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  event: {
    type: String,
    enum: [
      'user_signup',
      'user_login',
      'appointment_booked',
      'appointment_completed',
      'appointment_cancelled',
      'payment_completed',
      'ai_chat_message',
      'mood_entry',
      'community_post',
      'community_comment',
      'therapist_viewed',
      'therapist_rated',
      'message_sent',
      'notification_read',
      'user_logout'
    ],
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  metadata: {
    resourceType: String,
    resourceId: mongoose.Schema.Types.ObjectId,
    value: mongoose.Schema.Types.Mixed,
    duration: Number,
    status: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ event: 1, date: -1 });
analyticsSchema.index({ userId: 1, event: 1, date: -1 });
analyticsSchema.index({ date: -1 });

// TTL index - Delete events older than 2 years
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

module.exports = mongoose.model('Analytics', analyticsSchema);
