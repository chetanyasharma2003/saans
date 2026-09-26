const mongoose = require('mongoose');

const GroupPostSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 300
  },
  content: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 5000
  },
  category: String,
  tags: [String],
  upvotes: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['published', 'hidden', 'deleted'],
    default: 'published'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

GroupPostSchema.index({ groupId: 1, createdAt: -1 });
GroupPostSchema.index({ groupId: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('GroupPost', GroupPostSchema);
