const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  paymentGatewayId: {
    type: String,
    unique: true,
    sparse: true
  },
  orderId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentDetails: {
    cardBrand: String,
    cardLast4: String,
    payerName: String,
    payerEmail: String,
    payerPhone: String
  },
  refund: {
    refundId: String,
    amount: Number,
    status: String,
    requestedAt: Date,
    refundedAt: Date,
    reason: String
  },
  metadata: {
    description: String,
    orderId: String,
    invoiceId: String,
    notes: String
  },
  failureReason: String,
  attemptCount: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
