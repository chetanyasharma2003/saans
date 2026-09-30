const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('article', 'video', 'guide', 'meditation', 'exercise', 'technique'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('text', 'video', 'audio', 'interactive'),
    defaultValue: 'text',
  },
  conditions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
  },
  duration: {
    type: DataTypes.INTEGER,
    comment: 'Duration in minutes',
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  source: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'published',
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
  tableName: 'resources',
  timestamps: true,
  indexes: [
    { fields: ['status', 'category'] },
    { fields: ['conditions'] },
    { fields: ['rating'] },
  ],
});

module.exports = Resource;
