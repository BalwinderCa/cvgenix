const express = require('express')
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const CoverLetter = require('../models/CoverLetter')
const Resume = require('../models/Resume')
const Template = require('../models/Template')
const { v4: uuidv4 } = require('uuid')

const router = express.Router()

// @route   GET /api/cover-letters
// @desc    Get all cover letters for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const skip = (page - 1) * limit

    let query = { user: req.user.id }
    if (status) {
      query['jobApplication.applicationStatus'] = status
    }

    const coverLetters = await CoverLetter.find(query)
      .populate('resume', 'personalInfo.firstName personalInfo.lastName')
      .populate('template', 'name category thumbnail')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await CoverLetter.countDocuments(query)

    res.json({
      success: true,
      data: coverLetters,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Error fetching cover letters:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   GET /api/cover-letters/:id
// @desc    Get cover letter by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findById(req.params.id)
      .populate('resume', 'personalInfo education experience skills')
      .populate('template', 'name category html css config')

    if (!coverLetter) {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }

    // Check if user owns the cover letter or if it's public
    if (coverLetter.user.toString() !== req.user.id && !coverLetter.isPublic) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    res.json({
      success: true,
      data: coverLetter
    })
  } catch (error) {
    console.error('Error fetching cover letter:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   POST /api/cover-letters
// @desc    Create a new cover letter
// @access  Private
router.post('/', [
  auth,
  [
    body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
    body('templateId').isMongoId().withMessage('Valid template ID is required'),
    body('jobApplication.company').notEmpty().withMessage('Company name is required'),
    body('jobApplication.position').notEmpty().withMessage('Position is required'),
    body('content.opening').notEmpty().withMessage('Opening paragraph is required'),
    body('content.body').notEmpty().withMessage('Body content is required')
  ]
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation Error',
      errors: errors.array() 
    })
  }

  try {
    const { resumeId, templateId, ...coverLetterData } = req.body

    // Verify resume exists and user owns it
    const resume = await Resume.findById(resumeId)
    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      })
    }

    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to use this resume' 
      })
    }

    // Verify template exists
    const template = await Template.findById(templateId)
    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: 'Template not found' 
      })
    }

    // Create new cover letter
    const coverLetter = new CoverLetter({
      user: req.user.id,
      resume: resumeId,
      template: templateId,
      ...coverLetterData
    })

    await coverLetter.save()

    // Populate related data
    await coverLetter.populate([
      { path: 'resume', select: 'personalInfo.firstName personalInfo.lastName' },
      { path: 'template', select: 'name category thumbnail' }
    ])

    res.status(201).json({
      success: true,
      data: coverLetter
    })
  } catch (error) {
    console.error('Error creating cover letter:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   PUT /api/cover-letters/:id
// @desc    Update cover letter
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findById(req.params.id)

    if (!coverLetter) {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }

    // Check if user owns the cover letter
    if (coverLetter.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    // Update cover letter
    const updatedCoverLetter = await CoverLetter.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        lastModified: Date.now()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'resume', select: 'personalInfo education experience skills' },
      { path: 'template', select: 'name category html css config' }
    ])

    res.json({
      success: true,
      data: updatedCoverLetter
    })
  } catch (error) {
    console.error('Error updating cover letter:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   DELETE /api/cover-letters/:id
// @desc    Delete cover letter
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findById(req.params.id)

    if (!coverLetter) {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }

    // Check if user owns the cover letter
    if (coverLetter.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    await coverLetter.deleteOne()

    res.json({ 
      success: true,
      message: 'Cover letter removed' 
    })
  } catch (error) {
    console.error('Error deleting cover letter:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   POST /api/cover-letters/:id/duplicate
// @desc    Duplicate cover letter
// @access  Private
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalCoverLetter = await CoverLetter.findById(req.params.id)

    if (!originalCoverLetter) {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }

    // Check if user owns the cover letter or if it's public
    if (originalCoverLetter.user.toString() !== req.user.id && !originalCoverLetter.isPublic) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    // Create duplicate
    const duplicateCoverLetter = new CoverLetter({
      user: req.user.id,
      resume: originalCoverLetter.resume,
      template: originalCoverLetter.template,
      jobApplication: {
        ...originalCoverLetter.jobApplication,
        applicationStatus: 'draft'
      },
      content: originalCoverLetter.content,
      customization: originalCoverLetter.customization,
      isPublic: false // Duplicates are private by default
    })

    await duplicateCoverLetter.save()

    // Populate related data
    await duplicateCoverLetter.populate([
      { path: 'resume', select: 'personalInfo.firstName personalInfo.lastName' },
      { path: 'template', select: 'name category thumbnail' }
    ])

    res.status(201).json({
      success: true,
      data: duplicateCoverLetter
    })
  } catch (error) {
    console.error('Error duplicating cover letter:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   POST /api/cover-letters/:id/export
// @desc    Export cover letter as PDF/PNG/Word
// @access  Private
router.post('/:id/export', auth, async (req, res) => {
  try {
    const { format = 'pdf' } = req.body

    const coverLetter = await CoverLetter.findById(req.params.id)
      .populate('resume', 'personalInfo')
      .populate('template', 'name category')

    if (!coverLetter) {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }

    // Check if user owns the cover letter or if it's public
    if (coverLetter.user.toString() !== req.user.id && !coverLetter.isPublic) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    // TODO: Implement cover letter PDF generation service
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Cover letter export functionality will be implemented',
      data: {
        format,
        coverLetterId: coverLetter._id,
        fileName: `${coverLetter.jobApplication.company}_Cover_Letter`
      }
    })

  } catch (error) {
    console.error('Error exporting cover letter:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   GET /api/cover-letters/public/:token
// @desc    Get public cover letter by share token
// @access  Public
router.get('/public/:token', async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOne({ shareToken: req.params.token })
      .populate('resume', 'personalInfo education experience skills')
      .populate('template', 'name category html css config')

    if (!coverLetter) {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }

    if (!coverLetter.isPublic) {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }

    res.json({
      success: true,
      data: coverLetter
    })
  } catch (error) {
    console.error('Error fetching public cover letter:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   POST /api/cover-letters/:id/toggle-visibility
// @desc    Toggle cover letter public visibility
// @access  Private
router.post('/:id/toggle-visibility', auth, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findById(req.params.id)

    if (!coverLetter) {
      return res.status(404).json({ 
        success: false,
        message: 'Cover letter not found' 
      })
    }

    // Check if user owns the cover letter
    if (coverLetter.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    // Toggle visibility
    coverLetter.isPublic = !coverLetter.isPublic
    if (coverLetter.isPublic && !coverLetter.shareToken) {
      coverLetter.shareToken = require('crypto').randomBytes(16).toString('hex')
    } else if (!coverLetter.isPublic) {
      coverLetter.shareToken = undefined
    }

    await coverLetter.save()

    res.json({
      success: true,
      data: {
        isPublic: coverLetter.isPublic,
        shareToken: coverLetter.shareToken,
        shareUrl: coverLetter.isPublic ? 
          `${process.env.FRONTEND_URL}/cover-letter/shared/${coverLetter.shareToken}` : null
      }
    })
  } catch (error) {
    console.error('Error toggling cover letter visibility:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

module.exports = router
