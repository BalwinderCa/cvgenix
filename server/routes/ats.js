const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SimpleATSAnalyzer = require('../utils/simpleATSAnalyzer');
const EnhancedResumeParser = require('../utils/enhancedResumeParser');

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
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt', '.html'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, TXT, and HTML files are allowed.'));
    }
  }
});

// ATS Analysis endpoint
router.post('/analyze', upload.single('resume'), async (req, res) => {
  const startTime = Date.now();
  const timeout = 120000; // 2 minutes timeout
  
  // Set response timeout
  res.setTimeout(timeout, () => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        error: 'Analysis timeout - file too large or complex'
      });
    }
  });
  
  try {
    console.log('🚀 Starting ATS analysis...');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file uploaded'
      });
    }

    const { industry = 'technology', role = 'Senior' } = req.body;
    
    console.log(`📄 Processing file: ${req.file.originalname}`);
    console.log(`🎯 Target: ${role} ${industry}`);

    // Parse the resume using EnhancedResumeParser
    const parseResult = await resumeParser.parseResume(req.file.path, req.file.mimetype);
    
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error || 'Failed to parse resume'
      });
    }
    
    if (!parseResult.text || parseResult.text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No text content found in the uploaded file'
      });
    }

    // Prepare resume data for analysis
    const resumeData = {
      text: parseResult.text,
      fileName: parseResult.fileName,
      fileSize: parseResult.fileSize,
      parsedAt: parseResult.parsedAt
    };

    console.log(`📝 Extracted text length: ${resumeData.text.length} characters`);
    
    // Analyze with ATS analyzer
    const analysis = await analyzer.analyzeResume(resumeData, industry, role);

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn('⚠️ Could not delete uploaded file:', cleanupError.message);
    }

    // Transform the analysis result to match frontend expectations
    const transformedResult = {
      overallScore: analysis.overallScore || 0,
      keywordScore: analysis.keywordScore || 0,
      formatScore: analysis.formatScore || 0,
      structureScore: analysis.structureScore || 0,
      issues: analysis.issues || [],
      keywords: {
        found: analysis.keywords?.found || [],
        missing: analysis.keywords?.missing || [],
        suggested: analysis.keywords?.suggested || []
      },
      recommendations: analysis.recommendations || []
    };

    res.json({
      success: true,
      data: transformedResult
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
