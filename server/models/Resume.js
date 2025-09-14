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
  customization: {
    colors: {
      primary: {
        type: String,
        default: '#2563eb'
      },
      secondary: {
        type: String,
        default: '#64748b'
      },
      accent: {
        type: String,
        default: '#f59e0b'
      },
      text: {
        type: String,
        default: '#1f2937'
      },
      background: {
        type: String,
        default: '#ffffff'
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
      },
      size: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      }
    },
    layout: {
      spacing: {
        type: String,
        enum: ['compact', 'normal', 'spacious'],
        default: 'normal'
      },
      sections: {
        type: [String],
        default: ['personalInfo', 'experience', 'education', 'skills']
      },
      showSectionIcons: {
        type: Boolean,
        default: true
      },
      showSectionDividers: {
        type: Boolean,
        default: true
      }
    },
    styling: {
      borderRadius: {
        type: String,
        enum: ['none', 'small', 'medium', 'large'],
        default: 'small'
      },
      shadow: {
        type: String,
        enum: ['none', 'light', 'medium', 'heavy'],
        default: 'light'
      },
      borderStyle: {
        type: String,
        enum: ['none', 'solid', 'dashed', 'dotted'],
        default: 'solid'
      }
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
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
ResumeSchema.index({ user: 1, createdAt: -1 })
ResumeSchema.index({ isPublic: 1, createdAt: -1 })
// shareToken index is automatically created due to sparse: true

// Generate share token before saving
ResumeSchema.pre('save', function(next) {
  if (this.isPublic && !this.shareToken) {
    this.shareToken = require('crypto').randomBytes(16).toString('hex')
  } else if (!this.isPublic) {
    this.shareToken = undefined
  }
  next()
})

// Virtual for full name
ResumeSchema.virtual('personalInfo.fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`
})

// Ensure virtual fields are serialized
ResumeSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Resume', ResumeSchema)
