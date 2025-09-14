const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Template = require('../models/Template')
const Settings = require('../models/Settings')
const Resume = require('../models/Resume')
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') })

const setupSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me')
    console.log('Connected to MongoDB')

    // Create admin user if it doesn't exist
    let adminUser = await User.findOne({ email: 'admin@cvgenix.com' })
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 12)
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@cvgenix.com',
        password: hashedPassword,
        role: 'super_admin',
        subscription: {
          plan: 'pro',
          status: 'active'
        },
        isActive: true
      })
      await adminUser.save()
      console.log('Admin user created successfully!')
    } else {
      console.log('Admin user already exists')
    }

    // Create sample users
    const sampleUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        subscription: { plan: 'standard', status: 'active' },
        isActive: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        subscription: { plan: 'pro', status: 'active' },
        isActive: true
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        subscription: { plan: 'free', status: 'active' },
        isActive: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        subscription: { plan: 'standard', status: 'inactive' },
        isActive: false
      }
    ]

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email })
      if (!existingUser) {
        const user = new User(userData)
        await user.save()
        console.log(`User ${userData.email} created`)
      }
    }

    // Create sample templates
    const sampleTemplates = [
      {
        name: 'Professional Classic',
        description: 'A clean and professional template perfect for corporate environments',
        category: 'Professional',
        tags: ['corporate', 'clean', 'professional'],
        thumbnail: 'https://via.placeholder.com/300x400/3B82F6/FFFFFF?text=Professional+Classic',
        preview: 'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Professional+Classic+Preview',
        html: '<div class="resume">Professional Classic Template HTML</div>',
        css: '.resume { font-family: Arial, sans-serif; }',
        isPremium: false,
        isActive: true,
        isPopular: true,
        isNewTemplate: false,
        usageCount: 150,
        rating: { average: 4.5, count: 25 }
      },
      {
        name: 'Creative Modern',
        description: 'A modern and creative template with bold colors and unique layout',
        category: 'Creative',
        tags: ['creative', 'modern', 'bold'],
        thumbnail: 'https://via.placeholder.com/300x400/10B981/FFFFFF?text=Creative+Modern',
        preview: 'https://via.placeholder.com/800x600/10B981/FFFFFF?text=Creative+Modern+Preview',
        html: '<div class="resume">Creative Modern Template HTML</div>',
        css: '.resume { font-family: "Helvetica Neue", sans-serif; }',
        isPremium: true,
        isActive: true,
        isPopular: true,
        isNewTemplate: true,
        usageCount: 89,
        rating: { average: 4.8, count: 18 }
      },
      {
        name: 'Minimalist Clean',
        description: 'A minimalist template with clean lines and plenty of white space',
        category: 'Minimalist',
        tags: ['minimalist', 'clean', 'simple'],
        thumbnail: 'https://via.placeholder.com/300x400/6B7280/FFFFFF?text=Minimalist+Clean',
        preview: 'https://via.placeholder.com/800x600/6B7280/FFFFFF?text=Minimalist+Clean+Preview',
        html: '<div class="resume">Minimalist Clean Template HTML</div>',
        css: '.resume { font-family: "Inter", sans-serif; }',
        isPremium: false,
        isActive: true,
        isPopular: false,
        isNewTemplate: false,
        usageCount: 67,
        rating: { average: 4.2, count: 12 }
      },
      {
        name: 'Executive Premium',
        description: 'A premium executive template designed for senior professionals',
        category: 'Executive',
        tags: ['executive', 'premium', 'senior'],
        thumbnail: 'https://via.placeholder.com/300x400/DC2626/FFFFFF?text=Executive+Premium',
        preview: 'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Executive+Premium+Preview',
        html: '<div class="resume">Executive Premium Template HTML</div>',
        css: '.resume { font-family: "Times New Roman", serif; }',
        isPremium: true,
        isActive: true,
        isPopular: false,
        isNewTemplate: false,
        usageCount: 34,
        rating: { average: 4.9, count: 8 }
      }
    ]

    for (const templateData of sampleTemplates) {
      const existingTemplate = await Template.findOne({ name: templateData.name })
      if (!existingTemplate) {
        const template = new Template(templateData)
        await template.save()
        console.log(`Template ${templateData.name} created`)
      }
    }

    // Create sample resumes
    const professionalTemplate = await Template.findOne({ name: 'Professional Classic' })
    if (professionalTemplate) {
      const sampleResumes = [
        {
          user: adminUser._id,
          template: professionalTemplate._id,
          personalInfo: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@cvgenix.com',
            phone: '+1 (555) 123-4567',
            address: 'New York, NY'
          },
          experience: [
            {
              company: 'Tech Corp',
              position: 'Senior Developer',
              startDate: '2020-01-01',
              endDate: '2023-12-31',
              description: 'Led development team and implemented new features'
            }
          ],
          education: [
            {
              school: 'University of Technology',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              startDate: '2016-09-01',
              endDate: '2020-05-01',
              description: 'Graduated with honors'
            }
          ],
          skills: [
            {
              name: 'JavaScript',
              level: 'Expert',
              category: 'Programming'
            },
            {
              name: 'React',
              level: 'Advanced',
              category: 'Frontend'
            },
            {
              name: 'Node.js',
              level: 'Advanced',
              category: 'Backend'
            }
          ],
          isPublic: false
        }
      ]

      for (const resumeData of sampleResumes) {
        const existingResume = await Resume.findOne({ 
          user: resumeData.user, 
          template: resumeData.template 
        })
        if (!existingResume) {
          const resume = new Resume(resumeData)
          await resume.save()
          console.log('Sample resume created')
        }
      }
    }

    // Create or update settings
    let settings = await Settings.findOne()
    if (!settings) {
      settings = new Settings({
        siteName: 'Resume4Me',
        siteDescription: 'Professional Resume Builder with AI-Powered Features',
        logo: '/logo.png',
        heroTitle: 'Create Professional Resumes in Minutes',
        heroSubtitle: 'Build stunning resumes with our AI-powered builder and professional templates',
        features: [
          'AI-Powered Resume Builder',
          'Professional Templates',
          'ATS-Friendly Formats',
          'Real-time Preview',
          'PDF Export',
          'Mobile Responsive'
        ],
        pricing: {
          free: {
            price: 0,
            features: ['Basic Templates', 'PDF Export', 'Email Support']
          },
          standard: {
            price: 9.99,
            features: ['All Templates', 'Priority Support', 'Custom Branding']
          },
          pro: {
            price: 19.99,
            features: ['Everything in Standard', 'AI Writing Assistant', 'Unlimited Exports']
          }
        },
        contact: {
          email: 'support@cvgenix.com',
          phone: '+1 (555) 123-4567',
          address: '123 Resume Street, CV City, RC 12345'
        },
        social: {
          facebook: 'https://facebook.com/resume4me',
          twitter: 'https://twitter.com/resume4me',
          linkedin: 'https://linkedin.com/company/resume4me',
          instagram: 'https://instagram.com/resume4me'
        }
      })
      await settings.save()
      console.log('Settings created successfully')
    } else {
      console.log('Settings already exist')
    }

    console.log('\n✅ Sample data setup completed successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('Admin: admin@cvgenix.com / admin123')
    console.log('Users: john.doe@example.com / password123')
    console.log('Users: jane.smith@example.com / password123')
    console.log('Users: mike.johnson@example.com / password123')

  } catch (error) {
    console.error('Error setting up sample data:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

setupSampleData()
