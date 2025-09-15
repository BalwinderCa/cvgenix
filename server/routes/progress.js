const express = require('express');
const progressTracker = require('../utils/progressTracker');

const router = express.Router();

// Get progress for a session
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  const progress = progressTracker.getProgress(sessionId);
  
  if (!progress) {
    return res.status(404).json({
      success: false,
      error: 'Progress not found'
    });
  }

  res.json({
    success: true,
    data: progress
  });
});

module.exports = router;
