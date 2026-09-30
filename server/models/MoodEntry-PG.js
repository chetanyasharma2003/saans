const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MoodEntry = sequelize.define('MoodEntry', {
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
  mood: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  energy: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  stress: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  anxiety: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  notes: DataTypes.TEXT,
  activities: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  weather: DataTypes.STRING,
  sleepHours: DataTypes.DECIMAL(3, 1),
  exerciseMinutes: DataTypes.INTEGER,
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  enteredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
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
  tableName: 'mood_entries',
  indexes: [
    { fields: ['userId', 'date'] },
    { fields: ['date'] },
  ],
});

module.exports = MoodEntry;
