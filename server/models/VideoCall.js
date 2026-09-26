const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  channelName: {
    type: String,
    required: true
  },
  startTime: Date,
  endTime: Date,
  duration: Number,
  status: {
    type: String,
    enum: ['initiated', 'active', 'completed', 'missed', 'cancelled'],
    default: 'initiated'
  },
  agoraToken: String,
  recordingUrl: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('VideoCall', videoCallSchema);
