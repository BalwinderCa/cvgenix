const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', [
  body('firstName', 'First name is required').not().isEmpty(),
  body('lastName', 'Last name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      })
    }

    const { firstName, lastName, email, password } = req.body

    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password
    })

    // Hash password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err
        res.json({
          success: true,
          message: 'User registered successfully',
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        })
      }
    )
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err
        res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        })
      }
    )
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json({
      success: true,
      user
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName', 'First name is required').not().isEmpty(),
  body('lastName', 'Last name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      })
    }

    const { firstName, lastName, email } = req.body

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      })
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, email },
      { new: true }
    ).select('-password')

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email', 'Please include a valid email').isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      })
    }

    const { email } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No user found with this email'
      })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    // TODO: Send email with reset link
    // For now, just return success
    res.json({
      success: true,
      message: 'Password reset email sent'
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if user is admin
    if (!['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      })
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err
        res.json({
          success: true,
          message: 'Admin login successful',
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        })
      }
    )
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token', 'Token is required').not().isEmpty(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      })
    }

    const { token, password } = req.body

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.user.id

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update user password
    await User.findByIdAndUpdate(userId, { password: hashedPassword })

    res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      })
    }
    console.error(err.message)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/auth/credits
// @desc    Update user credits
// @access  Private
router.put('/credits', auth, [
  body('credits', 'Credits must be a number').isNumeric()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      })
    }

    const { credits } = req.body

    // Update user credits
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { credits: Math.max(0, credits) }, // Ensure credits don't go below 0
      { new: true }
    ).select('-password')

    res.json({
      success: true,
      message: 'Credits updated successfully',
      user
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/auth/deduct-credit
// @desc    Deduct one credit from user
// @access  Private
router.post('/deduct-credit', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.credits <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No credits available'
      })
    }

    // Deduct one credit
    user.credits = Math.max(0, user.credits - 1)
    await user.save()

    const updatedUser = await User.findById(req.user.id).select('-password')

    res.json({
      success: true,
      message: 'Credit deducted successfully',
      user: updatedUser
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router
