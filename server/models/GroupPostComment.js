const mongoose = require('mongoose');

const GroupPostCommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupPost',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1000
  },
  upvotes: {
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

GroupPostCommentSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model('GroupPostComment', GroupPostCommentSchema);
