const mongoose = require('mongoose')

const ResumeCommentSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['comment', 'suggestion', 'question', 'praise'],
    default: 'comment'
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  },
  position: {
    section: {
      type: String,
      required: true
    },
    element: {
      type: String,
      required: true
    },
    coordinates: {
      x: Number,
      y: Number
    }
  },
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Index for faster queries
ResumeCommentSchema.index({ resume: 1, createdAt: -1 })
ResumeCommentSchema.index({ user: 1, createdAt: -1 })
ResumeCommentSchema.index({ 'position.section': 1, 'position.element': 1 })

// Virtual for comment count
ResumeCommentSchema.virtual('replyCount').get(function() {
  return this.replies.length
})

// Ensure virtual fields are serialized
ResumeCommentSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('ResumeComment', ResumeCommentSchema)
