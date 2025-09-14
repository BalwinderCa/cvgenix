const mongoose = require('mongoose')

const JobPostingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
      default: 'medium'
    },
    industry: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      city: String,
      state: String,
      country: String,
      remote: {
        type: Boolean,
        default: false
      }
    }
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    experience: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 10
      }
    },
    education: {
      type: String,
      enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'any'],
      default: 'any'
    },
    skills: [{
      name: String,
      required: Boolean,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      }
    }],
    certifications: [String],
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native'],
        default: 'conversational'
      }
    }]
  },
  compensation: {
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    benefits: [String],
    equity: {
      type: String,
      enum: ['none', 'small', 'medium', 'large'],
      default: 'none'
    }
  },
  employment: {
    type: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'internship', 'freelance'],
      default: 'full_time'
    },
    level: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid'
    }
  },
  application: {
    url: String,
    email: String,
    deadline: Date,
    process: [String]
  },
  keywords: [String],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  source: {
    type: String,
    enum: ['manual', 'api', 'scraped'],
    default: 'manual'
  },
  externalId: String,
  externalUrl: String
}, {
  timestamps: true
})

// Indexes for search and matching
JobPostingSchema.index({ title: 'text', description: 'text', 'company.name': 'text' })
JobPostingSchema.index({ 'company.industry': 1 })
JobPostingSchema.index({ 'company.location.city': 1 })
JobPostingSchema.index({ 'employment.type': 1, 'employment.level': 1 })
JobPostingSchema.index({ 'requirements.skills.name': 1 })
JobPostingSchema.index({ isActive: 1, createdAt: -1 })
JobPostingSchema.index({ keywords: 1 })

module.exports = mongoose.model('JobPosting', JobPostingSchema)
