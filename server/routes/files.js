const express = require('express');
const path = require('path');
const fs = require('fs');
const { avatarUpload, resumeUpload } = require('../middleware/fileUpload');
const fileService = require('../services/fileService');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Resume = require('../models/Resume');

const router = express.Router();

// @route   POST /api/files/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file uploaded'
      });
    }

    // Validate file
    const validation = await fileService.validateFile(
      req.file,
      ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      2 * 1024 * 1024 // 2MB
    );

    if (!validation.isValid) {
      // Clean up uploaded file
      fileService.cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'File validation failed',
        errors: validation.errors
      });
    }

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldFilename = user.avatar.split('/').pop();
      await fileService.deleteAvatar(oldFilename);
    }

    // Save new avatar
    const result = await fileService.saveAvatar(req.file, req.user.id);
    
    if (result.success) {
      // Update user record
      user.avatar = result.url;
      await user.save();

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        avatar: {
          url: result.url,
          filename: result.filename
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save avatar',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Avatar upload failed',
      error: error.message
    });
  }
});

// @route   DELETE /api/files/avatar
// @desc    Delete user avatar
// @access  Private
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.avatar) {
      return res.status(404).json({
        success: false,
        message: 'No avatar found'
      });
    }

    const filename = user.avatar.split('/').pop();
    const result = await fileService.deleteAvatar(filename);
    
    if (result.success) {
      user.avatar = null;
      await user.save();

      res.json({
        success: true,
        message: 'Avatar deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete avatar',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Avatar delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Avatar deletion failed',
      error: error.message
    });
  }
});

// @route   POST /api/files/resume
// @desc    Upload resume file
// @access  Private
router.post('/resume', auth, resumeUpload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
    }

    // Validate file
    const validation = await fileService.validateFile(
      req.file,
      ['.pdf', '.docx', '.doc', '.txt', '.html'],
      10 * 1024 * 1024 // 10MB
    );

    if (!validation.isValid) {
      // Clean up uploaded file
      fileService.cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'File validation failed',
        errors: validation.errors
      });
    }

    // Save resume file
    const result = await fileService.saveResume(req.file, req.user.id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Resume uploaded successfully',
        file: {
          filename: result.filename,
          url: result.url,
          size: result.size,
          originalName: result.originalName
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save resume',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Resume upload failed',
      error: error.message
    });
  }
});

// @route   GET /api/files/storage-stats
// @desc    Get storage statistics (admin only)
// @access  Private (Admin)
router.get('/storage-stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = await fileService.getStorageStats();
    res.json(stats);
  } catch (error) {
    console.error('Storage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get storage statistics',
      error: error.message
    });
  }
});

// @route   POST /api/files/cleanup
// @desc    Clean up old files (admin only)
// @access  Private (Admin)
router.post('/cleanup', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { daysOld = 7 } = req.body;
    const result = await fileService.cleanupOldFiles(daysOld);
    
    res.json({
      success: true,
      message: 'Cleanup completed',
      result
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
});

// @route   GET /api/files/:type/:filename
// @desc    Serve uploaded files
// @access  Public
router.get('/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const allowedTypes = ['avatars', 'resumes', 'temp', 'ats'];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    const filePath = path.join(__dirname, '../uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.txt': 'text/plain',
      '.html': 'text/html'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    
    // For images, set cache headers
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve file',
      error: error.message
    });
  }
});

module.exports = router;
