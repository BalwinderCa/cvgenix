const express = require('express')
const auth = require('../middleware/auth')
const ResumeAnalytics = require('../models/ResumeAnalytics')
const Resume = require('../models/Resume')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// @route   GET /api/analytics/resume/:id
// @desc    Get analytics for a specific resume
// @access  Private
router.get('/resume/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
    
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

    const analytics = await ResumeAnalytics.findOne({ resume: req.params.id })
    
    if (!analytics) {
      // Create analytics record if it doesn't exist
      const newAnalytics = new ResumeAnalytics({
        resume: req.params.id,
        user: req.user.id
      })
      await newAnalytics.save()
      
      return res.json({
        success: true,
        data: newAnalytics
      })
    }

    res.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error fetching resume analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})


// @route   POST /api/analytics/track
// @desc    Track resume interaction
// @access  Public
router.post('/track', [
  body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
  body('action').isIn(['view', 'download', 'share']).withMessage('Valid action is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { resumeId, action, metadata = {} } = req.body

    // Find or create analytics record
    let analytics = await ResumeAnalytics.findOne({ resume: resumeId })
    
    if (!analytics) {
      const resume = await Resume.findById(resumeId)
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        })
      }

      analytics = new ResumeAnalytics({
        resume: resumeId,
        user: resume.user
      })
    }

    // Update analytics based on action
    switch (action) {
      case 'view':
        analytics.views.total += 1
        if (metadata.unique) {
          analytics.views.unique += 1
        }
        
        // Track by country
        if (metadata.country) {
          const countryIndex = analytics.views.byCountry.findIndex(c => c.country === metadata.country)
          if (countryIndex >= 0) {
            analytics.views.byCountry[countryIndex].count += 1
          } else {
            analytics.views.byCountry.push({ country: metadata.country, count: 1 })
          }
        }
        
        // Track by device
        if (metadata.device) {
          const deviceIndex = analytics.views.byDevice.findIndex(d => d.device === metadata.device)
          if (deviceIndex >= 0) {
            analytics.views.byDevice[deviceIndex].count += 1
          } else {
            analytics.views.byDevice.push({ device: metadata.device, count: 1 })
          }
        }
        break

      case 'download':
        analytics.downloads.total += 1
        
        if (metadata.format) {
          const formatIndex = analytics.downloads.byFormat.findIndex(f => f.format === metadata.format)
          if (formatIndex >= 0) {
            analytics.downloads.byFormat[formatIndex].count += 1
          } else {
            analytics.downloads.byFormat.push({ format: metadata.format, count: 1 })
          }
        }
        break

      case 'share':
        analytics.shares.total += 1
        
        if (metadata.platform) {
          const platformIndex = analytics.shares.byPlatform.findIndex(p => p.platform === metadata.platform)
          if (platformIndex >= 0) {
            analytics.shares.byPlatform[platformIndex].count += 1
          } else {
            analytics.shares.byPlatform.push({ platform: metadata.platform, count: 1 })
          }
        }
        break
    }

    await analytics.save()

    res.json({
      success: true,
      message: 'Analytics tracked successfully'
    })
  } catch (error) {
    console.error('Error tracking analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/analytics/ats-score
// @desc    Track ATS analysis score
// @access  Private
router.post('/ats-score', auth, [
  body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
  body('score').isNumeric().withMessage('Valid score is required'),
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

    const { resumeId, score, industry, role } = req.body

    // Find or create analytics record
    let analytics = await ResumeAnalytics.findOne({ resume: resumeId })
    
    if (!analytics) {
      analytics = new ResumeAnalytics({
        resume: resumeId,
        user: req.user.id
      })
    }

    // Update ATS analysis data
    analytics.atsAnalysis.totalAnalyses += 1
    analytics.atsAnalysis.scoreHistory.push({
      score: parseFloat(score),
      date: new Date(),
      industry: industry || 'General',
      role: role || 'General'
    })

    // Calculate new average score
    const totalScore = analytics.atsAnalysis.scoreHistory.reduce((sum, s) => sum + s.score, 0)
    analytics.atsAnalysis.averageScore = totalScore / analytics.atsAnalysis.scoreHistory.length

    await analytics.save()

    res.json({
      success: true,
      message: 'ATS score tracked successfully',
      data: {
        averageScore: analytics.atsAnalysis.averageScore,
        totalAnalyses: analytics.atsAnalysis.totalAnalyses
      }
    })
  } catch (error) {
    console.error('Error tracking ATS score:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router
