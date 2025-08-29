const express = require('express')
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const User = require('../models/User')
const Resume = require('../models/Resume')

const router = express.Router()

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  [
    body('firstName').optional().isLength({ min: 1 }).withMessage('First name cannot be empty'),
    body('lastName').optional().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
  ]
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { firstName, lastName, email, phone, avatar, preferences } = req.body

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } })
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' })
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        email,
        phone,
        avatar,
        preferences
      },
      { new: true, runValidators: true }
    ).select('-password')

    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/users/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', auth, async (req, res) => {
  try {
    // Delete all user's resumes
    await Resume.deleteMany({ user: req.user.id })

    // Delete user account
    await User.findByIdAndDelete(req.user.id)

    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting user account:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get user's resumes
    const resumes = await Resume.find({ user: req.user.id })
      .populate('template', 'name category thumbnail')
      .sort({ updatedAt: -1 })
      .limit(5)

    // Get resume statistics
    const totalResumes = await Resume.countDocuments({ user: req.user.id })
    const publicResumes = await Resume.countDocuments({ user: req.user.id, isPublic: true })
    const recentResumes = await Resume.countDocuments({ 
      user: req.user.id, 
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })

    // Get user's subscription info
    const user = await User.findById(req.user.id).select('subscription')

    res.json({
      recentResumes: resumes,
      stats: {
        totalResumes,
        publicResumes,
        recentResumes
      },
      subscription: user.subscription
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/users/resumes
// @desc    Get all user resumes with pagination
// @access  Private
router.get('/resumes', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query

    // Build filter
    const filter = { user: req.user.id }
    if (search) {
      filter.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query
    const resumes = await Resume.find(filter)
      .populate('template', 'name category thumbnail')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    // Get total count
    const total = await Resume.countDocuments(filter)

    res.json({
      resumes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + resumes.length < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching user resumes:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', auth, async (req, res) => {
  try {
    // TODO: Implement file upload logic with Multer and Cloudinary
    // For now, return a placeholder response
    
    res.json({
      message: 'Avatar upload functionality will be implemented',
      avatarUrl: 'https://via.placeholder.com/150'
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/users/subscription
// @desc    Update user subscription
// @access  Private
router.post('/subscription', [
  auth,
  [
    body('plan').isIn(['free', 'standard', 'pro']).withMessage('Invalid plan'),
    body('status').isIn(['active', 'canceled', 'expired']).withMessage('Invalid status')
  ]
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { plan, status, stripeCustomerId, stripeSubscriptionId } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        subscription: {
          plan,
          status,
          stripeCustomerId,
          stripeSubscriptionId,
          updatedAt: Date.now()
        }
      },
      { new: true }
    ).select('-password')

    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating subscription:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/users/export-data
// @desc    Export user data (GDPR compliance)
// @access  Private
router.get('/export-data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    const resumes = await Resume.find({ user: req.user.id })

    const userData = {
      user: user,
      resumes: resumes,
      exportedAt: new Date().toISOString()
    }

    res.json(userData)
  } catch (error) {
    console.error('Error exporting user data:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
