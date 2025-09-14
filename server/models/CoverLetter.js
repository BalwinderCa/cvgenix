const mongoose = require('mongoose')

const CoverLetterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  jobApplication: {
    company: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    jobDescription: {
      type: String,
      trim: true
    },
    applicationDate: {
      type: Date,
      default: Date.now
    },
    applicationStatus: {
      type: String,
      enum: ['draft', 'applied', 'interview', 'rejected', 'accepted'],
      default: 'draft'
    },
    jobUrl: {
      type: String,
      trim: true
    },
    recruiterName: {
      type: String,
      trim: true
    },
    recruiterEmail: {
      type: String,
      trim: true
    }
  },
  content: {
    greeting: {
      type: String,
      default: 'Dear Hiring Manager,',
      trim: true
    },
    opening: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    closing: {
      type: String,
      default: 'Sincerely,',
      trim: true
    },
    signature: {
      type: String,
      trim: true
    }
  },
  customization: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    fontFamily: {
      type: String,
      enum: ['arial', 'times', 'calibri', 'helvetica'],
      default: 'arial'
    },
    colorScheme: {
      primary: {
        type: String,
        default: '#2563eb'
      },
      secondary: {
        type: String,
        default: '#64748b'
      },
      text: {
        type: String,
        default: '#1f2937'
      }
    },
    spacing: {
      type: String,
      enum: ['compact', 'normal', 'spacious'],
      default: 'normal'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for faster queries
CoverLetterSchema.index({ user: 1, createdAt: -1 })
CoverLetterSchema.index({ resume: 1 })
CoverLetterSchema.index({ shareToken: 1 })
CoverLetterSchema.index({ 'jobApplication.applicationStatus': 1 })

// Generate share token before saving
CoverLetterSchema.pre('save', function(next) {
  if (this.isPublic && !this.shareToken) {
    this.shareToken = require('crypto').randomBytes(16).toString('hex')
  }
  next()
})

// Virtual for full content
CoverLetterSchema.virtual('fullContent').get(function() {
  return {
    greeting: this.content.greeting,
    opening: this.content.opening,
    body: this.content.body,
    closing: this.content.closing,
    signature: this.content.signature
  }
})

// Ensure virtual fields are serialized
CoverLetterSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('CoverLetter', CoverLetterSchema)
