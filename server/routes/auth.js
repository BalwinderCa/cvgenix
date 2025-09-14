const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const auth = require('../middleware/auth')
const emailService = require('../services/emailService')
const { errorService, ValidationError, AuthenticationError, ConflictError } = require('../services/errorService')
const loggerService = require('../services/loggerService')
const validationService = require('../services/validationService')
const { authSchemas } = require('../validation/schemas')
const securityMiddleware = require('../middleware/security')

const router = express.Router()

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             email: "john.doe@example.com"
 *             password: "Password123"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "507f1f77bcf86cd799439011"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 role: "user"
 *                 credits: 3
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - field: "email"
 *                   message: "Please include a valid email"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/signup', 
  securityMiddleware.validateRequest(authSchemas.signup),
  errorService.asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body

    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
    throw new ConflictError('User already exists')
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

  // Log user registration
  loggerService.userAction(user.id, 'user_registered', {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  })

    // Send welcome email (async, don't wait for it)
    emailService.sendWelcomeEmail(user).catch(err => {
    loggerService.error('Welcome email failed', { userId: user.id, error: err.message })
    })

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
      
      loggerService.info('User registered successfully', {
        userId: user.id,
        email: user.email
      })
      
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
}))

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "507f1f77bcf86cd799439011"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 role: "user"
 *                 credits: 3
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid credentials"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', 
  securityMiddleware.validateRequest(authSchemas.login),
  errorService.asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
    loggerService.security('Failed login attempt - user not found', { email })
    throw new AuthenticationError('Invalid credentials')
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
    loggerService.security('Failed login attempt - invalid password', { 
      email, 
      userId: user.id 
    })
    throw new AuthenticationError('Invalid credentials')
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save()

  // Log successful login
  loggerService.userAction(user.id, 'user_login', {
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

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
      
      loggerService.info('User logged in successfully', {
        userId: user.id,
        email: user.email
      })
      
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
}))

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               user:
 *                 id: "507f1f77bcf86cd799439011"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 role: "user"
 *                 credits: 3
 *                 isActive: true
 *                 preferences:
 *                   emailNotifications: true
 *                   marketingEmails: false
 *                   theme: "light"
 *                   language: "en"
 *                   timezone: "UTC"
 *                 lastLogin: "2025-09-13T09:00:00.000Z"
 *                 createdAt: "2025-09-13T09:00:00.000Z"
 *                 updatedAt: "2025-09-13T09:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No token, authorization denied"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(user, resetToken)
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      })
    } else {
      console.error('Password reset email failed:', emailResult.error)
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      })
    }
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
    const user = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true })

    // Send password reset confirmation email
    if (user) {
      emailService.sendPasswordResetConfirmationEmail(user).catch(err => {
        console.error('Password reset confirmation email failed:', err)
      })
    }

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
