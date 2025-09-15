const Resume = require('../models/Resume');
const CoverLetter = require('../models/CoverLetter');
const User = require('../models/User');
const loggerService = require('../services/loggerService');

/**
 * Authorization middleware to prevent Insecure Direct Object References (IDOR)
 */

// Check if user owns the resume
const checkResumeOwnership = async (req, res, next) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user.id;

    const resume = await Resume.findById(resumeId);
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check if user owns the resume or is admin
    if (resume.user.toString() !== userId && !['admin', 'super_admin'].includes(req.user.role)) {
      loggerService.security('IDOR attempt blocked - Resume access', {
        userId,
        targetResumeId: resumeId,
        targetUserId: resume.user.toString(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    req.resource = resume;
    next();
  } catch (error) {
    loggerService.error('Error in checkResumeOwnership middleware', { 
      error: error.message,
      userId: req.user?.id 
    });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check if user owns the cover letter
const checkCoverLetterOwnership = async (req, res, next) => {
  try {
    const coverLetterId = req.params.id;
    const userId = req.user.id;

    const coverLetter = await CoverLetter.findById(coverLetterId);
    
    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    // Check if user owns the cover letter or is admin
    if (coverLetter.user.toString() !== userId && !['admin', 'super_admin'].includes(req.user.role)) {
      loggerService.security('IDOR attempt blocked - Cover letter access', {
        userId,
        targetCoverLetterId: coverLetterId,
        targetUserId: coverLetter.user.toString(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    req.resource = coverLetter;
    next();
  } catch (error) {
    loggerService.error('Error in checkCoverLetterOwnership middleware', { 
      error: error.message,
      userId: req.user?.id 
    });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check if admin can access user data
const checkUserAccess = async (req, res, next) => {
  try {
    const targetUserId = req.params.id || req.params.userId;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Users can access their own data
    if (targetUserId === currentUserId) {
      return next();
    }

    // Only admins can access other users' data
    if (!['admin', 'super_admin'].includes(currentUserRole)) {
      loggerService.security('IDOR attempt blocked - User data access', {
        userId: currentUserId,
        targetUserId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.targetUser = targetUser;
    next();
  } catch (error) {
    loggerService.error('Error in checkUserAccess middleware', { 
      error: error.message,
      userId: req.user?.id 
    });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check if user can access shared resource via share token
const checkShareTokenAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { shareToken } = req.params;
      const { password } = req.body;

      let resource;
      if (resourceType === 'resume') {
        resource = await Resume.findOne({ shareToken });
      } else if (resourceType === 'coverLetter') {
        resource = await CoverLetter.findOne({ shareToken });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Shared resource not found'
        });
      }

      // Check if resource is publicly shared
      if (!resource.isPublic) {
        return res.status(403).json({
          success: false,
          message: 'Resource is not publicly shared'
        });
      }

      // Check password if required
      if (resource.sharePassword && resource.sharePassword !== password) {
        loggerService.security('Invalid share password attempt', {
          resourceId: resource._id,
          shareToken,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      loggerService.error('Error in checkShareTokenAccess middleware', { 
        error: error.message,
        shareToken: req.params.shareToken 
      });
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

module.exports = {
  checkResumeOwnership,
  checkCoverLetterOwnership,
  checkUserAccess,
  checkShareTokenAccess
};