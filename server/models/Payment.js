const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripePaymentId: {
    type: String,
    required: true,
    unique: true
  },
  stripeSessionId: {
    type: String,
    default: null,
    index: true
  },
  stripeInvoiceId: {
    type: String,
    default: null
  },
  stripeChargeId: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['credit_purchase', 'subscription', 'invoice', 'charge', 'payment'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'refunded', 'succeeded'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  credits: {
    type: Number,
    default: 0
  },
  planId: {
    type: String,
    default: null
  },
  invoiceUrl: {
    type: String,
    default: null
  },
  receiptUrl: {
    type: String,
    default: null
  },
  invoiceNumber: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  paymentDate: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
})

// Index for faster queries
PaymentSchema.index({ user: 1, paymentDate: -1 })
PaymentSchema.index({ user: 1, status: 1 })
// Note: stripePaymentId unique index is already defined in schema above

// Ensure virtual fields are serialized
PaymentSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Payment', PaymentSchema)

