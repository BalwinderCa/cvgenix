const mongoose = require('mongoose')

const ResumeAnalyticsSchema = new mongoose.Schema({
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
  views: {
    total: {
      type: Number,
      default: 0
    },
    unique: {
      type: Number,
      default: 0
    },
    byCountry: [{
      country: String,
      count: Number
    }],
    byDevice: [{
      device: String,
      count: Number
    }],
    bySource: [{
      source: String,
      count: Number
    }]
  },
  downloads: {
    total: {
      type: Number,
      default: 0
    },
    byFormat: [{
      format: String,
      count: Number
    }],
    byDate: [{
      date: Date,
      count: Number
    }]
  },
  shares: {
    total: {
      type: Number,
      default: 0
    },
    byPlatform: [{
      platform: String,
      count: Number
    }]
  },
  atsAnalysis: {
    totalAnalyses: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    scoreHistory: [{
      score: Number,
      date: Date,
      industry: String,
      role: String
    }]
  },
  engagement: {
    timeSpent: {
      type: Number,
      default: 0
    },
    interactions: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date,
      default: Date.now
    }
  },
  performance: {
    loadTime: {
      type: Number,
      default: 0
    },
    errorRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Indexes for performance
ResumeAnalyticsSchema.index({ resume: 1, user: 1 })
ResumeAnalyticsSchema.index({ 'views.total': -1 })
ResumeAnalyticsSchema.index({ 'downloads.total': -1 })
ResumeAnalyticsSchema.index({ createdAt: -1 })

module.exports = mongoose.model('ResumeAnalytics', ResumeAnalyticsSchema)
