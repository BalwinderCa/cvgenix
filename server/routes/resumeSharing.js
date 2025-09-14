const express = require('express')
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const Resume = require('../models/Resume')
const ResumeComment = require('../models/ResumeComment')
const { v4: uuidv4 } = require('uuid')

const router = express.Router()

// @route   POST /api/resume-sharing/:id/toggle-visibility
// @desc    Toggle resume public visibility
// @access  Private
router.post('/:id/toggle-visibility', auth, async (req, res) => {
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

    // Toggle visibility
    resume.isPublic = !resume.isPublic
    if (resume.isPublic && !resume.shareToken) {
      resume.shareToken = require('crypto').randomBytes(16).toString('hex')
    } else if (!resume.isPublic) {
      resume.shareToken = undefined
    }

    await resume.save()

    res.json({
      success: true,
      data: {
        isPublic: resume.isPublic,
        shareToken: resume.shareToken,
        shareUrl: resume.isPublic ? 
          `${process.env.FRONTEND_URL}/resume/shared/${resume.shareToken}` : null
      }
    })
  } catch (error) {
    console.error('Error toggling resume visibility:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   GET /api/resume-sharing/public/:token
// @desc    Get public resume by share token
// @access  Public
router.get('/public/:token', async (req, res) => {
  try {
    const resume = await Resume.findOne({ shareToken: req.params.token })
      .populate('user', 'firstName lastName email')
      .populate('template', 'name category html css config')

    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      })
    }

    if (!resume.isPublic) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      })
    }

    res.json({
      success: true,
      data: resume
    })
  } catch (error) {
    console.error('Error fetching public resume:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   POST /api/resume-sharing/:id/comments
// @desc    Add comment to resume
// @access  Public (for public resumes) or Private (for owned resumes)
router.post('/:id/comments', [
  body('content').notEmpty().withMessage('Comment content is required'),
  body('type').isIn(['comment', 'suggestion', 'question', 'praise']).withMessage('Invalid comment type'),
  body('position.section').notEmpty().withMessage('Section is required'),
  body('position.element').notEmpty().withMessage('Element is required')
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
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      })
    }

    // Check if resume is public or user owns it
    const isOwner = req.user && resume.user.toString() === req.user.id
    if (!resume.isPublic && !isOwner) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    // For public resumes, require user authentication for comments
    if (resume.isPublic && !req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required to comment on public resumes' 
      })
    }

    const comment = new ResumeComment({
      resume: resume._id,
      user: req.user.id,
      content: req.body.content,
      type: req.body.type || 'comment',
      position: req.body.position
    })

    await comment.save()
    await comment.populate('user', 'firstName lastName email')

    res.status(201).json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   GET /api/resume-sharing/:id/comments
// @desc    Get comments for resume
// @access  Public (for public resumes) or Private (for owned resumes)
router.get('/:id/comments', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      })
    }

    // Check if resume is public or user owns it
    const isOwner = req.user && resume.user.toString() === req.user.id
    if (!resume.isPublic && !isOwner) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    const comments = await ResumeComment.find({ resume: resume._id })
      .populate('user', 'firstName lastName email')
      .populate('replies.user', 'firstName lastName email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   POST /api/resume-sharing/comments/:commentId/reply
// @desc    Reply to a comment
// @access  Private
router.post('/comments/:commentId/reply', [
  auth,
  body('content').notEmpty().withMessage('Reply content is required')
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
    const comment = await ResumeComment.findById(req.params.commentId)
      .populate('resume')

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      })
    }

    // Check if user can reply (owner of resume or original commenter)
    const resume = comment.resume
    const isResumeOwner = resume.user.toString() === req.user.id
    const isOriginalCommenter = comment.user.toString() === req.user.id

    if (!isResumeOwner && !isOriginalCommenter) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to reply to this comment' 
      })
    }

    const reply = {
      user: req.user.id,
      content: req.body.content
    }

    comment.replies.push(reply)
    await comment.save()

    // Populate the new reply
    await comment.populate('replies.user', 'firstName lastName email')

    res.json({
      success: true,
      data: comment.replies[comment.replies.length - 1]
    })
  } catch (error) {
    console.error('Error replying to comment:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   PUT /api/resume-sharing/comments/:commentId/status
// @desc    Update comment status (resolve/dismiss)
// @access  Private (resume owner only)
router.put('/comments/:commentId/status', [
  auth,
  body('status').isIn(['pending', 'resolved', 'dismissed']).withMessage('Invalid status')
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
    const comment = await ResumeComment.findById(req.params.commentId)
      .populate('resume')

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      })
    }

    // Check if user owns the resume
    const resume = comment.resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      })
    }

    comment.status = req.body.status
    comment.isResolved = req.body.status === 'resolved'
    
    if (req.body.status === 'resolved') {
      comment.resolvedBy = req.user.id
      comment.resolvedAt = new Date()
    }

    await comment.save()

    res.json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error updating comment status:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   DELETE /api/resume-sharing/comments/:commentId
// @desc    Delete a comment
// @access  Private (comment owner or resume owner)
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await ResumeComment.findById(req.params.commentId)
      .populate('resume')

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      })
    }

    // Check if user can delete (owner of resume or original commenter)
    const resume = comment.resume
    const isResumeOwner = resume.user.toString() === req.user.id
    const isOriginalCommenter = comment.user.toString() === req.user.id

    if (!isResumeOwner && !isOriginalCommenter) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to delete this comment' 
      })
    }

    await comment.deleteOne()

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

// @route   GET /api/resume-sharing/:id/analytics
// @desc    Get sharing analytics for resume
// @access  Private (resume owner only)
router.get('/:id/analytics', auth, async (req, res) => {
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

    // Get comment statistics
    const commentStats = await ResumeComment.aggregate([
      { $match: { resume: resume._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ])

    // Get recent comments
    const recentComments = await ResumeComment.find({ resume: resume._id })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10)

    // Get comment activity over time
    const commentActivity = await ResumeComment.aggregate([
      { $match: { resume: resume._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ])

    res.json({
      success: true,
      data: {
        isPublic: resume.isPublic,
        shareToken: resume.shareToken,
        shareUrl: resume.isPublic ? 
          `${process.env.FRONTEND_URL}/resume/shared/${resume.shareToken}` : null,
        commentStats,
        recentComments,
        commentActivity,
        totalComments: await ResumeComment.countDocuments({ resume: resume._id })
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    })
  }
})

module.exports = router
