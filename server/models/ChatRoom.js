const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['private', 'therapist', 'group', 'community'],
    default: 'private'
  },
  description: String,
  avatar: String,
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: Date,
  messageCount: {
    type: Number,
    default: 0
  },
  settings: {
    allowFiles: { type: Boolean, default: true },
    allowVoiceMessages: { type: Boolean, default: true },
    allowVideoMessages: { type: Boolean, default: false },
    onlyAdminCanPost: { type: Boolean, default: false },
    encryptMessages: { type: Boolean, default: false }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatRoomSchema.index({ type: 1 });
chatRoomSchema.index({ 'members.userId': 1 });
chatRoomSchema.index({ isActive: 1, lastMessageAt: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
