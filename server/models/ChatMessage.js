const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'emoji', 'system'],
    default: 'text'
  },
  metadata: {
    fileUrl: String,
    fileName: String,
    imageUrl: String,
    imageSize: String,
    mimeType: String
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: Date
  }],
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatMessageSchema.index({ roomId: 1, timestamp: -1 });
chatMessageSchema.index({ senderId: 1, timestamp: -1 });
chatMessageSchema.index({ timestamp: -1 });

// TTL index - Delete messages older than 2 years
chatMessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
