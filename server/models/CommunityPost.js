const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  // Author
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String, // For Reddit posts

  // Content
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: String, // URL to featured image

  // Categorization
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
      'general'
    ]
  },
  tags: [String], // #anxiety #depression #help

  // Source
  source: {
    type: String,
    enum: ['user', 'reddit', 'curated'],
    default: 'user'
  },
  externalSource: {
    platform: String, // 'reddit'
    postId: String, // Reddit post ID
    url: String,
    author: String
  },

  // Content Quality
  isVerified: { type: Boolean, default: false }, // Verified mental health pro
  isFeatured: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  contentWarning: String, // e.g., "Mentions suicide"

  // Engagement
  engagement: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },

  // Comments
  comments: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      upvotes: { type: Number, default: 0 },
      replies: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          text: String,
          upvotes: { type: Number, default: 0 },
          createdAt: Date
        }
      ],
      createdAt: { type: Date, default: Date.now },
      updatedAt: Date
    }
  ],

  // Moderation
  status: {
    type: String,
    enum: ['published', 'draft', 'hidden', 'deleted'],
    default: 'published'
  },
  moderationNotes: String,
  flagged: { type: Boolean, default: false },
  flagReason: String, // spam, offensive, misinformation
  flagCount: { type: Number, default: 0 },

  // Metadata
  readTime: Number, // estimated minutes to read
  helpfulCount: { type: Number, default: 0 },
  resolutionStatus: {
    type: String,
    enum: ['open', 'resolved', 'closed'],
    default: 'open'
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  publishedAt: Date
});

// Indexes for efficient querying
communityPostSchema.index({ userId: 1, createdAt: -1 });
communityPostSchema.index({ category: 1, status: 1 });
communityPostSchema.index({ tags: 1 });
communityPostSchema.index({ 'engagement.upvotes': -1, createdAt: -1 });
communityPostSchema.index({ source: 1 });
communityPostSchema.index({ isVerified: 1 });
communityPostSchema.index({ status: 1 });
communityPostSchema.index({ 'externalSource.postId': 1 });

// Text search index
communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Update timestamp on save
communityPostSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (!this.publishedAt && this.status === 'published') {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
