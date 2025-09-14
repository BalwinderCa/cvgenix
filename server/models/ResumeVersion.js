const mongoose = require('mongoose')

const ResumeVersionSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  changes: [{
    field: {
      type: String,
      required: true
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changeType: {
      type: String,
      enum: ['added', 'modified', 'removed'],
      required: true
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Indexes
ResumeVersionSchema.index({ resume: 1, version: -1 })
ResumeVersionSchema.index({ user: 1, createdAt: -1 })
ResumeVersionSchema.index({ isActive: 1 })

// Ensure unique version per resume
ResumeVersionSchema.index({ resume: 1, version: 1 }, { unique: true })

module.exports = mongoose.model('ResumeVersion', ResumeVersionSchema)
