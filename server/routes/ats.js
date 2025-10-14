const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SimpleATSAnalyzer = require('../utils/simpleATSAnalyzer');
const EnhancedResumeParser = require('../utils/enhancedResumeParser');
const progressTracker = require('../utils/progressTracker');
// const PDFDocument = require('pdfkit');

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
      sectionCompleteness: analysis.sectionCompleteness,
      industryAlignment: analysis.industryAlignment,
      contentQuality: analysis.contentQuality,
      actionPlan: analysis.actionPlan,
      // Parsing method information
      parsingMethod: resumeData.method || 'traditional',
      processingMode: resumeData.processingMode || 'unknown',
      confidence: resumeData.confidence || 0,
      // PDF content for preview
      pdfContent: resumeData.text || '',
      // PDF URL for thumbnail
      pdfUrl: `/api/ats/pdf/${sessionId}`,
      // Years of experience
      yearsOfExperience: analysis.yearsOfExperience || { years: 0, source: 'Not found', confidence: 0 },
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

// Serve PDF files for preview
router.get('/pdf/:analysisId', (req, res) => {
  console.log(`🔍 PDF request received for analysisId: ${req.params.analysisId}`);
  
  try {
    const { analysisId } = req.params;
    // The logs directory is at the project root level, not inside server
    const pdfPath = path.join(__dirname, '../../logs', analysisId, 'resume.pdf');
    
    console.log(`🔍 Looking for PDF at: ${pdfPath}`);
    console.log(`🔍 Current working directory: ${process.cwd()}`);
    console.log(`🔍 __dirname: ${__dirname}`);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.log(`❌ PDF file not found at: ${pdfPath}`);
      
      // Let's also check if the directory exists
      const logDir = path.join(__dirname, '../../logs', analysisId);
      console.log(`🔍 Checking if log directory exists: ${logDir}`);
      console.log(`🔍 Log directory exists: ${fs.existsSync(logDir)}`);
      
      if (fs.existsSync(logDir)) {
        try {
          console.log(`🔍 Contents of log directory:`, fs.readdirSync(logDir));
        } catch (readError) {
          console.log(`🔍 Error reading directory:`, readError.message);
        }
      }
      
      return res.status(404).json({ error: 'PDF file not found' });
    }
    
    console.log(`✅ PDF file found, serving: ${pdfPath}`);
    
    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
    
    // Stream the PDF file with error handling
    const fileStream = fs.createReadStream(pdfPath);
    
    fileStream.on('error', (streamError) => {
      console.error('Error streaming PDF file:', streamError);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream PDF file' });
      }
    });
    
    res.on('error', (resError) => {
      console.error('Error in response:', resError);
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to serve PDF file' });
    }
  }
});

// Test endpoint to check PDF files
router.get('/test-pdf/:analysisId', (req, res) => {
  try {
    const { analysisId } = req.params;
    const pdfPath = path.join(__dirname, '../../logs', analysisId, 'resume.pdf');
    const logDir = path.join(__dirname, '../../logs', analysisId);
    
    const result = {
      analysisId,
      pdfPath,
      logDir,
      pdfExists: fs.existsSync(pdfPath),
      logDirExists: fs.existsSync(logDir),
      logDirContents: fs.existsSync(logDir) ? fs.readdirSync(logDir) : [],
      currentDir: __dirname,
      workingDir: process.cwd()
    };
    
    console.log('Test PDF endpoint result:', result);
    res.json(result);
  } catch (error) {
    console.error('Test PDF endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF Report endpoint
router.post('/generate-report', (req, res) => {
  try {
    const reportData = req.body;
    
    // TODO: Install pdfkit package first
    res.status(501).json({ 
      error: 'PDF report generation temporarily disabled. Please install pdfkit package.',
      message: 'The action plan and other features are working. PDF download will be available once pdfkit is installed.'
    });
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
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
