const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'elite'],
    default: 'basic'
  },
  planDetails: {
    name: String,
    price: Number,
    currency: { type: String, default: 'INR' },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'annual'], default: 'monthly' },
    features: [String]
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  renewalDate: Date,
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay', 'upi', 'card'],
  },
  autoRenew: { type: Boolean, default: true },
  cancellationReason: String,
  cancelledAt: Date,
  sessionsIncluded: { type: Number, default: 0 },
  sessionsUsed: { type: Number, default: 0 },
  unlimitedSessions: { type: Boolean, default: false },
  therapistAccessLevel: {
    type: String,
    enum: ['basic', 'premium', 'elite'],
    default: 'basic'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ renewalDate: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
