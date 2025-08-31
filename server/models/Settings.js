const mongoose = require('mongoose')

const SettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Resume4Me',
    trim: true
  },
  siteDescription: {
    type: String,
    default: 'Professional Resume Builder',
    trim: true
  },
  logo: {
    type: String,
    default: '/logo.png'
  },
  primaryColor: {
    type: String,
    default: '#3B82F6'
  },
  secondaryColor: {
    type: String,
    default: '#6B7280'
  },
  accentColor: {
    type: String,
    default: '#10B981'
  },
  heroTitle: {
    type: String,
    default: 'Create Professional Resumes in Minutes'
  },
  heroSubtitle: {
    type: String,
    default: 'Build stunning resumes with our AI-powered builder and professional templates'
  },
  features: {
    type: [String],
    default: [
      'AI-Powered Resume Builder',
      'Professional Templates',
      'ATS-Friendly Formats',
      'Real-time Preview'
    ]
  },
  pricing: {
    free: {
      price: { type: Number, default: 0 },
      features: { type: [String], default: ['Basic Templates', 'PDF Export', 'Email Support'] }
    },
    standard: {
      price: { type: Number, default: 9.99 },
      features: { type: [String], default: ['All Templates', 'Priority Support', 'Custom Branding'] }
    },
    pro: {
      price: { type: Number, default: 19.99 },
      features: { type: [String], default: ['Everything in Standard', 'AI Writing Assistant', 'Unlimited Exports'] }
    }
  },
  contact: {
    email: { type: String, default: 'support@resume4me.com' },
    phone: { type: String, default: '+1 (555) 123-4567' },
    address: { type: String, default: '123 Resume Street, CV City, RC 12345' }
  },
  social: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  analytics: {
    googleAnalyticsId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' }
  },
  maintenance: {
    isMaintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'We are currently performing maintenance. Please check back soon.' }
  },
  seo: {
    metaTitle: { type: String, default: 'Resume4Me - Professional Resume Builder' },
    metaDescription: { type: String, default: 'Create professional resumes with our AI-powered builder' },
    keywords: { type: String, default: 'resume builder, cv maker, professional resume' }
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Settings', SettingsSchema)
