const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const emailService = require('../services/emailService');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/emails/send-notification
// @desc    Send notification email to user
// @access  Private (Admin)
router.post('/send-notification', [
  auth,
  body('userId', 'User ID is required').isMongoId(),
  body('subject', 'Subject is required').notEmpty(),
  body('message', 'Message is required').notEmpty(),
  body('type', 'Type must be one of: info, warning, success, error').optional().isIn(['info', 'warning', 'success', 'error'])
], async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { userId, subject, message, type = 'info' } = req.body;

    // Get target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send notification email
    const result = await emailService.sendNotificationEmail(targetUser, subject, message, type);

    if (result.success) {
      res.json({
        success: true,
        message: 'Notification email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send notification email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// @route   POST /api/emails/send-bulk-notification
// @desc    Send notification email to multiple users
// @access  Private (Admin)
router.post('/send-bulk-notification', [
  auth,
  body('userIds', 'User IDs array is required').isArray({ min: 1 }),
  body('subject', 'Subject is required').notEmpty(),
  body('message', 'Message is required').notEmpty(),
  body('type', 'Type must be one of: info, warning, success, error').optional().isIn(['info', 'warning', 'success', 'error'])
], async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { userIds, subject, message, type = 'info' } = req.body;

    // Get target users
    const targetUsers = await User.find({ _id: { $in: userIds } });
    
    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found'
      });
    }

    // Send emails to all users
    const results = await Promise.allSettled(
      targetUsers.map(user => emailService.sendNotificationEmail(user, subject, message, type))
    );

    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
    const failed = results.length - successful;

    res.json({
      success: true,
      message: `Bulk notification sent: ${successful} successful, ${failed} failed`,
      stats: {
        total: results.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notification',
      error: error.message
    });
  }
});

// @route   POST /api/emails/send-resume-analysis
// @desc    Send resume analysis results email
// @access  Private
router.post('/send-resume-analysis', [
  auth,
  body('analysisData', 'Analysis data is required').isObject(),
  body('analysisData.score', 'Score is required').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { analysisData } = req.body;

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send resume analysis email
    const result = await emailService.sendResumeAnalysisEmail(user, analysisData);

    if (result.success) {
      res.json({
        success: true,
        message: 'Resume analysis email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send resume analysis email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Send resume analysis email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send resume analysis email',
      error: error.message
    });
  }
});

// @route   GET /api/emails/test
// @desc    Test email service (admin only)
// @access  Private (Admin)
router.get('/test', auth, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Send test email to admin
    const result = await emailService.sendNotificationEmail(
      adminUser,
      'Email Service Test',
      'This is a test email to verify the email service is working correctly.',
      'info'
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        previewUrl: result.previewUrl
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/emails/status:
 *   get:
 *     summary: Get email service status
 *     tags: [Email Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email service status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: object
 *                   properties:
 *                     initialized:
 *                       type: boolean
 *                       example: true
 *                     provider:
 *                       type: string
 *                       example: "ethereal"
 *                     templatesLoaded:
 *                       type: integer
 *                       example: 4
 *                     templates:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["welcome", "password-reset", "payment-confirmation", "subscription-welcome"]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/status', auth, async (req, res) => {
  try {
    const status = emailService.getStatus();
    
    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email service status',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/emails/test-service:
 *   post:
 *     summary: Test email service connectivity
 *     tags: [Email Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email service test completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Email service is working"
 *                 testedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-09-13T10:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Test failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/test-service', auth, async (req, res) => {
  try {
    const result = await emailService.testService();
    
    res.json({
      success: true,
      result,
      testedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test email service',
      error: error.message
    });
  }
});

module.exports = router;
