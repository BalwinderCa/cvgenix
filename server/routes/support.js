const express = require('express');
const { body, validationResult } = require('express-validator');
const Support = require('../models/Support');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/support
// @desc    Submit a support/contact form message
// @access  Public
router.post('/', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Create support ticket
    const support = new Support({
      name,
      email,
      subject,
      message,
      status: 'new'
    });

    await support.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you soon!',
      data: {
        id: support._id,
        status: support.status
      }
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit your message. Please try again later.'
    });
  }
});

// @route   GET /api/support
// @desc    Get all support tickets (admin only)
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { status, email, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (email) {
      query.email = email.toLowerCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const supports = await Support.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Support.countDocuments(query);

    res.json({
      success: true,
      data: supports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets'
    });
  }
});

// @route   GET /api/support/:id
// @desc    Get a single support ticket (admin only)
// @access  Private (Admin)
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const support = await Support.findById(req.params.id);
    
    if (!support) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    res.json({
      success: true,
      data: support
    });
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support ticket'
    });
  }
});

// @route   PUT /api/support/:id
// @desc    Update support ticket status or admin notes (admin only)
// @access  Private (Admin)
router.put('/:id', auth, [
  body('status')
    .optional()
    .isIn(['new', 'read', 'replied', 'resolved'])
    .withMessage('Invalid status value'),
  body('adminNotes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Admin notes must be less than 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { status, adminNotes } = req.body;
    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const support = await Support.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!support) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      data: support
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update support ticket'
    });
  }
});

// @route   DELETE /api/support/:id
// @desc    Delete a support ticket (admin only)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const support = await Support.findByIdAndDelete(req.params.id);

    if (!support) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete support ticket'
    });
  }
});

module.exports = router;

