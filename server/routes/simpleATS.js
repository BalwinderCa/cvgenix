const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SimpleATSAnalyzer = require('../utils/simpleATSAnalyzer');
const EnhancedResumeParser = require('../utils/enhancedResumeParser');
const PDFGenerator = require('../utils/pdfGenerator');

const router = express.Router();
const analyzer = new SimpleATSAnalyzer();
const resumeParser = new EnhancedResumeParser();
const pdfGenerator = new PDFGenerator();

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
    fileSize: 10 * 1024 * 1024 // 10MB limit
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

// Simple ATS Analysis endpoint
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    console.log('🚀 Starting simple ATS analysis...');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file uploaded'
      });
    }

    const { industry = 'technology', role = 'Senior' } = req.body;
    
    console.log(`📄 Processing file: ${req.file.originalname}`);
    console.log(`🎯 Target: ${role} ${industry}`);
    console.log(`🤖 Models: Claude Sonnet 4 + GPT-4o (dual-model analysis)`);

    // Parse the resume using EnhancedResumeParser (only text extraction)
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
    
    // Log the text that will be sent to AI models
    console.log('📄 TEXT BEING SENT TO AI MODELS:');
    console.log('=' .repeat(80));
    console.log(resumeData.text);
    console.log('=' .repeat(80));

    // Analyze with dual models (Claude Sonnet 4 + GPT-4o)
    const analysis = await analyzer.analyzeResume(resumeData, industry, role);

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn('⚠️ Could not delete uploaded file:', cleanupError.message);
    }

    res.json({
      success: true,
      data: {
        analysis,
        extractedText: resumeData.text, // Full text
        fileName: resumeData.fileName || req.file.originalname,
        fileSize: resumeData.fileSize || req.file.size,
        parsedAt: resumeData.parsedAt,
        analyzedAt: new Date().toISOString(),
        model: 'Claude Sonnet 4 + GPT-4o (Dual-Model)'
      }
    });

  } catch (error) {
    console.error('❌ Simple ATS analysis error:', error);
    
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

// PDF Export endpoint
router.post('/export-pdf', async (req, res) => {
  try {
    console.log('📄 Starting PDF export...');
    
    const { analysisData, benchmarkData, fileName } = req.body;
    
    if (!analysisData || !benchmarkData) {
      return res.status(400).json({
        success: false,
        error: 'Analysis data and benchmark data are required for PDF export'
      });
    }

    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateAnalysisReport(
      analysisData,
      benchmarkData,
      { fileName: fileName || 'resume-analysis' }
    );

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'ats-analysis'}-report.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    console.log('✅ PDF export completed successfully');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ PDF export failed:', error);
    res.status(500).json({
      success: false,
      error: 'PDF export failed: ' + error.message
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Simple ATS analyzer is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-simple'
  });
});

module.exports = router;
