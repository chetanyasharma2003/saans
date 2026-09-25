const mongoose = require('mongoose');

const CommunityGroupSchema = new mongoose.Schema({
  // Group info
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: String, // emoji or icon
  color: {
    type: String,
    default: '#9333ea' // purple
  },

  // Category
  category: {
    type: String,
    enum: ['anxiety', 'depression', 'ptsd', 'trauma', 'relationships', 'work', 'grief', 'addiction', 'sleep', 'eating-disorders', 'self-esteem', 'career'],
    required: true
  },

  // Creator & Moderators
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Members
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  memberCount: {
    type: Number,
    default: 0
  },

  // Rules
  rules: [String],
  guidelines: String,

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },

  // Stats
  postCount: {
    type: Number,
    default: 0
  },
  views: {
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
CommunityGroupSchema.index({ category: 1 });
CommunityGroupSchema.index({ slug: 1 });
CommunityGroupSchema.index({ memberCount: -1 });

module.exports = mongoose.model('CommunityGroup', CommunityGroupSchema);
