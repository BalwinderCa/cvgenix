const mongoose = require('mongoose')

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  personalInfo: {
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
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    about: {
      type: String,
      trim: true
    },
    avatar: {
      type: String
    }
  },
  education: [{
    school: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      required: true,
      trim: true
    },
    field: {
      type: String,
      trim: true
    },
    startDate: {
      type: String,
      trim: true
    },
    endDate: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    gpa: {
      type: String,
      trim: true
    }
  }],
  experience: [{
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
    startDate: {
      type: String,
      trim: true
    },
    endDate: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    achievements: [{
      type: String,
      trim: true
    }]
  }],
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    category: {
      type: String,
      trim: true
    }
  }],
  projects: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    technologies: [{
      type: String,
      trim: true
    }],
    url: {
      type: String,
      trim: true
    },
    startDate: {
      type: String,
      trim: true
    },
    endDate: {
      type: String,
      trim: true
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      trim: true
    },
    date: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    }
  }],
  languages: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    proficiency: {
      type: String,
      enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
      default: 'Conversational'
    }
  }],
  socials: [{
    platform: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  hobbies: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  customSections: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      trim: true
    }
  }],
  settings: {
    fontSize: {
      type: String,
      default: 'medium'
    },
    spacing: {
      type: String,
      default: 'normal'
    },
    colorScheme: {
      type: String,
      default: 'default'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for faster queries
ResumeSchema.index({ user: 1, createdAt: -1 })
ResumeSchema.index({ isPublic: 1, createdAt: -1 })

// Virtual for full name
ResumeSchema.virtual('personalInfo.fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`
})

// Ensure virtual fields are serialized
ResumeSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Resume', ResumeSchema)
