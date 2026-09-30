const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  therapistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'therapists',
      key: 'id',
    },
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    validate: {
      isIn: [[30, 45, 60, 90]],
    },
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'Asia/Kolkata',
  },
  type: {
    type: DataTypes.ENUM('video', 'audio', 'chat'),
    defaultValue: 'video',
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'),
    defaultValue: 'scheduled',
  },
  notes: DataTypes.TEXT,
  cancellationReason: DataTypes.TEXT,
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  transactionId: DataTypes.STRING,
  feedbackRating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  feedbackComment: DataTypes.TEXT,
  feedbackHelpful: DataTypes.BOOLEAN,
  meetingLink: DataTypes.STRING,
  recordingUrl: DataTypes.STRING,
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'appointments',
  indexes: [
    { fields: ['userId', 'scheduledAt'] },
    { fields: ['therapistId', 'scheduledAt'] },
    { fields: ['status', 'scheduledAt'] },
  ],
});

module.exports = Appointment;
