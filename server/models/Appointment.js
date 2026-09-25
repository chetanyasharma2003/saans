const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },

  // Schedule - Combined date and time into single field
  scheduledAt: {
    type: Date,
    required: true,
    index: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Appointment must be scheduled for a future date and time'
    }
  },
  duration: { type: Number, default: 60, enum: [30, 45, 60, 90] },
  timezone: { type: String, default: 'Asia/Kolkata' },

  // Details
  type: { type: String, enum: ['video', 'audio', 'chat'], default: 'video' },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: String,
  cancellationReason: String,

  // Payment
  price: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: String,

  // Follow-up
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    helpful: Boolean,
  },

  // Video Call
  meetingLink: String,
  recordingUrl: String,
}, { timestamps: true });

// Index for queries
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ therapistId: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
