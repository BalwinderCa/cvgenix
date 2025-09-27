const express = require('express')
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const Resume = require('../models/Resume')
const Template = require('../models/Template')
const resumePdfService = require('../services/resumePdfService')

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

// @route   GET /api/resumes/current
// @desc    Get user's current/most recent resume
// @access  Private
router.get('/current', auth, async (req, res) => {
  try {
    // Get the user's most recent resume
    const resume = await Resume.findOne({ user: req.user.id })
      .populate('template', 'name category html css config')
      .sort({ updatedAt: -1 })

    if (!resume) {
      return res.status(404).json({ message: 'No resume found' })
    }

    res.json(resume)
  } catch (error) {
    console.error('Error fetching current resume:', error)
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
    body('templateId').notEmpty().withMessage('Template ID is required'),
    // Make personal info validation optional for initial resume creation
    body('personalInfo.firstName').optional(),
    body('personalInfo.lastName').optional(),
    body('personalInfo.email').optional().isEmail().withMessage('Valid email is required if provided')
  ]
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { templateId, ...resumeData } = req.body

    // Handle both MongoDB ObjectId and file-based template names
    let template = null
    let templateReference = null

    // Check if templateId is a MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(templateId)) {
      // It's a MongoDB ObjectId, find the template in database
      template = await Template.findById(templateId)
      if (!template) {
        return res.status(404).json({ message: 'Template not found' })
      }
      templateReference = templateId
    } else {
      // It's a file-based template name, validate it exists
      const availableTemplates = resumePdfService.getAvailableTemplates()
      const fileTemplate = availableTemplates.find(t => t.id === templateId)
      
      if (!fileTemplate) {
        return res.status(404).json({ message: 'Template not found' })
      }
      
      // For file-based templates, we'll store the template name
      // and handle it in the PDF generation service
      templateReference = templateId
    }

    // Create new resume
    const resume = new Resume({
      user: req.user.id,
      template: templateReference,
      ...resumeData
    })

    await resume.save()

    // If we have a database template, populate it
    if (template) {
      await resume.populate('template', 'name category thumbnail')
    } else {
      // For file-based templates, add template info manually
      resume.template = {
        _id: templateId,
        name: templateId.charAt(0).toUpperCase() + templateId.slice(1),
        category: 'Professional',
        thumbnail: `/templates/${templateId}-preview.png`
      }
    }

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
// @desc    Export resume as PDF/PNG/Word
// @access  Private
router.post('/:id/export', auth, async (req, res) => {
  try {
    const { format = 'pdf', templateId = 'professional-classic' } = req.body

    const resume = await Resume.findById(req.params.id)
      .populate('template', 'name category')

    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      })
    }

    // Check if user owns the resume or if it's public
    if (resume.user.toString() !== req.user.id && !resume.isPublic) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    console.log(`📄 Exporting resume as ${format.toUpperCase()}`)
    console.log(`👤 User: ${req.user.id}`)
    console.log(`📋 Resume: ${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`)

    let result;
    let filename = `${resume.personalInfo.firstName}_${resume.personalInfo.lastName}_Resume`;
    let contentType;

    switch (format.toLowerCase()) {
      case 'pdf':
        result = await resumePdfService.generatePdf(resume.toObject(), templateId)
        filename += '.pdf'
        contentType = 'application/pdf'
        break
        
      case 'png':
        result = await resumePdfService.generatePng(resume.toObject(), templateId)
        filename += '.png'
        contentType = 'image/png'
        break
        
      case 'word':
      case 'docx':
        result = await resumePdfService.generateWord(resume.toObject(), templateId)
        filename += '.html' // Word-compatible HTML
        contentType = 'application/msword'
        break
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Supported formats: pdf, png, word'
        })
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Export failed',
        error: result.error
      })
    }

    // Set response headers
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', result.size || result.pdfBuffer?.length || result.pngBuffer?.length || result.html?.length)

    // Send the file
    if (format.toLowerCase() === 'word') {
      res.send(result.html)
    } else {
      res.send(result.pdfBuffer || result.pngBuffer)
    }

    console.log(`✅ Resume exported successfully as ${format.toUpperCase()}`)

  } catch (error) {
    console.error('Error exporting resume:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      })
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    })
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

// @route   GET /api/resumes/templates
// @desc    Get available resume templates
// @access  Public
router.get('/templates', async (req, res) => {
  try {
    const templates = resumePdfService.getAvailableTemplates()
    
    res.json({
      success: true,
      templates
    })
  } catch (error) {
    console.error('Error getting templates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get templates',
      error: error.message
    })
  }
})

// @route   GET /api/resumes/templates/:id/preview
// @desc    Get template preview
// @access  Public
router.get('/templates/:id/preview', async (req, res) => {
  try {
    const { id } = req.params
    const { sampleData } = req.query
    
    let data = null
    if (sampleData === 'true') {
      data = resumePdfService.getSampleResumeData()
    }
    
    const result = await resumePdfService.getTemplatePreview(id, data)
    
    if (result.success) {
      res.setHeader('Content-Type', 'text/html')
      res.send(result.html)
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate preview',
        error: result.error
      })
    }
  } catch (error) {
    console.error('Error generating template preview:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview',
      error: error.message
    })
  }
})

module.exports = router
