const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { errorService, ValidationError, ForbiddenError } = require('../services/errorService');
const loggerService = require('../services/loggerService');
const enhancedEmailService = require('../services/enhancedEmailService');
const User = require('../models/User');
const securityMiddleware = require('../middleware/security');

/**
 * @swagger
 * /api/emails/send-welcome:
 *   post:
 *     summary: Send welcome email to user
 *     tags: [Email Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               customMessage:
 *                 type: string
 *                 example: "Welcome to our platform!"
 *     responses:
 *       200:
 *         description: Welcome email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Welcome email sent successfully"
 *                 messageId:
 *                   type: string
 *                   example: "message-id-123"
 *                 previewUrl:
 *                   type: string
 *                   example: "https://ethereal.email/message/123"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Email service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/send-welcome',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { userId, customMessage } = req.body;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
      throw new ForbiddenError('Admin access required');
    }

    // Get target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new ValidationError('User not found');
    }

    loggerService.userAction('Welcome email requested', {
      adminUserId: req.user.id,
      targetUserId: userId,
      targetEmail: targetUser.email
    });

    const result = await enhancedEmailService.sendWelcomeEmail(targetUser, {
      customMessage
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully',
        messageId: result.messageId,
        previewUrl: result.previewUrl
      });
    } else {
      throw new Error(result.error || 'Failed to send welcome email');
    }
  })
);

/**
 * @swagger
 * /api/emails/send-password-reset:
 *   post:
 *     summary: Send password reset email
 *     tags: [Email Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               expiryHours:
 *                 type: integer
 *                 example: 24
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset email sent successfully"
 *                 messageId:
 *                   type: string
 *                   example: "message-id-123"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Email service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/send-password-reset',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { email, expiryHours = 24 } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Generate reset token (you might want to use a proper token generation service)
    const resetToken = require('crypto').randomBytes(32).toString('hex');

    loggerService.userAction('Password reset email requested', {
      userId: user._id,
      email: user.email,
      requestedBy: req.user.id
    });

    const result = await enhancedEmailService.sendPasswordResetEmail(user, resetToken, {
      expiryHours
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Password reset email sent successfully',
        messageId: result.messageId,
        previewUrl: result.previewUrl
      });
    } else {
      throw new Error(result.error || 'Failed to send password reset email');
    }
  })
);

/**
 * @swagger
 * /api/emails/send-payment-confirmation:
 *   post:
 *     summary: Send payment confirmation email
 *     tags: [Email Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, paymentData]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               paymentData:
 *                 type: object
 *                 required: [amount, plan, transactionId]
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 29.99
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *                   plan:
 *                     type: string
 *                     example: "Premium"
 *                   transactionId:
 *                     type: string
 *                     example: "txn_123456789"
 *     responses:
 *       200:
 *         description: Payment confirmation email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment confirmation email sent successfully"
 *                 messageId:
 *                   type: string
 *                   example: "message-id-123"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Email service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/send-payment-confirmation',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { userId, paymentData } = req.body;

    if (!userId || !paymentData) {
      throw new ValidationError('User ID and payment data are required');
    }

    if (!paymentData.amount || !paymentData.plan || !paymentData.transactionId) {
      throw new ValidationError('Payment data must include amount, plan, and transaction ID');
    }

    // Get target user
    const user = await User.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    loggerService.userAction('Payment confirmation email requested', {
      userId: user._id,
      email: user.email,
      amount: paymentData.amount,
      plan: paymentData.plan
    });

    const result = await enhancedEmailService.sendPaymentConfirmationEmail(user, paymentData);

    if (result.success) {
      res.json({
        success: true,
        message: 'Payment confirmation email sent successfully',
        messageId: result.messageId,
        previewUrl: result.previewUrl
      });
    } else {
      throw new Error(result.error || 'Failed to send payment confirmation email');
    }
  })
);

/**
 * @swagger
 * /api/emails/send-ai-content:
 *   post:
 *     summary: Send AI-generated content via email
 *     tags: [Email Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, contentData]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               contentData:
 *                 type: object
 *                 required: [type, content, provider]
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [summary, experience, skills]
 *                     example: "summary"
 *                   content:
 *                     type: string
 *                     example: "Professional summary content..."
 *                   provider:
 *                     type: string
 *                     enum: [openai, anthropic]
 *                     example: "openai"
 *     responses:
 *       200:
 *         description: AI content email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "AI content email sent successfully"
 *                 messageId:
 *                   type: string
 *                   example: "message-id-123"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Email service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/send-ai-content',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { userId, contentData } = req.body;

    if (!userId || !contentData) {
      throw new ValidationError('User ID and content data are required');
    }

    if (!contentData.type || !contentData.content || !contentData.provider) {
      throw new ValidationError('Content data must include type, content, and provider');
    }

    // Get target user
    const user = await User.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    loggerService.userAction('AI content email requested', {
      userId: user._id,
      email: user.email,
      contentType: contentData.type,
      provider: contentData.provider
    });

    const result = await enhancedEmailService.sendAIContentEmail(user, contentData);

    if (result.success) {
      res.json({
        success: true,
        message: 'AI content email sent successfully',
        messageId: result.messageId,
        previewUrl: result.previewUrl
      });
    } else {
      throw new Error(result.error || 'Failed to send AI content email');
    }
  })
);

/**
 * @swagger
 * /api/emails/send-notification:
 *   post:
 *     summary: Send notification email to user
 *     tags: [Email Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, subject, message]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               subject:
 *                 type: string
 *                 example: "Important Update"
 *               message:
 *                 type: string
 *                 example: "Your account has been updated successfully."
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *                 example: "info"
 *     responses:
 *       200:
 *         description: Notification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification email sent successfully"
 *                 messageId:
 *                   type: string
 *                   example: "message-id-123"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Email service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/send-notification',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const { userId, subject, message, type = 'info' } = req.body;

    if (!userId || !subject || !message) {
      throw new ValidationError('User ID, subject, and message are required');
    }

    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
      throw new ForbiddenError('Admin access required');
    }

    // Get target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new ValidationError('User not found');
    }

    loggerService.userAction('Notification email requested', {
      adminUserId: req.user.id,
      targetUserId: userId,
      targetEmail: targetUser.email,
      type
    });

    const result = await enhancedEmailService.sendNotificationEmail(targetUser, subject, message, type);

    if (result.success) {
      res.json({
        success: true,
        message: 'Notification email sent successfully',
        messageId: result.messageId,
        previewUrl: result.previewUrl
      });
    } else {
      throw new Error(result.error || 'Failed to send notification email');
    }
  })
);

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
router.get('/status',
  auth,
  errorService.asyncHandler(async (req, res) => {
    const status = enhancedEmailService.getStatus();
    
    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/emails/test:
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
router.post('/test',
  auth,
  errorService.asyncHandler(async (req, res) => {
    loggerService.userAction('Email service test requested', {
      userId: req.user.id
    });

    const result = await enhancedEmailService.testService();
    
    res.json({
      success: true,
      result,
      testedAt: new Date().toISOString()
    });
  })
);

module.exports = router;
