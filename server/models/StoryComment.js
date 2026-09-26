const mongoose = require('mongoose');

const StoryCommentSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
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
  likes: {
    type: Number,
    default: 0
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

StoryCommentSchema.index({ storyId: 1, createdAt: -1 });

module.exports = mongoose.model('StoryComment', StoryCommentSchema);
