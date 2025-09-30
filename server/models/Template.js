const mongoose = require('mongoose')

const TemplateSchema = new mongoose.Schema({
  // Core Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Professional', 'Creative', 'Minimalist', 'Modern', 'Classic', 'Executive'],
    default: 'Professional'
  },
  
  // Visual Assets
  thumbnail: {
    type: String,
    required: true
  },
  preview: {
    type: String,
    required: true
  },
  
  // Template Engine & Data
  renderEngine: {
    type: String,
    enum: ['html', 'builder', 'canvas', 'jsx'],
    default: 'builder'
  },
  canvasData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  builderData: {
    components: [{
      type: {
        type: String,
        required: true
      },
      tagName: {
        type: String,
        default: 'div'
      },
      content: {
        type: String,
        default: ''
      },
      style: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      attributes: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      classes: [{
        type: String
      }],
      components: {
        type: mongoose.Schema.Types.Mixed,
        default: []
      }
    }],
    style: {
      type: String,
      default: ''
    }
  },
  
  // Status & Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isNewTemplate: {
    type: Boolean,
    default: false
  },
  
  // Organization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Essential Metadata Only
  metadata: {
    colorScheme: {
      type: String,
      enum: ['light', 'dark', 'colorful'],
      default: 'light'
    },
    layout: {
      type: String,
      enum: ['single-column', 'two-column', 'hybrid'],
      default: 'single-column'
    },
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex'],
      default: 'moderate'
    }
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
})

// Index for faster queries
TemplateSchema.index({ category: 1, isActive: 1 })
TemplateSchema.index({ isPopular: 1, isActive: 1 })
TemplateSchema.index({ isNewTemplate: 1, isActive: 1 })
TemplateSchema.index({ tags: 1, isActive: 1 })

// Virtual for full template name
TemplateSchema.virtual('fullName').get(function() {
  return `${this.name} - ${this.category}`
})

// Ensure virtual fields are serialized
TemplateSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Template', TemplateSchema)
