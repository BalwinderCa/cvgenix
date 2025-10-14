const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SimpleATSAnalyzer = require('../utils/simpleATSAnalyzer');
const EnhancedResumeParser = require('../utils/enhancedResumeParser');
const progressTracker = require('../utils/progressTracker');

const router = express.Router();
const analyzer = new SimpleATSAnalyzer();
const resumeParser = new EnhancedResumeParser();


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/ats');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC and TXT files are allowed.'));
    }
  }
});

// ATS Analysis endpoint
router.post('/analyze', upload.single('resume'), async (req, res) => {
  const startTime = Date.now();
  const timeout = 120000; // 2 minutes timeout
  const sessionId = req.body.sessionId || `ats-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Set response timeout
  res.setTimeout(timeout, () => {
    if (!res.headersSent) {
      errorProgress(sessionId, { message: 'Analysis timeout - file too large or complex' });
      res.status(408).json({
        success: false,
        error: 'Analysis timeout - file too large or complex'
      });
    }
  });
  
  try {
    console.log('🚀 Starting ATS analysis...');
    progressTracker.initializeProgress(sessionId);
    progressTracker.updateProgress(sessionId, 0, 'Resume file uploaded successfully');
    
    if (!req.file) {
      progressTracker.errorProgress(sessionId, { message: 'No resume file uploaded' });
      return res.status(400).json({
        success: false,
        error: 'No resume file uploaded'
      });
    }

    const { industry = 'technology', role = 'Senior' } = req.body;
    
    console.log(`📄 Processing file: ${req.file.originalname}`);
    console.log(`🎯 Target: ${role} ${industry}`);
    progressTracker.updateProgress(sessionId, 1, `Extracting text from ${req.file.originalname}...`);
    
    // Log analysis context
    const AnalysisLogger = require('../utils/analysisLogger');
    const logger = new AnalysisLogger();
    logger.logAnalysisContext(sessionId, industry, role);

    // Parse the resume using the best method
    console.log('🔍 Parsing resume with optimized method...');
    const resumeData = await resumeParser.parseResume(req.file.path, req.file.mimetype, sessionId);
    
    if (!resumeData.success || !resumeData.text) {
      progressTracker.errorProgress(sessionId, { message: 'Failed to extract text from resume' });
      return res.status(400).json({
        success: false,
        error: 'Failed to extract text from resume'
      });
    }
    
    console.log(`✅ Resume parsed successfully - ${resumeData.text.length} characters extracted`);
    console.log(`📊 Parsing method: ${resumeData.method || 'unknown'}, Processing mode: ${resumeData.processingMode || 'unknown'}, Confidence: ${resumeData.confidence || 'unknown'}`);
    
    
    progressTracker.updateProgress(sessionId, 1, `Text extracted successfully (${resumeData.text.length} characters)`);
    
    // Perform full ATS analysis with Sonnet
    progressTracker.updateProgress(sessionId, 2, 'Analyzing resume with AI...');
    
    const analysis = await analyzer.analyzeResume(resumeData, industry, role, sessionId);

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
      console.log('🗑️ Cleaned up uploaded file');
    } catch (cleanupError) {
      console.warn('⚠️ Could not delete uploaded file:', cleanupError.message);
    }

    progressTracker.updateProgress(sessionId, 3, 'Analyzing results and generating recommendations...');

    // Debug: Log what GPT actually returned
    console.log('🔍 GPT Analysis Debug:');
    console.log('atsScore:', analysis.atsScore);
    console.log('detailedMetrics:', JSON.stringify(analysis.detailedMetrics, null, 2));
    console.log('industryAlignment:', analysis.industryAlignment);
    console.log('contentQuality:', analysis.contentQuality);

    // Transform the analysis result to match frontend expectations
    const transformedResult = {
      overallScore: analysis.atsScore || 0,
      keywordScore: analysis.detailedMetrics?.keywordDensity || 0,
      formatScore: analysis.detailedMetrics?.structureConsistency || 0, // Using structureConsistency for format score
      structureScore: analysis.detailedMetrics?.sectionCompleteness || 0,
      issues: [
        ...(analysis.weaknesses || []).map(weakness => ({
          type: 'warning',
          message: weakness,
          suggestion: 'Consider addressing this area for improvement'
        })),
        ...(analysis.strengths || []).map(strength => ({
          type: 'info',
          message: strength,
          suggestion: 'This is a strong point in your resume'
        }))
      ],
      keywords: analysis.extractedKeywords || {
        found: [],
        missing: [],
        suggested: []
      },
      // Additional data from the analyzer
      overallGrade: analysis.overallGrade,
      detailedMetrics: analysis.detailedMetrics,
      quickStats: analysis.quickStats,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      sectionAnalysis: analysis.sectionAnalysis,
      industryAlignment: analysis.industryAlignment,
      contentQuality: analysis.contentQuality,
      // Parsing method information
      parsingMethod: resumeData.method || 'traditional',
      processingMode: resumeData.processingMode || 'unknown',
      confidence: resumeData.confidence || 0,
      // Analysis context
      targetIndustry: industry,
      targetRole: role
    };


    // Complete the progress
    progressTracker.completeProgress(sessionId, transformedResult);

    res.json({
      success: true,
      data: transformedResult,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('❌ ATS analysis error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('⚠️ Could not delete uploaded file after error:', cleanupError.message);
      }
    }

    // Send error progress
    progressTracker.errorProgress(sessionId, error);

    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ATS analyzer is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
