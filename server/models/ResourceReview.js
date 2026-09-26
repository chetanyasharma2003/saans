const mongoose = require('mongoose');

const ResourceReviewSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentalHealthResource',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    enum: [1, 2, 3, 4, 5]
  },
  title: {
    type: String,
    maxlength: 150
  },
  content: {
    type: String,
    maxlength: 1000
  },
  helpful: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['published', 'hidden', 'deleted'],
    default: 'published'
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

ResourceReviewSchema.index({ resourceId: 1, createdAt: -1 });
ResourceReviewSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

module.exports = mongoose.model('ResourceReview', ResourceReviewSchema);
