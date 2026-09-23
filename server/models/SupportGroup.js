const mongoose = require('mongoose');

const supportGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  memberCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

supportGroupSchema.index({ category: 1 });
supportGroupSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SupportGroup', supportGroupSchema);
