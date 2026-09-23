const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Mood Data
  mood: { type: Number, required: true, min: 1, max: 10 },
  moodLabel: String,
  intensity: { type: String, enum: ['low', 'medium', 'high'] },

  // Context
  activities: [String],
  triggers: [String],
  notes: String,

  // Tags
  tags: [String],

  // Time
  date: { type: Date, default: Date.now },
  time: String,

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for queries
moodEntrySchema.index({ userId: 1, date: -1 });
moodEntrySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
