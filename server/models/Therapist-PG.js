const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Therapist = sequelize.define('Therapist', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    avatar: { type: DataTypes.STRING },
    specializations: { type: DataTypes.JSON, defaultValue: [] },
    languages: { type: DataTypes.JSON, defaultValue: ['English'] },
    qualifications: { type: DataTypes.JSON, defaultValue: [] },
    licenseNumber: { type: DataTypes.STRING },
    yearsOfExperience: { type: DataTypes.INTEGER, defaultValue: 0 },
    hourlyRate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1000 },
    availabilitySlots: { type: DataTypes.JSON, defaultValue: [] },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    totalRatings: { type: DataTypes.INTEGER, defaultValue: 0 },
    sessionsCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
    responseTime: { type: DataTypes.STRING, defaultValue: 'Within 1 hour' },
    location: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    timezone: { type: DataTypes.STRING },
    acceptNewClients: { type: DataTypes.BOOLEAN, defaultValue: true },
    consultationType: { type: DataTypes.JSON, defaultValue: ['online', 'phone'] },
    certificateUrl: { type: DataTypes.STRING },
    profileCompleteness: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'Therapists',
    timestamps: true,
    indexes: [
      { fields: ['isActive', 'isVerified'] },
      { fields: ['rating'] },
      { fields: ['city'] },
      { fields: ['specializations'] }
    ]
  });

module.exports = Therapist;
