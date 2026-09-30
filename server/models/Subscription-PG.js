const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
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
  plan: {
    type: DataTypes.ENUM('free', 'basic', 'premium', 'pro'),
    defaultValue: 'free',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired', 'pending'),
    defaultValue: 'active',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  billingCycle: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'annually'),
    defaultValue: 'monthly',
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endDate: DataTypes.DATE,
  renewalDate: DataTypes.DATE,
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  paymentMethod: DataTypes.STRING,
  transactionId: DataTypes.STRING,
  cancellationReason: DataTypes.TEXT,
  cancelledAt: DataTypes.DATE,
  features: {
    type: DataTypes.JSON,
    defaultValue: {
      therapy_sessions: 0,
      ai_counselor: false,
      community_access: false,
      resources_access: false,
      appointment_booking: false,
    },
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
  tableName: 'subscriptions',
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
  ],
});

module.exports = Subscription;
