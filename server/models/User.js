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
    trim: true
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
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
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
