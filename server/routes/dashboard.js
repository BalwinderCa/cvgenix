const express = require('express');
const { query, body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const dashboardService = require('../services/dashboardService');

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get user dashboard overview
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    const result = await dashboardService.getUserDashboard(req.user.id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard overview'
    });
  }
});

// @route   GET /api/dashboard/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await dashboardService.getUserStats(req.user.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    });
  }
});

// @route   GET /api/dashboard/analytics
// @desc    Get user resume analytics
// @access  Private
router.get('/analytics', [
  auth,
  query('resumeId').optional().isMongoId()
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

    const { resumeId } = req.query;
    const result = await dashboardService.getResumeAnalytics(req.user.id, resumeId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

// @route   GET /api/dashboard/activity
// @desc    Get recent activity
// @access  Private
router.get('/activity', [
  auth,
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const limit = parseInt(req.query.limit) || 10;
    const activity = await dashboardService.getRecentActivity(req.user.id, limit);
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent activity'
    });
  }
});

// @route   GET /api/dashboard/recommendations
// @desc    Get template recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const recommendations = await dashboardService.getTemplateRecommendations(req.user.id);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Dashboard recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    });
  }
});

// @route   GET /api/dashboard/resumes
// @desc    Get user's resume management data
// @access  Private
router.get('/resumes', [
  auth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'lastModified']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
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

    const {
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const result = await dashboardService.getResumeManagement(
      req.user.id,
      parseInt(page),
      parseInt(limit),
      sortBy,
      sortOrder
    );
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Dashboard resumes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get resume management data'
    });
  }
});

// @route   GET /api/dashboard/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', auth, async (req, res) => {
  try {
    const result = await dashboardService.getUserPreferences(req.user.id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Dashboard preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user preferences'
    });
  }
});

// @route   PUT /api/dashboard/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('emailNotifications').optional().isBoolean(),
  body('marketingEmails').optional().isBoolean(),
  body('theme').optional().isIn(['light', 'dark', 'auto']),
  body('language').optional().isIn(['en', 'es', 'fr', 'de']),
  body('timezone').optional().isString()
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

    const preferences = req.body;
    const result = await dashboardService.updateUserPreferences(req.user.id, preferences);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// @route   POST /api/dashboard/clear-cache
// @desc    Clear dashboard cache
// @access  Private
router.post('/clear-cache', auth, async (req, res) => {
  try {
    dashboardService.clearCache(req.user.id);
    
    res.json({
      success: true,
      message: 'Dashboard cache cleared successfully'
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

module.exports = router;
