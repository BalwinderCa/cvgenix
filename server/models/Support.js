const mongoose = require('mongoose');

const SupportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'read', 'replied', 'resolved'],
    default: 'new'
  },
  adminNotes: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
SupportSchema.index({ status: 1, createdAt: -1 });
SupportSchema.index({ email: 1 });

module.exports = mongoose.models.Support || mongoose.model('Support', SupportSchema);

