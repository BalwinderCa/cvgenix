const express = require('express');
const router = express.Router();

// Store progress for each analysis session
const progressStore = new Map();

// Progress steps that match your backend processing
const PROGRESS_STEPS = {
  UPLOAD: { id: 'upload', name: 'Uploading Resume', progress: 5 },
  PARSING_AND_REORGANIZE: { id: 'parsing_reorganize', name: 'Extracting & Reorganizing', progress: 40 },
  DUAL_ANALYSIS: { id: 'dual_analysis', name: 'Dual AI Analysis', progress: 80 },
  RESULT_ANALYSIS: { id: 'result_analysis', name: 'Analyzing Results', progress: 95 },
  COMPLETE: { id: 'complete', name: 'Complete', progress: 100 }
};

// SSE endpoint for progress updates
router.get('/stream/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection
  res.write(`data: ${JSON.stringify({ 
    type: 'connected', 
    message: 'Connected to progress stream' 
  })}\n\n`);

  // Store the response object for this session
  progressStore.set(sessionId, res);

  // Handle client disconnect
  req.on('close', () => {
    progressStore.delete(sessionId);
  });

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    if (progressStore.has(sessionId)) {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);
});

// Function to update progress (called from ATS analysis)
function updateProgress(sessionId, step, message = '', data = {}) {
  const res = progressStore.get(sessionId);
  if (res) {
    const progressData = {
      type: 'progress',
      step: step,
      message: message,
      progress: PROGRESS_STEPS[step].progress,
      stepName: PROGRESS_STEPS[step].name,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    res.write(`data: ${JSON.stringify(progressData)}\n\n`);
    console.log(`📊 Progress Update [${sessionId}]: ${step} - ${message}`);
  }
}

// Function to complete progress
function completeProgress(sessionId, result = {}) {
  const res = progressStore.get(sessionId);
  if (res) {
    const completeData = {
      type: 'complete',
      step: 'COMPLETE',
      message: 'Analysis completed successfully',
      progress: 100,
      stepName: 'Complete',
      timestamp: new Date().toISOString(),
      result: result
    };
    
    res.write(`data: ${JSON.stringify(completeData)}\n\n`);
    res.end();
    progressStore.delete(sessionId);
    console.log(`✅ Progress Complete [${sessionId}]: Analysis finished`);
  }
}

// Function to error progress
function errorProgress(sessionId, error) {
  const res = progressStore.get(sessionId);
  if (res) {
    const errorData = {
      type: 'error',
      step: 'ERROR',
      message: error.message || 'Analysis failed',
      progress: 0,
      stepName: 'Error',
      timestamp: new Date().toISOString(),
      error: error
    };
    
    res.write(`data: ${JSON.stringify(errorData)}\n\n`);
    res.end();
    progressStore.delete(sessionId);
    console.log(`❌ Progress Error [${sessionId}]: ${error.message}`);
  }
}

// Export the progress functions for use in other routes
module.exports = {
  router,
  updateProgress,
  completeProgress,
  errorProgress,
  PROGRESS_STEPS
};
