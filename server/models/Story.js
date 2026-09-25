const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  // Author info (anonymous option)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    default: 'Anonymous'
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },

  // Content
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 5000
  },
  summary: String,

  // Metadata
  category: {
    type: String,
    enum: ['anxiety', 'depression', 'ptsd', 'trauma', 'relationships', 'work', 'grief', 'addiction', 'sleep', 'eating-disorders', 'self-esteem', 'career'],
    required: true
  },
  tags: [String],

  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNotes: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,

  // Engagement
  upvotes: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  shares: {
    type: Number,
    default: 0
  },

  // Stats
  views: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
StorySchema.index({ status: 1, createdAt: -1 });
StorySchema.index({ category: 1, status: 1 });
StorySchema.index({ userId: 1 });

module.exports = mongoose.model('Story', StorySchema);
