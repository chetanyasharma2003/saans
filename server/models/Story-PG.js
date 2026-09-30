const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Story = sequelize.define('Story', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  authorName: {
    type: DataTypes.STRING(100),
    defaultValue: 'Anonymous',
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'approved'),
    defaultValue: 'approved',
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  helpful: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
  tableName: 'stories',
  timestamps: true,
  indexes: [
    { fields: ['status', 'category', 'createdAt'] },
    { fields: ['userId'] },
    { fields: ['category'] },
  ],
});

module.exports = Story;
