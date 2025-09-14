const express = require('express')
const auth = require('../middleware/auth')
const resumeScoringService = require('../services/resumeScoringService')
const Resume = require('../models/Resume')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// @route   POST /api/resume-scoring/analyze/:resumeId
// @desc    Analyze and score a resume
// @access  Private
router.post('/analyze/:resumeId', auth, [
  body('industry').optional().isString(),
  body('role').optional().isString(),
  body('experienceLevel').optional().isIn(['entry', 'mid', 'senior', 'lead', 'executive'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { resumeId } = req.params
    const { industry, role, experienceLevel } = req.body

    // Get resume
    const resume = await Resume.findById(resumeId)
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      })
    }

    // Check if user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      })
    }

    // Calculate score
    const result = await resumeScoringService.calculateResumeScore(resume, {
      industry,
      role,
      experienceLevel
    })

    res.json(result)
  } catch (error) {
    console.error('Error analyzing resume:', error)
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message
    })
  }
})

// @route   GET /api/resume-scoring/benchmarks
// @desc    Get industry benchmarks
// @access  Public
router.get('/benchmarks', async (req, res) => {
  try {
    const { industry = 'general' } = req.query

    const benchmarks = {
      general: {
        completeness: 85,
        contentQuality: 75,
        formatting: 90,
        keywords: 70,
        achievements: 60,
        skills: 80,
        education: 85
      },
      technology: {
        completeness: 90,
        contentQuality: 80,
        formatting: 95,
        keywords: 85,
        achievements: 75,
        skills: 90,
        education: 80
      },
      healthcare: {
        completeness: 88,
        contentQuality: 85,
        formatting: 92,
        keywords: 75,
        achievements: 70,
        skills: 85,
        education: 90
      },
      finance: {
        completeness: 87,
        contentQuality: 82,
        formatting: 93,
        keywords: 80,
        achievements: 78,
        skills: 88,
        education: 85
      },
      marketing: {
        completeness: 85,
        contentQuality: 88,
        formatting: 90,
        keywords: 90,
        achievements: 85,
        skills: 85,
        education: 80
      }
    }

    const industryBenchmarks = benchmarks[industry.toLowerCase()] || benchmarks.general

    res.json({
      success: true,
      data: {
        industry,
        benchmarks: industryBenchmarks,
        description: `Industry benchmarks for ${industry} sector`
      }
    })
  } catch (error) {
    console.error('Error fetching benchmarks:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching benchmarks',
      error: error.message
    })
  }
})

// @route   GET /api/resume-scoring/industries
// @desc    Get available industries for scoring
// @access  Public
router.get('/industries', async (req, res) => {
  try {
    const industries = [
      { id: 'general', name: 'General', description: 'General purpose resume scoring' },
      { id: 'technology', name: 'Technology', description: 'Software development, IT, engineering' },
      { id: 'healthcare', name: 'Healthcare', description: 'Medical, nursing, healthcare services' },
      { id: 'finance', name: 'Finance', description: 'Banking, investment, financial services' },
      { id: 'marketing', name: 'Marketing', description: 'Digital marketing, advertising, PR' },
      { id: 'education', name: 'Education', description: 'Teaching, academic, educational services' },
      { id: 'sales', name: 'Sales', description: 'Sales, business development, account management' },
      { id: 'consulting', name: 'Consulting', description: 'Management consulting, advisory services' },
      { id: 'manufacturing', name: 'Manufacturing', description: 'Production, operations, supply chain' },
      { id: 'retail', name: 'Retail', description: 'Retail, e-commerce, customer service' }
    ]

    res.json({
      success: true,
      data: industries
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

// @route   GET /api/resume-scoring/roles
// @desc    Get available roles for scoring
// @access  Public
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      { id: 'entry', name: 'Entry Level', description: '0-2 years experience' },
      { id: 'mid', name: 'Mid Level', description: '3-5 years experience' },
      { id: 'senior', name: 'Senior Level', description: '6-10 years experience' },
      { id: 'lead', name: 'Lead/Principal', description: '10+ years experience' },
      { id: 'executive', name: 'Executive', description: 'C-level, VP, Director' }
    ]

    res.json({
      success: true,
      data: roles
    })
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    })
  }
})

// @route   POST /api/resume-scoring/compare
// @desc    Compare multiple resumes
// @access  Private
router.post('/compare', auth, [
  body('resumeIds').isArray().withMessage('Resume IDs array is required'),
  body('resumeIds.*').isMongoId().withMessage('Valid resume ID is required'),
  body('industry').optional().isString(),
  body('role').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { resumeIds, industry, role } = req.body

    // Get resumes
    const resumes = await Resume.find({
      _id: { $in: resumeIds },
      user: req.user.id
    })

    if (resumes.length !== resumeIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some resumes not found or not accessible'
      })
    }

    // Calculate scores for each resume
    const comparisons = []
    for (const resume of resumes) {
      const result = await resumeScoringService.calculateResumeScore(resume, {
        industry,
        role
      })
      
      comparisons.push({
        resumeId: resume._id,
        resumeName: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`,
        score: result.data
      })
    }

    // Sort by total score
    comparisons.sort((a, b) => b.score.totalScore - a.score.totalScore)

    res.json({
      success: true,
      data: {
        comparisons,
        industry,
        role,
        analyzedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error comparing resumes:', error)
    res.status(500).json({
      success: false,
      message: 'Error comparing resumes',
      error: error.message
    })
  }
})

module.exports = router
