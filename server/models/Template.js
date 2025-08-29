const mongoose = require('mongoose')

const TemplateSchema = new mongoose.Schema({
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
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    required: true
  },
  preview: {
    type: String,
    required: true
  },
  html: {
    type: String,
    required: true
  },
  css: {
    type: String,
    required: true
  },
  config: {
    sections: [{
      name: {
        type: String,
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    colors: {
      primary: {
        type: String,
        default: '#3B82F6'
      },
      secondary: {
        type: String,
        default: '#6B7280'
      },
      accent: {
        type: String,
        default: '#10B981'
      }
    },
    fonts: {
      heading: {
        type: String,
        default: 'Inter'
      },
      body: {
        type: String,
        default: 'Inter'
      }
    },
    spacing: {
      type: String,
      enum: ['compact', 'normal', 'spacious'],
      default: 'normal'
    }
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  compatibility: {
    ats: {
      type: Boolean,
      default: true
    },
    mobile: {
      type: Boolean,
      default: true
    },
    print: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    author: {
      type: String,
      trim: true
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
})

// Index for faster queries
TemplateSchema.index({ category: 1, isActive: 1 })
TemplateSchema.index({ isPopular: 1, isActive: 1 })
TemplateSchema.index({ isNew: 1, isActive: 1 })
TemplateSchema.index({ tags: 1, isActive: 1 })

// Virtual for full template name
TemplateSchema.virtual('fullName').get(function() {
  return `${this.name} - ${this.category}`
})

// Ensure virtual fields are serialized
TemplateSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Template', TemplateSchema)
