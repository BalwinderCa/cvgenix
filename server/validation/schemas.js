const Joi = require('joi');

// Common validation patterns
const patterns = {
  email: Joi.string().email().lowercase().trim().max(255),
  password: Joi.string().min(6).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).messages({
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  }),
  name: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s\-']+$/).trim(),
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  url: Joi.string().uri(),
  date: Joi.date().iso(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  },
  sort: Joi.string().pattern(/^[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?$/).default('createdAt:desc')
};

// Authentication schemas
const authSchemas = {
  signup: Joi.object({
    firstName: patterns.name.required(),
    lastName: patterns.name.required(),
    email: patterns.email.required(),
    password: patterns.password.required()
  }),

  login: Joi.object({
    email: patterns.email.required(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: patterns.email.required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: patterns.password.required()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: patterns.password.required()
  })
};

// User schemas
const userSchemas = {
  updateProfile: Joi.object({
    firstName: patterns.name.optional(),
    lastName: patterns.name.optional(),
    email: patterns.email.optional(),
    phone: patterns.phone,
    preferences: Joi.object({
      emailNotifications: Joi.boolean(),
      marketingEmails: Joi.boolean(),
      theme: Joi.string().valid('light', 'dark', 'auto'),
      language: Joi.string().valid('en', 'es', 'fr', 'de'),
      timezone: Joi.string()
    }).optional()
  }),

  updatePreferences: Joi.object({
    emailNotifications: Joi.boolean(),
    marketingEmails: Joi.boolean(),
    theme: Joi.string().valid('light', 'dark', 'auto'),
    language: Joi.string().valid('en', 'es', 'fr', 'de'),
    timezone: Joi.string()
  })
};

// Resume schemas
const resumeSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    template: patterns.objectId.required(),
    personalInfo: Joi.object({
      firstName: patterns.name.required(),
      lastName: patterns.name.required(),
      email: patterns.email.required(),
      phone: patterns.phone,
      address: Joi.string().max(255).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional(),
      website: patterns.url.optional(),
      linkedin: patterns.url.optional(),
      github: patterns.url.optional()
    }).required(),
    summary: Joi.string().max(1000).optional(),
    experience: Joi.array().items(
      Joi.object({
        company: Joi.string().min(1).max(100).required(),
        position: Joi.string().min(1).max(100).required(),
        location: Joi.string().max(100).optional(),
        startDate: patterns.date.required(),
        endDate: patterns.date.optional(),
        current: Joi.boolean().default(false),
        description: Joi.string().max(2000).optional(),
        achievements: Joi.array().items(Joi.string().max(500)).max(10).optional()
      })
    ).max(20).optional(),
    education: Joi.array().items(
      Joi.object({
        institution: Joi.string().min(1).max(100).required(),
        degree: Joi.string().min(1).max(100).required(),
        field: Joi.string().max(100).optional(),
        location: Joi.string().max(100).optional(),
        startDate: patterns.date.required(),
        endDate: patterns.date.optional(),
        current: Joi.boolean().default(false),
        gpa: Joi.string().max(10).optional(),
        achievements: Joi.array().items(Joi.string().max(500)).max(10).optional()
      })
    ).max(10).optional(),
    skills: Joi.array().items(
      Joi.object({
        category: Joi.string().min(1).max(50).required(),
        skills: Joi.array().items(Joi.string().min(1).max(50)).min(1).max(20).required()
      })
    ).max(10).optional(),
    projects: Joi.array().items(
      Joi.object({
        name: Joi.string().min(1).max(100).required(),
        description: Joi.string().max(1000).required(),
        technologies: Joi.array().items(Joi.string().max(50)).max(20).optional(),
        url: patterns.url.optional(),
        github: patterns.url.optional(),
        startDate: patterns.date.required(),
        endDate: patterns.date.optional(),
        current: Joi.boolean().default(false)
      })
    ).max(15).optional(),
    certifications: Joi.array().items(
      Joi.object({
        name: Joi.string().min(1).max(100).required(),
        issuer: Joi.string().min(1).max(100).required(),
        date: patterns.date.required(),
        url: patterns.url.optional(),
        credentialId: Joi.string().max(100).optional()
      })
    ).max(10).optional(),
    languages: Joi.array().items(
      Joi.object({
        language: Joi.string().min(1).max(50).required(),
        proficiency: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Native').required()
      })
    ).max(10).optional()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    template: patterns.objectId.optional(),
    personalInfo: Joi.object({
      firstName: patterns.name.optional(),
      lastName: patterns.name.optional(),
      email: patterns.email.optional(),
      phone: patterns.phone,
      address: Joi.string().max(255).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional(),
      website: patterns.url.optional(),
      linkedin: patterns.url.optional(),
      github: patterns.url.optional()
    }).optional(),
    summary: Joi.string().max(1000).optional(),
    experience: Joi.array().items(
      Joi.object({
        company: Joi.string().min(1).max(100).required(),
        position: Joi.string().min(1).max(100).required(),
        location: Joi.string().max(100).optional(),
        startDate: patterns.date.required(),
        endDate: patterns.date.optional(),
        current: Joi.boolean().default(false),
        description: Joi.string().max(2000).optional(),
        achievements: Joi.array().items(Joi.string().max(500)).max(10).optional()
      })
    ).max(20).optional(),
    education: Joi.array().items(
      Joi.object({
        institution: Joi.string().min(1).max(100).required(),
        degree: Joi.string().min(1).max(100).required(),
        field: Joi.string().max(100).optional(),
        location: Joi.string().max(100).optional(),
        startDate: patterns.date.required(),
        endDate: patterns.date.optional(),
        current: Joi.boolean().default(false),
        gpa: Joi.string().max(10).optional(),
        achievements: Joi.array().items(Joi.string().max(500)).max(10).optional()
      })
    ).max(10).optional(),
    skills: Joi.array().items(
      Joi.object({
        category: Joi.string().min(1).max(50).required(),
        skills: Joi.array().items(Joi.string().min(1).max(50)).min(1).max(20).required()
      })
    ).max(10).optional(),
    projects: Joi.array().items(
      Joi.object({
        name: Joi.string().min(1).max(100).required(),
        description: Joi.string().max(1000).required(),
        technologies: Joi.array().items(Joi.string().max(50)).max(20).optional(),
        url: patterns.url.optional(),
        github: patterns.url.optional(),
        startDate: patterns.date.required(),
        endDate: patterns.date.optional(),
        current: Joi.boolean().default(false)
      })
    ).max(15).optional(),
    certifications: Joi.array().items(
      Joi.object({
        name: Joi.string().min(1).max(100).required(),
        issuer: Joi.string().min(1).max(100).required(),
        date: patterns.date.required(),
        url: patterns.url.optional(),
        credentialId: Joi.string().max(100).optional()
      })
    ).max(10).optional(),
    languages: Joi.array().items(
      Joi.object({
        language: Joi.string().min(1).max(50).required(),
        proficiency: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Native').required()
      })
    ).max(10).optional()
  }),

  query: Joi.object({
    page: patterns.pagination.page,
    limit: patterns.pagination.limit,
    sort: patterns.sort,
    search: Joi.string().max(100).optional(),
    category: Joi.string().max(50).optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional()
  })
};

// Template schemas
const templateSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().valid('professional', 'creative', 'modern', 'classic', 'minimal').required(),
    html: Joi.string().min(100).required(),
    css: Joi.string().optional(),
    preview: Joi.string().uri().optional(),
    isPremium: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string().max(30)).max(10).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().valid('professional', 'creative', 'modern', 'classic', 'minimal').optional(),
    html: Joi.string().min(100).optional(),
    css: Joi.string().optional(),
    preview: Joi.string().uri().optional(),
    isPremium: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string().max(30)).max(10).optional()
  }),

  query: Joi.object({
    page: patterns.pagination.page,
    limit: patterns.pagination.limit,
    sort: patterns.sort,
    search: Joi.string().max(100).optional(),
    category: Joi.string().valid('professional', 'creative', 'modern', 'classic', 'minimal').optional(),
    isPremium: Joi.boolean().optional()
  })
};

// Cover letter schemas
const coverLetterSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    company: Joi.string().min(1).max(100).required(),
    position: Joi.string().min(1).max(100).required(),
    content: Joi.string().min(100).max(5000).required(),
    template: patterns.objectId.optional()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    company: Joi.string().min(1).max(100).optional(),
    position: Joi.string().min(1).max(100).optional(),
    content: Joi.string().min(100).max(5000).optional(),
    template: patterns.objectId.optional()
  }),

  query: Joi.object({
    page: patterns.pagination.page,
    limit: patterns.pagination.limit,
    sort: patterns.sort,
    search: Joi.string().max(100).optional()
  })
};

// File upload schemas
const fileSchemas = {
  upload: Joi.object({
    type: Joi.string().valid('resume', 'avatar', 'document').required(),
    description: Joi.string().max(255).optional()
  })
};

// Admin schemas
const adminSchemas = {
  createUser: Joi.object({
    firstName: patterns.name.required(),
    lastName: patterns.name.required(),
    email: patterns.email.required(),
    password: patterns.password.required(),
    role: Joi.string().valid('user', 'admin', 'super_admin').default('user'),
    credits: Joi.number().integer().min(0).max(1000).default(3)
  }),

  updateUser: Joi.object({
    firstName: patterns.name.optional(),
    lastName: patterns.name.optional(),
    email: patterns.email.optional(),
    role: Joi.string().valid('user', 'admin', 'super_admin').optional(),
    credits: Joi.number().integer().min(0).max(1000).optional(),
    isActive: Joi.boolean().optional()
  }),

  query: Joi.object({
    page: patterns.pagination.page,
    limit: patterns.pagination.limit,
    sort: patterns.sort,
    search: Joi.string().max(100).optional(),
    role: Joi.string().valid('user', 'admin', 'super_admin').optional(),
    isActive: Joi.boolean().optional()
  })
};

// Export all schemas
module.exports = {
  patterns,
  authSchemas,
  userSchemas,
  resumeSchemas,
  templateSchemas,
  coverLetterSchemas,
  fileSchemas,
  adminSchemas
};
