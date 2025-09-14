const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Resume Builder API',
    version: '1.0.0',
    description: 'A comprehensive API for building, managing, and analyzing resumes with AI-powered features',
    contact: {
      name: 'Resume Builder Team',
      email: 'support@resumebuilder.com',
      url: 'https://resumebuilder.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3001',
      description: 'Development server'
    },
    {
      url: 'https://api.resumebuilder.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      }
    },
    schemas: {
      // Common schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Operation successful'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            example: 1
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            example: 10
          },
          total: {
            type: 'integer',
            example: 100
          },
          pages: {
            type: 'integer',
            example: 10
          }
        }
      },
      
      // User schemas
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          firstName: {
            type: 'string',
            example: 'John'
          },
          lastName: {
            type: 'string',
            example: 'Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'super_admin'],
            example: 'user'
          },
          credits: {
            type: 'integer',
            minimum: 0,
            example: 3
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          preferences: {
            $ref: '#/components/schemas/UserPreferences'
          },
          lastLogin: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          }
        }
      },
      UserPreferences: {
        type: 'object',
        properties: {
          emailNotifications: {
            type: 'boolean',
            example: true
          },
          marketingEmails: {
            type: 'boolean',
            example: false
          },
          theme: {
            type: 'string',
            enum: ['light', 'dark', 'auto'],
            example: 'light'
          },
          language: {
            type: 'string',
            enum: ['en', 'es', 'fr', 'de'],
            example: 'en'
          },
          timezone: {
            type: 'string',
            example: 'UTC'
          }
        }
      },
      
      // Authentication schemas
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'password123'
          }
        }
      },
      SignupRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'John'
          },
          lastName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'Password123'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Login successful'
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          user: {
            $ref: '#/components/schemas/User'
          }
        }
      },
      
      // Resume schemas
      Resume: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          title: {
            type: 'string',
            example: 'Software Engineer Resume'
          },
          template: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          personalInfo: {
            $ref: '#/components/schemas/PersonalInfo'
          },
          summary: {
            type: 'string',
            example: 'Experienced software engineer with 5+ years of experience...'
          },
          experience: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Experience'
            }
          },
          education: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Education'
            }
          },
          skills: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Skills'
            }
          },
          projects: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Project'
            }
          },
          certifications: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Certification'
            }
          },
          languages: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Language'
            }
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            example: 'draft'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          }
        }
      },
      PersonalInfo: {
        type: 'object',
        required: ['firstName', 'lastName', 'email'],
        properties: {
          firstName: {
            type: 'string',
            example: 'John'
          },
          lastName: {
            type: 'string',
            example: 'Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          address: {
            type: 'string',
            example: '123 Main St'
          },
          city: {
            type: 'string',
            example: 'New York'
          },
          state: {
            type: 'string',
            example: 'NY'
          },
          zipCode: {
            type: 'string',
            example: '10001'
          },
          country: {
            type: 'string',
            example: 'USA'
          },
          website: {
            type: 'string',
            format: 'uri',
            example: 'https://johndoe.com'
          },
          linkedin: {
            type: 'string',
            format: 'uri',
            example: 'https://linkedin.com/in/johndoe'
          },
          github: {
            type: 'string',
            format: 'uri',
            example: 'https://github.com/johndoe'
          }
        }
      },
      Experience: {
        type: 'object',
        required: ['company', 'position', 'startDate'],
        properties: {
          company: {
            type: 'string',
            example: 'Tech Corp'
          },
          position: {
            type: 'string',
            example: 'Senior Software Engineer'
          },
          location: {
            type: 'string',
            example: 'San Francisco, CA'
          },
          startDate: {
            type: 'string',
            format: 'date',
            example: '2020-01-01'
          },
          endDate: {
            type: 'string',
            format: 'date',
            example: '2023-12-31'
          },
          current: {
            type: 'boolean',
            example: false
          },
          description: {
            type: 'string',
            example: 'Led development of web applications...'
          },
          achievements: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['Improved performance by 50%', 'Led team of 5 developers']
          }
        }
      },
      Education: {
        type: 'object',
        required: ['institution', 'degree', 'startDate'],
        properties: {
          institution: {
            type: 'string',
            example: 'University of Technology'
          },
          degree: {
            type: 'string',
            example: 'Bachelor of Science'
          },
          field: {
            type: 'string',
            example: 'Computer Science'
          },
          location: {
            type: 'string',
            example: 'Boston, MA'
          },
          startDate: {
            type: 'string',
            format: 'date',
            example: '2016-09-01'
          },
          endDate: {
            type: 'string',
            format: 'date',
            example: '2020-05-15'
          },
          current: {
            type: 'boolean',
            example: false
          },
          gpa: {
            type: 'string',
            example: '3.8'
          },
          achievements: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['Magna Cum Laude', 'Dean\'s List']
          }
        }
      },
      Skills: {
        type: 'object',
        required: ['category', 'skills'],
        properties: {
          category: {
            type: 'string',
            example: 'Programming Languages'
          },
          skills: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['JavaScript', 'Python', 'Java']
          }
        }
      },
      Project: {
        type: 'object',
        required: ['name', 'description', 'startDate'],
        properties: {
          name: {
            type: 'string',
            example: 'E-commerce Platform'
          },
          description: {
            type: 'string',
            example: 'Built a full-stack e-commerce platform...'
          },
          technologies: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['React', 'Node.js', 'MongoDB']
          },
          url: {
            type: 'string',
            format: 'uri',
            example: 'https://ecommerce-demo.com'
          },
          github: {
            type: 'string',
            format: 'uri',
            example: 'https://github.com/johndoe/ecommerce'
          },
          startDate: {
            type: 'string',
            format: 'date',
            example: '2023-01-01'
          },
          endDate: {
            type: 'string',
            format: 'date',
            example: '2023-06-30'
          },
          current: {
            type: 'boolean',
            example: false
          }
        }
      },
      Certification: {
        type: 'object',
        required: ['name', 'issuer', 'date'],
        properties: {
          name: {
            type: 'string',
            example: 'AWS Certified Solutions Architect'
          },
          issuer: {
            type: 'string',
            example: 'Amazon Web Services'
          },
          date: {
            type: 'string',
            format: 'date',
            example: '2023-03-15'
          },
          url: {
            type: 'string',
            format: 'uri',
            example: 'https://aws.amazon.com/certification/'
          },
          credentialId: {
            type: 'string',
            example: 'AWS-CSA-123456'
          }
        }
      },
      Language: {
        type: 'object',
        required: ['language', 'proficiency'],
        properties: {
          language: {
            type: 'string',
            example: 'Spanish'
          },
          proficiency: {
            type: 'string',
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'],
            example: 'Intermediate'
          }
        }
      },
      
      // Template schemas
      Template: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          name: {
            type: 'string',
            example: 'Modern Professional'
          },
          description: {
            type: 'string',
            example: 'A clean and modern resume template'
          },
          category: {
            type: 'string',
            enum: ['professional', 'creative', 'modern', 'classic', 'minimal'],
            example: 'professional'
          },
          preview: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/preview.jpg'
          },
          isPremium: {
            type: 'boolean',
            example: false
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['modern', 'clean', 'professional']
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          }
        }
      },
      
      // Cover letter schemas
      CoverLetter: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          title: {
            type: 'string',
            example: 'Software Engineer Application'
          },
          company: {
            type: 'string',
            example: 'Tech Corp'
          },
          position: {
            type: 'string',
            example: 'Senior Software Engineer'
          },
          content: {
            type: 'string',
            example: 'Dear Hiring Manager, I am writing to express my interest...'
          },
          template: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          }
        }
      },
      
      // ATS schemas
      ATSAnalysis: {
        type: 'object',
        properties: {
          score: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            example: 85
          },
          feedback: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  example: 'Keywords'
                },
                score: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 100,
                  example: 90
                },
                feedback: {
                  type: 'string',
                  example: 'Good keyword usage'
                },
                suggestions: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['Add more technical skills', 'Include industry keywords']
                }
              }
            }
          },
          keywords: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['JavaScript', 'React', 'Node.js']
          },
          missingKeywords: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['TypeScript', 'Docker']
          },
          analyzedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-09-13T09:00:00.000Z'
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options for the swagger docs
const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../routes/**/*.js')
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Swagger UI options
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
  `,
  customSiteTitle: 'Resume Builder API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions
};
