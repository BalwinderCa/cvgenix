const express = require('express');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all resumes for a user
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.userId })
      .sort({ lastModified: -1 });
    
    res.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Error fetching resumes' });
  }
});

// Get a specific resume
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Error fetching resume' });
  }
});

// Create a new resume
router.post('/', auth, async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      user: req.user.userId
    };

    const resume = new Resume(resumeData);
    await resume.save();

    res.status(201).json({ resume });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ error: 'Error creating resume' });
  }
});

// Update a resume
router.put('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId
      },
      {
        ...req.body,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ error: 'Error updating resume' });
  }
});

// Delete a resume
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Error deleting resume' });
  }
});

// Duplicate a resume
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalResume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!originalResume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const duplicatedResume = new Resume({
      ...originalResume.toObject(),
      _id: undefined,
      title: `${originalResume.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await duplicatedResume.save();

    res.status(201).json({ resume: duplicatedResume });
  } catch (error) {
    console.error('Duplicate resume error:', error);
    res.status(500).json({ error: 'Error duplicating resume' });
  }
});

// Get public resumes (for templates/gallery)
router.get('/public/gallery', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const resumes = await Resume.find({ isPublic: true })
      .populate('user', 'firstName lastName')
      .sort({ lastModified: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Resume.countDocuments({ isPublic: true });

    res.json({
      resumes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + resumes.length < total
      }
    });
  } catch (error) {
    console.error('Get public resumes error:', error);
    res.status(500).json({ error: 'Error fetching public resumes' });
  }
});

module.exports = router;
