const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  credits: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  description: {
    type: String,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  popular: {
    type: Boolean,
    default: false
  },
  interval: {
    type: String,
    enum: ['month', 'year', null],
    default: 'month'
  },
  yearlyPrice: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Export model, but check if it already exists to avoid overwriting
module.exports = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);

