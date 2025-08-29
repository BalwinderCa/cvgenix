const express = require('express')
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const Resume = require('../models/Resume')
const Template = require('../models/Template')

const router = express.Router()

// @route   GET /api/resumes
// @desc    Get all resumes for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .populate('template', 'name category thumbnail')
      .sort({ updatedAt: -1 })

    res.json(resumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/resumes/:id
// @desc    Get resume by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('template', 'name category html css config')

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    // Check if user owns the resume or if it's public
    if (resume.user.toString() !== req.user.id && !resume.isPublic) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    res.json(resume)
  } catch (error) {
    console.error('Error fetching resume:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resume not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/resumes
// @desc    Create a new resume
// @access  Private
router.post('/', [
  auth,
  [
    body('templateId').isMongoId().withMessage('Valid template ID is required'),
    body('personalInfo.firstName').notEmpty().withMessage('First name is required'),
    body('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
    body('personalInfo.email').isEmail().withMessage('Valid email is required')
  ]
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { templateId, ...resumeData } = req.body

    // Verify template exists
    const template = await Template.findById(templateId)
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Create new resume
    const resume = new Resume({
      user: req.user.id,
      template: templateId,
      ...resumeData
    })

    await resume.save()

    // Populate template info
    await resume.populate('template', 'name category thumbnail')

    res.status(201).json(resume)
  } catch (error) {
    console.error('Error creating resume:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/resumes/:id
// @desc    Update resume
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    // Check if user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // Update resume
    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        lastModified: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('template', 'name category html css config')

    res.json(updatedResume)
  } catch (error) {
    console.error('Error updating resume:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resume not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    // Check if user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await resume.deleteOne()

    res.json({ message: 'Resume removed' })
  } catch (error) {
    console.error('Error deleting resume:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resume not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/resumes/:id/duplicate
// @desc    Duplicate resume
// @access  Private
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalResume = await Resume.findById(req.params.id)

    if (!originalResume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    // Check if user owns the resume or if it's public
    if (originalResume.user.toString() !== req.user.id && !originalResume.isPublic) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // Create duplicate
    const duplicateResume = new Resume({
      user: req.user.id,
      template: originalResume.template,
      personalInfo: originalResume.personalInfo,
      education: originalResume.education,
      experience: originalResume.experience,
      skills: originalResume.skills,
      projects: originalResume.projects,
      certifications: originalResume.certifications,
      languages: originalResume.languages,
      socials: originalResume.socials,
      hobbies: originalResume.hobbies,
      customSections: originalResume.customSections,
      settings: originalResume.settings,
      isPublic: false // Duplicates are private by default
    })

    await duplicateResume.save()

    // Populate template info
    await duplicateResume.populate('template', 'name category thumbnail')

    res.status(201).json(duplicateResume)
  } catch (error) {
    console.error('Error duplicating resume:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resume not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/resumes/:id/export
// @desc    Export resume as PDF/PNG
// @access  Private
router.post('/:id/export', auth, async (req, res) => {
  try {
    const { format = 'pdf' } = req.body

    const resume = await Resume.findById(req.params.id)
      .populate('template', 'html css config')

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    // Check if user owns the resume or if it's public
    if (resume.user.toString() !== req.user.id && !resume.isPublic) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // TODO: Implement PDF/PNG generation logic
    // This would use Puppeteer or similar to generate the file
    // For now, return a placeholder response

    res.json({
      message: 'Export functionality will be implemented',
      format,
      resumeId: resume._id
    })
  } catch (error) {
    console.error('Error exporting resume:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resume not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/resumes/public/:id
// @desc    Get public resume by ID
// @access  Public
router.get('/public/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('template', 'name category html css config')

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    if (!resume.isPublic) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    res.json(resume)
  } catch (error) {
    console.error('Error fetching public resume:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resume not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
