const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  fieldOfStudy: String,
  startDate: Date,
  endDate: Date,
  gpa: String,
  description: String
});

const experienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  location: String,
  startDate: Date,
  endDate: Date,
  current: {
    type: Boolean,
    default: false
  },
  description: [String]
});

const skillSchema = new mongoose.Schema({
  name: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  }
});

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  link: String,
  startDate: Date,
  endDate: Date
});

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume'
  },
  template: {
    type: String,
    required: true,
    default: 'modern'
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    linkedin: String,
    website: String,
    summary: String
  },
  education: [educationSchema],
  experience: [experienceSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    link: String
  }],
  languages: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native'],
      default: 'conversational'
    }
  }],
  customSections: [{
    title: String,
    content: [String]
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
      default: 'professional'
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
});

// Index for faster queries
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ isPublic: 1, lastModified: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
