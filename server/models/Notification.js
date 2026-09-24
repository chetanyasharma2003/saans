const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'message',
      'appointment',
      'therapist-online',
      'mood-milestone',
      'community-reply',
      'system',
      'alert',
      'reminder'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    relatedUserId: mongoose.Schema.Types.ObjectId,
    relatedRoomId: String,
    relatedResourceId: mongoose.Schema.Types.ObjectId,
    actionUrl: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, timestamp: -1 });
notificationSchema.index({ userId: 1, timestamp: -1 });
notificationSchema.index({ type: 1, timestamp: -1 });

// TTL index - Delete notifications older than 90 days
notificationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Notification', notificationSchema);
