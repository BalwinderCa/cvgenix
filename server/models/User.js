const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  credits: {
    type: Number,
    default: 3,
    min: 0
  },
  stripeCustomerId: {
    type: String,
    default: null,
    sparse: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'standard', 'pro'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired', 'past_due'],
      default: 'active'
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    },
    currentPeriodStart: {
      type: Date,
      default: null
    },
    currentPeriodEnd: {
      type: Date,
      default: null
    }
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password
    return ret
  }
})

module.exports = mongoose.model('User', UserSchema)
