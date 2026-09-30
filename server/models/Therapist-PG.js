const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Therapist = sequelize.define('Therapist', {
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
    unique: true,
  },
  licenseNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  specializations: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  bio: DataTypes.TEXT,
  experience: DataTypes.INTEGER,
  languages: {
    type: DataTypes.JSON,
    defaultValue: ['English'],
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verificationDocument: DataTypes.STRING,
  availability: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  maxPatientsPerMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  currentPatients: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  certificateUrl: DataTypes.STRING,
  education: DataTypes.JSON,
  clinicAddress: DataTypes.TEXT,
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  responseTime: {
    type: DataTypes.INTEGER,
    comment: 'Response time in minutes',
  },
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
  tableName: 'therapists',
  indexes: [
    { fields: ['isVerified', 'isActive'] },
    { fields: ['rating'] },
  ],
});

module.exports = Therapist;
