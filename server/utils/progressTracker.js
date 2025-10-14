// Simple progress tracking system
const AnalysisLogger = require('./analysisLogger');

class ProgressTracker {
  constructor() {
    this.progressStore = new Map();
    this.logger = new AnalysisLogger();
  }

  // Initialize progress for a session
  initializeProgress(sessionId) {
    this.progressStore.set(sessionId, {
      status: 'started',
      currentStep: 0,
      totalSteps: 4,
      message: 'Starting analysis...',
      progress: 0,
      result: null,
      error: null,
      startTime: Date.now()
    });
    console.log(`📊 Progress initialized for session: ${sessionId}`);
  }

  // Update progress
  updateProgress(sessionId, step, message, progress = null) {
    const current = this.progressStore.get(sessionId);
    if (!current) {
      console.warn(`⚠️ No progress found for session: ${sessionId}`);
      return;
    }

    const stepProgress = {
      0: 10,   // Upload
      1: 50,   // LlamaParse parsing (takes longer)
      2: 80,   // Analysis
      3: 100   // Complete
    };

    current.status = 'processing';
    current.currentStep = step;
    current.message = message;
    current.progress = progress !== null ? progress : stepProgress[step] || 0;
    current.lastUpdate = Date.now();

    this.progressStore.set(sessionId, current);
    console.log(`📈 Progress updated [${sessionId}]: Step ${step} - ${message} (${current.progress}%)`);
  }

  // Complete progress with result
  completeProgress(sessionId, result) {
    const current = this.progressStore.get(sessionId);
    if (!current) {
      console.warn(`⚠️ No progress found for session: ${sessionId}`);
      return;
    }

    current.status = 'completed';
    current.currentStep = 3;
    current.message = 'Analysis completed successfully!';
    current.progress = 100;
    current.result = result;
    current.completedAt = Date.now();

    this.progressStore.set(sessionId, current);
    console.log(`✅ Progress completed [${sessionId}]: Analysis finished`);
  }

  // Error progress
  errorProgress(sessionId, error) {
    const current = this.progressStore.get(sessionId);
    if (!current) {
      console.warn(`⚠️ No progress found for session: ${sessionId}`);
      return;
    }

    current.status = 'error';
    current.message = error.message || 'Analysis failed';
    current.error = error;
    current.errorAt = Date.now();

    this.progressStore.set(sessionId, current);
    console.log(`❌ Progress error [${sessionId}]: ${current.message}`);
  }

  // Get progress
  getProgress(sessionId) {
    return this.progressStore.get(sessionId) || null;
  }

  // Clean up old progress (older than 1 hour)
  cleanup() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    let cleaned = 0;

    for (const [sessionId, progress] of this.progressStore.entries()) {
      if (progress.startTime < oneHourAgo) {
        this.progressStore.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old progress entries`);
    }
    
    // Also clean up old log files
    this.logger.cleanupOldLogs();
  }
}

// Create singleton instance
const progressTracker = new ProgressTracker();

// Clean up every 30 minutes
setInterval(() => {
  progressTracker.cleanup();
}, 30 * 60 * 1000);

module.exports = progressTracker;
