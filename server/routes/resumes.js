const express = require('express')
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const Resume = require('../models/Resume')
const Template = require('../models/Template')
const resumePdfService = require('../services/resumePdfService')
const fs = require('fs')
const path = require('path')

const router = express.Router()

// Helper function to populate template info (handles both ObjectId and String)
async function populateTemplateInfo(resume) {
  const resumeObj = resume.toObject ? resume.toObject() : resume
  
  if (!resume.template) {
    return resumeObj
  }
  
  // Convert template to string to check if it's an ObjectId
  const templateStr = resume.template.toString()
  
  // If template is an ObjectId (24 hex characters), try to populate from database
  if (templateStr.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const template = await Template.findById(templateStr)
      if (template) {
        resumeObj.template = {
          _id: template._id,
          name: template.name,
          category: template.category,
          thumbnail: template.thumbnail
        }
        return resumeObj
      }
    } catch (err) {
      // Template not found, continue to string handling
      console.warn('Template not found for ObjectId:', templateStr)
    }
  }
  
  // If template is a string (like "professional-classic")
  resumeObj.template = {
    _id: templateStr,
    name: templateStr.charAt(0).toUpperCase() + templateStr.slice(1).replace(/-/g, ' '),
    category: 'Professional',
    thumbnail: `/templates/${templateStr}-preview.png`
  }
  
  return resumeObj
}

// @route   GET /api/resumes
// @desc    Get all resumes for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .sort({ updatedAt: -1 })

    // Manually populate template info
    const populatedResumes = await Promise.all(resumes.map(resume => populateTemplateInfo(resume)))

    res.json(populatedResumes)
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
      .sort({ updatedAt: -1 })

    if (!resume) {
      return res.status(404).json({ message: 'No resume found' })
    }

    const populatedResume = await populateTemplateInfo(resume)
    res.json(populatedResume)
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

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    // Check if user owns the resume or if it's public
    if (resume.user.toString() !== req.user.id && !resume.isPublic) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const populatedResume = await populateTemplateInfo(resume)
    res.json(populatedResume)
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
router.post('/', auth, async (req, res) => {
  try {
    const { templateId, ...resumeData } = req.body

    // Validate templateId is provided
    if (!templateId) {
      return res.status(400).json({ message: 'Template ID is required' })
    }

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
      // It's a file-based template name, validate it exists (or allow any string for canvas-based templates)
      const availableTemplates = resumePdfService.getAvailableTemplates()
      const fileTemplate = availableTemplates.find(t => t.id === templateId)
      
      // For canvas-based resumes, we allow any templateId string
      // The template might not exist as a file, but that's okay for canvas-based resumes
      templateReference = templateId
    }

    // Create new resume
    const resume = new Resume({
      user: req.user.id,
      template: templateReference,
      ...resumeData
    })

    await resume.save()

    // Populate template info manually
    const populatedResume = await populateTemplateInfo(resume)

    res.status(201).json(populatedResume)
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
    )

    const populatedResume = await populateTemplateInfo(updatedResume)
    res.json(populatedResume)
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
    const populatedResume = await populateTemplateInfo(duplicateResume)

    res.status(201).json(populatedResume)
  } catch (error) {
    console.error('Error duplicating resume:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resume not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/resumes/:id/export
// @desc    Export resume as PDF/PNG/Word - Generates and saves file (deducts credit)
// @access  Private
router.post('/:id/export', auth, async (req, res) => {
  try {
    const { format = 'pdf', templateId = 'professional-classic' } = req.body

    const resume = await Resume.findById(req.params.id)

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

    // Check and deduct credits for all export formats (1 credit per export - PDF/PNG/JPG)
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // All export formats cost 1 credit (PDF/PNG/JPG)
    if (user.credits < 1) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient credits',
        message: `You need at least 1 credit to export your resume as ${format.toUpperCase()}. Please purchase a credit pack.`,
        credits: user.credits
      });
    }

    // Deduct credit before processing
    user.credits -= 1;
    await user.save();
    console.log(`💰 Deducted 1 credit from user ${user.email} for ${format.toUpperCase()} export. Remaining credits: ${user.credits}`);

    console.log(`📄 Exporting resume as ${format.toUpperCase()}`)
    console.log(`👤 User: ${req.user.id}`)
    console.log(`📋 Resume: ${resume.personalInfo?.firstName || ''} ${resume.personalInfo?.lastName || ''}`)

    const uploadsDir = path.join(__dirname, '../uploads/resumes')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Always generate and save the file (this is the export endpoint)
    const isCanvasResume = resume.canvasData && typeof resume.canvasData === 'object'
    let result;
    
    if (isCanvasResume) {
      const canvasExportService = require('../services/canvasExportService')
      switch (format.toLowerCase()) {
        case 'pdf':
          result = await canvasExportService.generatePdfFromCanvas(resume.canvasData)
          break
        case 'png':
          result = await canvasExportService.generatePngFromCanvas(resume.canvasData)
          break
        case 'jpg':
        case 'jpeg':
          // Generate PNG first, then we can convert if needed
          result = await canvasExportService.generatePngFromCanvas(resume.canvasData)
          if (result.success) {
            result.jpgBuffer = result.pngBuffer // For now, use PNG as JPG
          }
          break
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid format. Supported formats: pdf, png, jpg'
          })
      }
    } else {
      switch (format.toLowerCase()) {
        case 'pdf':
          result = await resumePdfService.generatePdf(resume.toObject(), templateId)
          break
        case 'png':
          result = await resumePdfService.generatePng(resume.toObject(), templateId)
          break
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid format. Supported formats: pdf, png'
          })
      }
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Export failed',
        error: result.error
      })
    }

    // Save file to disk
    const fileExtension = format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg' ? 'jpg' : format.toLowerCase()
    const savedFilename = `resume-${resume._id}-${Date.now()}.${fileExtension}`
    const savedPath = path.join(uploadsDir, savedFilename)
    
    let fileBuffer
    if (format.toLowerCase() === 'pdf') {
      fileBuffer = result.pdfBuffer
    } else if (format.toLowerCase() === 'png') {
      fileBuffer = result.pngBuffer
    } else if (format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg') {
      fileBuffer = result.jpgBuffer || result.pngBuffer
    }
    
    if (!fileBuffer) {
      console.error(`❌ No file buffer generated for format: ${format}`)
      return res.status(500).json({
        success: false,
        message: 'Export failed: No file buffer generated',
        error: `Failed to generate ${format.toUpperCase()} buffer`
      })
    }
    
    try {
      fs.writeFileSync(savedPath, fileBuffer)
      console.log(`💾 File saved to: ${savedPath} (${fileBuffer.length} bytes)`)
    } catch (writeError) {
      console.error(`❌ Error writing file to ${savedPath}:`, writeError)
      return res.status(500).json({
        success: false,
        message: 'Export failed: Could not save file',
        error: writeError.message
      })
    }

    // Delete old file if it exists
    let oldFilePath = null
    if (format.toLowerCase() === 'pdf' && resume.exportedPdfPath) {
      oldFilePath = resume.exportedPdfPath
    } else if (format.toLowerCase() === 'png' && resume.exportedPngPath) {
      oldFilePath = resume.exportedPngPath
    } else if ((format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg') && resume.exportedJpgPath) {
      oldFilePath = resume.exportedJpgPath
    }
    
    if (oldFilePath && fs.existsSync(oldFilePath)) {
      try {
        fs.unlinkSync(oldFilePath)
      } catch (err) {
        console.warn('Error deleting old file:', err)
      }
    }

    // Update resume with new file path
    if (format.toLowerCase() === 'pdf') {
      resume.exportedPdfPath = savedPath
      resume.exportedPdfGeneratedAt = new Date()
    } else if (format.toLowerCase() === 'png') {
      resume.exportedPngPath = savedPath
      resume.exportedPngGeneratedAt = new Date()
    } else if (format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg') {
      resume.exportedJpgPath = savedPath
      resume.exportedJpgGeneratedAt = new Date()
    }
    await resume.save()

    // Send the file
    const filename = `${resume.personalInfo?.firstName || 'Resume'}_${resume.personalInfo?.lastName || ''}_Resume.${fileExtension}`.trim() || `Resume.${fileExtension}`
    let contentType = 'application/pdf'
    if (format.toLowerCase() === 'png') contentType = 'image/png'
    else if (format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg') contentType = 'image/jpeg'
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', fileBuffer.length)
    res.send(fileBuffer)

    console.log(`✅ ${format.toUpperCase()} generated and saved: ${savedPath}`)

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

// @route   GET /api/resumes/:id/download
// @desc    Download saved resume file (PDF/PNG/JPG) - No credit deduction, just serves saved file
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const { format = 'pdf' } = req.query

    const resume = await Resume.findById(req.params.id)

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

    // Get saved file path based on format
    let savedFilePath = null
    if (format.toLowerCase() === 'pdf') {
      savedFilePath = resume.exportedPdfPath
    } else if (format.toLowerCase() === 'png') {
      savedFilePath = resume.exportedPngPath
    } else if (format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg') {
      savedFilePath = resume.exportedJpgPath
    }

    // Check if file exists
    if (!savedFilePath || !fs.existsSync(savedFilePath)) {
      return res.status(404).json({
        success: false,
        message: `No ${format.toUpperCase()} file found. Please export the resume first.`
      })
    }

    // Read and serve the saved file
    const fileBuffer = fs.readFileSync(savedFilePath)
    const fileExtension = format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg' ? 'jpg' : format.toLowerCase()
    const filename = `${resume.personalInfo?.firstName || 'Resume'}_${resume.personalInfo?.lastName || ''}_Resume.${fileExtension}`.trim() || `Resume.${fileExtension}`
    
    let contentType = 'application/pdf'
    if (format.toLowerCase() === 'png') contentType = 'image/png'
    else if (format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg') contentType = 'image/jpeg'
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', fileBuffer.length)
    res.send(fileBuffer)

    console.log(`✅ Served saved ${format.toUpperCase()} file: ${savedFilePath}`)

  } catch (error) {
    console.error('Error downloading resume:', error)
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

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    if (!resume.isPublic) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    const populatedResume = await populateTemplateInfo(resume)
    res.json(populatedResume)
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
