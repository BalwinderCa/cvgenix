const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const loggerService = require('../services/loggerService');

// Create a shareable link for a resume
router.post('/', auth, async (req, res) => {
  try {
    const { resumeId, isPublic, password, expiresIn, allowDownload, allowComments } = req.body;
    const userId = req.user.id;

    // Find the resume
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Generate unique share ID
    const shareId = require('crypto').randomBytes(16).toString('hex');
    
    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn !== 'never') {
      const now = new Date();
      switch (expiresIn) {
        case '1day':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '7days':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Create share data
    const shareData = {
      shareId,
      resumeId,
      userId,
      isPublic,
      password: password || null,
      expiresAt,
      allowDownload,
      allowComments,
      viewCount: 0,
      createdAt: new Date(),
      lastViewedAt: null
    };

    // Store share data in resume document
    resume.sharing = shareData;
    await resume.save();

    // Generate share URL
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared-resume/${shareId}`;

    loggerService.info('Resume share link created', { 
      userId, 
      resumeId, 
      shareId,
      isPublic,
      hasPassword: !!password
    });

    res.json({
      success: true,
      data: {
        id: shareId,
        url: shareUrl,
        password: password || null,
        isPublic,
        viewCount: 0,
        createdAt: shareData.createdAt,
        expiresAt: shareData.expiresAt
      }
    });

  } catch (error) {
    loggerService.error('Error creating resume share link:', error);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

// Get shared resume by share ID
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const { password } = req.query;

    // Find resume with sharing data
    const resume = await Resume.findOne({ 'sharing.shareId': shareId });
    if (!resume) {
      return res.status(404).json({ error: 'Shared resume not found' });
    }

    const sharing = resume.sharing;
    
    // Check if link has expired
    if (sharing.expiresAt && new Date() > sharing.expiresAt) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    // Check password if required
    if (!sharing.isPublic && sharing.password) {
      if (!password || password !== sharing.password) {
        return res.status(401).json({ error: 'Password required' });
      }
    }

    // Update view count and last viewed
    resume.sharing.viewCount += 1;
    resume.sharing.lastViewedAt = new Date();
    await resume.save();

    // Return resume data (without sensitive information)
    const publicResumeData = {
      id: resume._id,
      title: resume.title || 'Resume',
      personalInfo: resume.personalInfo,
      experience: resume.experience,
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects,
      certifications: resume.certifications,
      languages: resume.languages,
      achievements: resume.achievements,
      template: resume.template || 'modern',
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      sharing: {
        allowDownload: sharing.allowDownload,
        allowComments: sharing.allowComments,
        viewCount: sharing.viewCount
      }
    };

    loggerService.info('Shared resume accessed', { 
      shareId, 
      viewCount: sharing.viewCount,
      hasPassword: !!sharing.password
    });

    res.json({
      success: true,
      data: publicResumeData
    });

  } catch (error) {
    loggerService.error('Error accessing shared resume:', error);
    res.status(500).json({ error: 'Failed to access shared resume' });
  }
});

// Get sharing statistics for a resume
router.get('/stats/:resumeId', auth, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (!resume.sharing) {
      return res.json({
        success: true,
        data: {
          isShared: false,
          stats: null
        }
      });
    }

    const stats = {
      isShared: true,
      shareId: resume.sharing.shareId,
      viewCount: resume.sharing.viewCount,
      createdAt: resume.sharing.createdAt,
      lastViewedAt: resume.sharing.lastViewedAt,
      expiresAt: resume.sharing.expiresAt,
      isExpired: resume.sharing.expiresAt ? new Date() > resume.sharing.expiresAt : false
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    loggerService.error('Error getting sharing stats:', error);
    res.status(500).json({ error: 'Failed to get sharing statistics' });
  }
});

// Delete share link
router.delete('/:resumeId', auth, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (resume.sharing) {
      resume.sharing = undefined;
      await resume.save();
      
      loggerService.info('Resume share link deleted', { userId, resumeId });
    }

    res.json({
      success: true,
      message: 'Share link deleted successfully'
    });

  } catch (error) {
    loggerService.error('Error deleting share link:', error);
    res.status(500).json({ error: 'Failed to delete share link' });
  }
});

module.exports = router;