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
  query('isNew').optional().isBoolean(),
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
      isNew,
      search,
      limit = 20,
      page = 1
    } = req.query

    // Build filter object
    const filter = { isActive: true }

    if (category) filter.category = category
    if (isPremium !== undefined) filter.isPremium = isPremium === 'true'
    if (isPopular !== undefined) filter.isPopular = isPopular === 'true'
    if (isNew !== undefined) filter.isNew = isNew === 'true'

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
      .select('name description category thumbnail tags isPremium isPopular isNew usageCount rating')
      .sort({ isPopular: -1, isNew: -1, usageCount: -1, createdAt: -1 })
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
      isNew: true 
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
