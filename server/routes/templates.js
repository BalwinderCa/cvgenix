const express = require('express')
const { query, body, validationResult } = require('express-validator')
const Template = require('../models/Template')

const router = express.Router()

// @route   GET /api/templates
// @desc    Get all active templates with optional filtering
// @access  Public
router.get('/', [
  query('category').optional().isIn(['Professional', 'Creative', 'Minimalist', 'Modern', 'Classic', 'Executive']),
  query('isPremium').optional().isBoolean(),
  query('isPopular').optional().isBoolean(),
  query('isNewTemplate').optional().isBoolean(),
  query('search').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const {
      category,
      isPremium,
      isPopular,
      isNewTemplate,
      search,
      limit = 20,
      page = 1
    } = req.query

    // Build filter object
    const filter = { isActive: true }

    if (category) filter.category = category
    if (isPremium !== undefined) filter.isPremium = isPremium === 'true'
    if (isPopular !== undefined) filter.isPopular = isPopular === 'true'
    if (isNewTemplate !== undefined) filter.isNewTemplate = isNewTemplate === 'true'

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query
    const templates = await Template.find(filter)
      .select('name description category thumbnail tags isPremium isPopular isNewTemplate usageCount rating')
      .sort({ isPopular: -1, isNewTemplate: -1, usageCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    // Get total count for pagination
    const total = await Template.countDocuments(filter)

    res.json({
      templates,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + templates.length < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/templates/:id
// @desc    Get template by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (!template.isActive) {
      return res.status(404).json({ message: 'Template not found' })
    }

    res.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/templates/:id/preview
// @desc    Get template preview with sample data
// @access  Public
router.get('/:id/preview', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (!template.isActive) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Sample data for preview
    const sampleData = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street',
        city: 'New York',
        province: 'NY',
        postalCode: '10001',
        linkedin: 'linkedin.com/in/johndoe',
        website: 'johndoe.com',
        summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about building scalable applications and mentoring junior developers.'
      },
      experience: [
        {
          id: 'exp1',
          company: 'Tech Solutions Inc.',
          position: 'Senior Software Engineer',
          startDate: '2022-01',
          endDate: '2024-12',
          current: true,
          description: 'Lead development of microservices architecture and mentor junior developers.',
          achievements: [
            'Improved system performance by 40% through optimization',
            'Led a team of 5 developers on critical projects',
            'Implemented CI/CD pipeline reducing deployment time by 60%'
          ]
        },
        {
          id: 'exp2',
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          startDate: '2020-06',
          endDate: '2021-12',
          current: false,
          description: 'Developed web applications using React, Node.js, and PostgreSQL.',
          achievements: [
            'Built responsive web applications serving 10,000+ users',
            'Collaborated with design team to implement user-friendly interfaces',
            'Reduced bug reports by 30% through improved testing practices'
          ]
        }
      ],
      education: [
        {
          id: 'edu1',
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2016-09',
          endDate: '2020-05',
          gpa: '3.8'
        }
      ],
      skills: [
        { id: 'skill1', name: 'JavaScript', level: 'Expert', category: 'Technical Skills' },
        { id: 'skill2', name: 'React', level: 'Advanced', category: 'Technical Skills' },
        { id: 'skill3', name: 'Node.js', level: 'Advanced', category: 'Technical Skills' },
        { id: 'skill4', name: 'Python', level: 'Intermediate', category: 'Technical Skills' },
        { id: 'skill5', name: 'Project Management', level: 'Advanced', category: 'Soft Skills' },
        { id: 'skill6', name: 'Team Leadership', level: 'Advanced', category: 'Soft Skills' }
      ],
      languages: [
        { id: 'lang1', language: 'English', proficiency: 'Native' },
        { id: 'lang2', language: 'Spanish', proficiency: 'Intermediate' }
      ],
      certifications: [
        {
          id: 'cert1',
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023-03',
          url: 'https://aws.amazon.com/certification/'
        }
      ],
      socialLinks: [
        { id: 'social1', platform: 'GitHub', url: 'https://github.com/johndoe' },
        { id: 'social2', platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' }
      ],
      customSections: []
    }

    // Generate HTML with sample data
    const handlebars = require('handlebars')
    const compiledTemplate = handlebars.compile(template.html)
    const htmlContent = compiledTemplate(sampleData)

    // Combine with CSS
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Preview - ${template.name}</title>
    <style>${template.css}</style>
</head>
<body>
    ${htmlContent}
</body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    res.send(fullHtml)
  } catch (error) {
    console.error('Error generating template preview:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/templates/:id/preview
// @desc    Generate template preview with custom data
// @access  Public
router.post('/:id/preview', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (!template.isActive) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Use provided data or fallback to sample data
    const userData = req.body || {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street',
        city: 'New York',
        province: 'NY',
        postalCode: '10001',
        linkedin: 'linkedin.com/in/johndoe',
        website: 'johndoe.com',
        summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about building scalable applications and mentoring junior developers.'
      },
      experience: [
        {
          id: 'exp1',
          company: 'Tech Solutions Inc.',
          position: 'Senior Software Engineer',
          startDate: '2022-01',
          endDate: '2024-12',
          current: true,
          description: 'Lead development of microservices architecture and mentor junior developers.',
          achievements: [
            'Improved system performance by 40% through optimization',
            'Led a team of 5 developers on critical projects',
            'Implemented CI/CD pipeline reducing deployment time by 60%'
          ]
        }
      ],
      education: [
        {
          id: 'edu1',
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2016-09',
          endDate: '2020-05',
          gpa: '3.8'
        }
      ],
      skills: [
        { id: 'skill1', name: 'JavaScript', level: 'Expert', category: 'Technical Skills' },
        { id: 'skill2', name: 'React', level: 'Advanced', category: 'Technical Skills' },
        { id: 'skill3', name: 'Node.js', level: 'Advanced', category: 'Technical Skills' }
      ],
      languages: [
        { id: 'lang1', language: 'English', proficiency: 'Native' }
      ],
      certifications: [],
      socialLinks: [],
      customSections: []
    }

    // Generate HTML with user data
    const handlebars = require('handlebars')
    const compiledTemplate = handlebars.compile(template.html)
    const htmlContent = compiledTemplate(userData)

    // Combine with CSS
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Preview - ${template.name}</title>
    <style>${template.css}</style>
</head>
<body>
    ${htmlContent}
</body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    res.send(fullHtml)
  } catch (error) {
    console.error('Error generating template preview:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/templates/categories
// @desc    Get all template categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Template.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/templates/popular
// @desc    Get popular templates
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 6 } = req.query

    const templates = await Template.find({ 
      isActive: true,
      isPopular: true 
    })
      .select('name description category thumbnail tags isPremium usageCount rating')
      .sort({ usageCount: -1, rating: -1 })
      .limit(parseInt(limit))

    res.json(templates)
  } catch (error) {
    console.error('Error fetching popular templates:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/templates/new
// @desc    Get new templates
// @access  Public
router.get('/new', async (req, res) => {
  try {
    const { limit = 6 } = req.query

    const templates = await Template.find({ 
      isActive: true,
      isNewTemplate: true 
    })
      .select('name description category thumbnail tags isPremium usageCount rating')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    res.json(templates)
  } catch (error) {
    console.error('Error fetching new templates:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/templates/:id/use
// @desc    Increment template usage count
// @access  Public
router.post('/:id/use', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (!template.isActive) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Increment usage count
    template.usageCount += 1
    await template.save()

    res.json({ message: 'Usage count updated' })
  } catch (error) {
    console.error('Error updating template usage:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/templates/:id/rate
// @desc    Rate a template
// @access  Public
router.post('/:id/rate', [
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { rating } = req.body

    const template = await Template.findById(req.params.id)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (!template.isActive) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Update rating
    const currentTotal = template.rating.average * template.rating.count
    const newTotal = currentTotal + rating
    const newCount = template.rating.count + 1
    const newAverage = newTotal / newCount

    template.rating = {
      average: Math.round(newAverage * 10) / 10, // Round to 1 decimal place
      count: newCount
    }

    await template.save()

    res.json({ 
      message: 'Rating updated',
      newRating: template.rating
    })
  } catch (error) {
    console.error('Error rating template:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
