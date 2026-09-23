const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: String,
  tags: [String],
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  likedBy: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

communityPostSchema.index({ userId: 1, createdAt: -1 });
communityPostSchema.index({ category: 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
