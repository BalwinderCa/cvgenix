const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const Resume = require('../models/Resume')
const Template = require('../models/Template')
const ResumeVersion = require('../models/ResumeVersion')

// @route   POST /api/template-editor/switch-template
// @desc    Switch resume template while preserving all data
// @access  Private
router.post('/switch-template', [
  auth,
  body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
  body('templateId').isMongoId().withMessage('Valid template ID is required')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { resumeId, templateId } = req.body
    const userId = req.user.id

    // Get the current resume
    const resume = await Resume.findOne({ _id: resumeId, user: userId })
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    // Get the new template
    const template = await Template.findById(templateId)
    if (!template || !template.isActive) {
      return res.status(404).json({ message: 'Template not found or inactive' })
    }

    // Create a version backup before switching
    const versionData = {
      resume: resumeId,
      user: userId,
      version: await ResumeVersion.countDocuments({ resume: resumeId }) + 1,
      name: `Template Switch to ${template.name}`,
      description: `Switched from previous template to ${template.name}`,
      data: {
        personalInfo: resume.personalInfo,
        education: resume.education,
        experience: resume.experience,
        skills: resume.skills,
        languages: resume.languages,
        certifications: resume.certifications,
        socialLinks: resume.socialLinks,
        customSections: resume.customSections,
        projects: resume.projects,
        awards: resume.awards,
        volunteer: resume.volunteer,
        references: resume.references
      },
      changes: [{
        field: 'template',
        oldValue: resume.template,
        newValue: templateId,
        changeType: 'modified'
      }],
      tags: ['template-switch'],
      isActive: false,
      createdBy: userId
    }

    await ResumeVersion.create(versionData)

    // Update the resume with new template
    resume.template = templateId
    resume.lastModified = new Date()
    await resume.save()

    // Get the updated resume with template details
    const updatedResume = await Resume.findById(resumeId)
      .populate('template', 'name description category html css config')
      .populate('user', 'name email')

    res.json({
      message: 'Template switched successfully',
      resume: updatedResume,
      version: versionData
    })

  } catch (error) {
    console.error('Error switching template:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/template-editor/preview/:templateId
// @desc    Preview template with current resume data
// @access  Private
router.get('/preview/:templateId', auth, async (req, res) => {
  try {
    const { templateId } = req.params
    const userId = req.user.id

    // Get current resume data
    const resume = await Resume.findOne({ user: userId }).sort({ lastModified: -1 })
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' })
    }

    // Get the template
    const template = await Template.findById(templateId)
    if (!template || !template.isActive) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Prepare resume data for template rendering
    const resumeData = {
      personalInfo: resume.personalInfo,
      education: resume.education,
      experience: resume.experience,
      skills: resume.skills,
      languages: resume.languages,
      certifications: resume.certifications,
      socialLinks: resume.socialLinks,
      customSections: resume.customSections,
      projects: resume.projects,
      awards: resume.awards,
      volunteer: resume.volunteer,
      references: resume.references
    }

    // Generate HTML with current resume data
    const handlebars = require('handlebars')
    const compiledTemplate = handlebars.compile(template.html)
    const htmlContent = compiledTemplate(resumeData)

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
    console.error('Error generating preview:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/template-editor/compare
// @desc    Compare multiple templates with current resume data
// @access  Private
router.post('/compare', [
  auth,
  body('templateIds').isArray({ min: 2, max: 4 }).withMessage('2-4 template IDs required')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { templateIds } = req.body
    const userId = req.user.id

    // Get current resume data
    const resume = await Resume.findOne({ user: userId }).sort({ lastModified: -1 })
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' })
    }

    // Get templates
    const templates = await Template.find({ 
      _id: { $in: templateIds }, 
      isActive: true 
    }).select('name description category thumbnail html css config')

    if (templates.length !== templateIds.length) {
      return res.status(404).json({ message: 'Some templates not found' })
    }

    // Prepare resume data
    const resumeData = {
      personalInfo: resume.personalInfo,
      education: resume.education,
      experience: resume.experience,
      skills: resume.skills,
      languages: resume.languages,
      certifications: resume.certifications,
      socialLinks: resume.socialLinks,
      customSections: resume.customSections,
      projects: resume.projects,
      awards: resume.awards,
      volunteer: resume.volunteer,
      references: resume.references
    }

    // Generate previews for each template
    const handlebars = require('handlebars')
    const comparisons = templates.map(template => {
      const compiledTemplate = handlebars.compile(template.html)
      const htmlContent = compiledTemplate(resumeData)
      
      return {
        templateId: template._id,
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnail: template.thumbnail,
        preview: htmlContent,
        config: template.config
      }
    })

    res.json({
      comparisons,
      resumeData: {
        personalInfo: resumeData.personalInfo,
        sections: {
          education: resumeData.education.length,
          experience: resumeData.experience.length,
          skills: resumeData.skills.length,
          projects: resumeData.projects.length
        }
      }
    })

  } catch (error) {
    console.error('Error comparing templates:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/template-editor/versions/:resumeId
// @desc    Get template switch history for a resume
// @access  Private
router.get('/versions/:resumeId', auth, async (req, res) => {
  try {
    const { resumeId } = req.params
    const userId = req.user.id

    // Verify resume ownership
    const resume = await Resume.findOne({ _id: resumeId, user: userId })
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    // Get template switch versions
    const versions = await ResumeVersion.find({ 
      resume: resumeId, 
      'tags': 'template-switch' 
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .select('version name description createdAt createdBy changes')

    res.json({ versions })

  } catch (error) {
    console.error('Error fetching versions:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/template-editor/restore-version
// @desc    Restore resume to a previous template version
// @access  Private
router.post('/restore-version', [
  auth,
  body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
  body('versionId').isMongoId().withMessage('Valid version ID is required')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { resumeId, versionId } = req.body
    const userId = req.user.id

    // Verify resume ownership
    const resume = await Resume.findOne({ _id: resumeId, user: userId })
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    // Get the version to restore
    const version = await ResumeVersion.findOne({ 
      _id: versionId, 
      resume: resumeId,
      'tags': 'template-switch'
    })

    if (!version) {
      return res.status(404).json({ message: 'Version not found' })
    }

    // Create backup of current state
    const currentVersion = {
      resume: resumeId,
      user: userId,
      version: await ResumeVersion.countDocuments({ resume: resumeId }) + 1,
      name: `Backup before restoring to ${version.name}`,
      description: `Backup created before restoring to version ${version.version}`,
      data: {
        personalInfo: resume.personalInfo,
        education: resume.education,
        experience: resume.experience,
        skills: resume.skills,
        languages: resume.languages,
        certifications: resume.certifications,
        socialLinks: resume.socialLinks,
        customSections: resume.customSections,
        projects: resume.projects,
        awards: resume.awards,
        volunteer: resume.volunteer,
        references: resume.references
      },
      changes: [{
        field: 'restore',
        oldValue: 'current',
        newValue: `version-${version.version}`,
        changeType: 'modified'
      }],
      tags: ['restore-backup'],
      isActive: false,
      createdBy: userId
    }

    await ResumeVersion.create(currentVersion)

    // Restore the data from the version
    const versionData = version.data
    resume.personalInfo = versionData.personalInfo
    resume.education = versionData.education
    resume.experience = versionData.experience
    resume.skills = versionData.skills
    resume.languages = versionData.languages
    resume.certifications = versionData.certifications
    resume.socialLinks = versionData.socialLinks
    resume.customSections = versionData.customSections
    resume.projects = versionData.projects
    resume.awards = versionData.awards
    resume.volunteer = versionData.volunteer
    resume.references = versionData.references
    resume.lastModified = new Date()

    await resume.save()

    res.json({
      message: 'Version restored successfully',
      restoredVersion: version.version,
      backupCreated: currentVersion.version
    })

  } catch (error) {
    console.error('Error restoring version:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
