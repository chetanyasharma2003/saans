const mongoose = require('mongoose');

const communityGroupSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  description: String,
  icon: String, // URL to group icon
  coverImage: String,

  // Category & Purpose
  category: {
    type: String,
    enum: [
      'depression',
      'anxiety',
      'stress',
      'relationships',
      'work',
      'sleep',
      'trauma',
      'ptsd',
      'grief',
      'addiction',
      'self-esteem',
      'eating-disorders',
      'parenting',
      'teen-issues',
      'career',
      'support',
      'recovery',
      'general'
    ]
  },
  tags: [String],
  purpose: String, // Detailed purpose

  // Members
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: {
        type: String,
        enum: ['admin', 'moderator', 'member'],
        default: 'member'
      },
      joinedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: 'active'
      },
      _id: false
    }
  ],

  // Admins & Moderators
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Privacy & Settings
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  requireApprovalToJoin: { type: Boolean, default: false },
  allowAnonymousPosts: { type: Boolean, default: false },
  allowFileSharing: { type: Boolean, default: true },

  // Group Rules
  rules: [
    {
      order: Number,
      title: String,
      description: String,
      _id: false
    }
  ],

  // Moderation Policies
  moderationPolicy: {
    autoRemoveSpam: { type: Boolean, default: true },
    flagThresholdToHide: { type: Number, default: 5 },
    requireVerificationForPost: { type: Boolean, default: false },
    allowedContentTypes: [String] // 'text', 'image', 'video'
  },

  // Group Statistics
  stats: {
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    activeNow: { type: Number, default: 0 },
    dailyActiveUsers: { type: Number, default: 0 },
    averagePostsPerDay: Number,
    averageEngagementRate: Number
  },

  // Engagement & Health
  lastActivityDate: Date,
  engagementScore: Number, // 0-100 based on activity
  healthStatus: {
    type: String,
    enum: ['thriving', 'healthy', 'struggling', 'inactive'],
    default: 'healthy'
  },

  // Featured Content
  featuredPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost' }],
  pinnedAnnouncements: [
    {
      title: String,
      content: String,
      createdAt: Date,
      _id: false
    }
  ],

  // Moderation History
  bannedUsers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      bannedAt: Date,
      bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      _id: false
    }
  ],

  // AI Insights
  aiGeneratedInsights: {
    sentiment: String, // positive, neutral, negative
    topTopics: [String],
    commonChallenges: [String],
    successStories: [String]
  },

  // Metadata
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Indexes
communityGroupSchema.index({ category: 1, status: 1 });
communityGroupSchema.index({ members: 1 });
communityGroupSchema.index({ createdBy: 1 });
communityGroupSchema.index({ 'stats.memberCount': -1 });
communityGroupSchema.index({ engagementScore: -1 });
communityGroupSchema.index({ tags: 1 });

// Update timestamp
communityGroupSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  this.lastActivityDate = new Date();
  next();
});

module.exports = mongoose.model('CommunityGroup', communityGroupSchema);
