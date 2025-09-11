const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

/**
 * Real-time Service for Live Progress Tracking
 * Provides WebSocket connections for real-time updates
 */
class RealtimeService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });
    
    this.activeAnalyses = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      
      socket.on('join_analysis', (analysisId) => {
        socket.join(`analysis_${analysisId}`);
        console.log(`📊 Client ${socket.id} joined analysis ${analysisId}`);
      });
      
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Start a new analysis session
   */
  startAnalysis(analysisId, userId = null) {
    this.activeAnalyses.set(analysisId, {
      id: analysisId,
      userId,
      startTime: Date.now(),
      status: 'started',
      progress: 0,
      stage: 'Initializing...'
    });
    
    this.emitProgress(analysisId, 0, 'Initializing analysis...');
  }

  /**
   * Update analysis progress
   */
  updateProgress(analysisId, progress, stage, data = null) {
    const analysis = this.activeAnalyses.get(analysisId);
    if (!analysis) return;

    analysis.progress = progress;
    analysis.stage = stage;
    analysis.lastUpdate = Date.now();

    if (data) {
      analysis.data = data;
    }

    this.emitProgress(analysisId, progress, stage, data);
  }

  /**
   * Complete analysis
   */
  completeAnalysis(analysisId, result) {
    const analysis = this.activeAnalyses.get(analysisId);
    if (!analysis) return;

    analysis.status = 'completed';
    analysis.progress = 100;
    analysis.result = result;
    analysis.completedAt = Date.now();

    this.emitProgress(analysisId, 100, 'Analysis completed successfully', result);
    
    // Clean up after 5 minutes
    setTimeout(() => {
      this.activeAnalyses.delete(analysisId);
    }, 5 * 60 * 1000);
  }

  /**
   * Handle analysis error
   */
  handleError(analysisId, error) {
    const analysis = this.activeAnalyses.get(analysisId);
    if (!analysis) return;

    analysis.status = 'error';
    analysis.error = error.message;
    analysis.completedAt = Date.now();

    this.emitError(analysisId, error);
    
    // Clean up after 5 minutes
    setTimeout(() => {
      this.activeAnalyses.delete(analysisId);
    }, 5 * 60 * 1000);
  }

  /**
   * Emit progress update to specific analysis room
   */
  emitProgress(analysisId, progress, stage, data = null) {
    const payload = {
      analysisId,
      progress: Math.round(progress),
      stage,
      timestamp: new Date().toISOString(),
      data
    };

    this.io.to(`analysis_${analysisId}`).emit('analysis_progress', payload);
    console.log(`📊 Progress update for ${analysisId}: ${progress}% - ${stage}`);
  }

  /**
   * Emit error to specific analysis room
   */
  emitError(analysisId, error) {
    const payload = {
      analysisId,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    this.io.to(`analysis_${analysisId}`).emit('analysis_error', payload);
    console.log(`❌ Error for ${analysisId}: ${error.message}`);
  }

  /**
   * Get active analysis status
   */
  getAnalysisStatus(analysisId) {
    return this.activeAnalyses.get(analysisId);
  }

  /**
   * Get all active analyses for a user
   */
  getUserAnalyses(userId) {
    const userAnalyses = [];
    for (const [id, analysis] of this.activeAnalyses) {
      if (analysis.userId === userId) {
        userAnalyses.push(analysis);
      }
    }
    return userAnalyses;
  }

  /**
   * Clean up old analyses
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [id, analysis] of this.activeAnalyses) {
      if (now - analysis.startTime > maxAge) {
        this.activeAnalyses.delete(id);
        console.log(`🧹 Cleaned up old analysis: ${id}`);
      }
    }
  }

  /**
   * Get server statistics
   */
  getStats() {
    return {
      connectedClients: this.io.engine.clientsCount,
      activeAnalyses: this.activeAnalyses.size,
      uptime: process.uptime()
    };
  }
}

module.exports = RealtimeService;
