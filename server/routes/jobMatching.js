const express = require('express')
const auth = require('../middleware/auth')
const jobMatchingService = require('../services/jobMatchingService')
const JobPosting = require('../models/JobPosting')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// @route   GET /api/jobs/matches/:resumeId
// @desc    Get job matches for a resume
// @access  Private
router.get('/matches/:resumeId', auth, async (req, res) => {
  try {
    const { resumeId } = req.params
    const { 
      limit = 10, 
      industry, 
      location, 
      experienceLevel 
    } = req.query

    const result = await jobMatchingService.findJobMatches(resumeId, {
      limit: parseInt(limit),
      industry,
      location,
      experienceLevel
    })

    res.json(result)
  } catch (error) {
    console.error('Error finding job matches:', error)
    res.status(500).json({
      success: false,
      message: 'Error finding job matches',
      error: error.message
    })
  }
})

// @route   GET /api/jobs/search
// @desc    Search job postings
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const {
      q: query,
      industry,
      location,
      experienceLevel,
      employmentType,
      page = 1,
      limit = 20
    } = req.query

    const searchCriteria = {
      isActive: true
    }

    // Text search
    if (query) {
      searchCriteria.$text = { $search: query }
    }

    // Industry filter
    if (industry) {
      searchCriteria['company.industry'] = new RegExp(industry, 'i')
    }

    // Location filter
    if (location) {
      searchCriteria.$or = [
        { 'company.location.city': new RegExp(location, 'i') },
        { 'company.location.state': new RegExp(location, 'i') },
        { 'company.location.remote': true }
      ]
    }

    // Experience level filter
    if (experienceLevel) {
      searchCriteria['employment.level'] = experienceLevel
    }

    // Employment type filter
    if (employmentType) {
      searchCriteria['employment.type'] = employmentType
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const jobs = await JobPosting.find(searchCriteria)
      .sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')

    const total = await JobPosting.countDocuments(searchCriteria)

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    console.error('Error searching jobs:', error)
    res.status(500).json({
      success: false,
      message: 'Error searching jobs',
      error: error.message
    })
  }
})

// @route   GET /api/jobs/:id
// @desc    Get job posting by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id)

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      })
    }

    res.json({
      success: true,
      data: job
    })
  } catch (error) {
    console.error('Error fetching job:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    })
  }
})

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Admin)
router.post('/', auth, [
  body('title').notEmpty().withMessage('Job title is required'),
  body('company.name').notEmpty().withMessage('Company name is required'),
  body('company.industry').notEmpty().withMessage('Company industry is required'),
  body('description').notEmpty().withMessage('Job description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      })
    }

    const jobData = {
      ...req.body,
      postedBy: req.user.id,
      source: 'manual'
    }

    const job = new JobPosting(jobData)
    await job.save()

    res.status(201).json({
      success: true,
      data: job
    })
  } catch (error) {
    console.error('Error creating job posting:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating job posting',
      error: error.message
    })
  }
})

// @route   GET /api/jobs/industries
// @desc    Get list of industries
// @access  Public
router.get('/meta/industries', async (req, res) => {
  try {
    const industries = await JobPosting.distinct('company.industry', { isActive: true })
    
    res.json({
      success: true,
      data: industries.sort()
    })
  } catch (error) {
    console.error('Error fetching industries:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching industries',
      error: error.message
    })
  }
})

// @route   GET /api/jobs/locations
// @desc    Get list of locations
// @access  Public
router.get('/meta/locations', async (req, res) => {
  try {
    const locations = await JobPosting.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            city: '$company.location.city',
            state: '$company.location.state',
            country: '$company.location.country'
          },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          '_id.city': { $ne: null },
          '_id.state': { $ne: null }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 50
      }
    ])

    const formattedLocations = locations.map(loc => ({
      city: loc._id.city,
      state: loc._id.state,
      country: loc._id.country,
      count: loc.count,
      display: `${loc._id.city}, ${loc._id.state}`
    }))

    res.json({
      success: true,
      data: formattedLocations
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    })
  }
})

module.exports = router
