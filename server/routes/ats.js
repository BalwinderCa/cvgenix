const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SimpleATSAnalyzer = require('../utils/simpleATSAnalyzer');
const EnhancedResumeParser = require('../utils/enhancedResumeParser');
const progressTracker = require('../utils/progressTracker');
const PDFDocument = require('pdfkit');
const auth = require('../middleware/auth');
const User = require('../models/User');

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

// ATS Analysis endpoint - Requires authentication and credits
router.post('/analyze', auth, upload.single('resume'), async (req, res) => {
  const startTime = Date.now();
  const timeout = 120000; // 2 minutes timeout
  const sessionId = req.body.sessionId || `ats-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Check if user has credits
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has credits (1 credit per ATS analysis)
    if (user.credits < 1) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient credits',
        message: 'You need at least 1 credit to perform ATS analysis. Please purchase a credit pack.',
        credits: user.credits
      });
    }

    // Deduct credit before processing
    user.credits -= 1;
    await user.save();
    console.log(`💰 Deducted 1 credit from user ${user.email}. Remaining credits: ${user.credits}`);
  } catch (error) {
    console.error('Error checking/deducting credits:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process credit check'
    });
  }
  
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
      keywords: analysis.keywords || {
        found: [],
        suggested: []
      },
      // Additional data from the analyzer
      overallGrade: analysis.overallGrade,
      detailedMetrics: analysis.detailedMetrics,
      quickStats: analysis.quickStats,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      sectionCompleteness: analysis.sectionCompleteness,
      sectionSuggestions: analysis.sectionSuggestions,
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
      // Job title detection and AI summary
      detectedJobTitle: analysis.detectedJobTitle || 'Not detected',
      aiSummary: analysis.aiSummary || 'Analysis summary not available',
      matchScoreDescription: analysis.matchScoreDescription || 'Match score analysis not available',
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
    const { reportData } = req.body;
    
    if (!reportData) {
      return res.status(400).json({ error: 'Report data is required' });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ATS-Report-${reportData.analysisId}.pdf"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to the PDF - Match the rich UI content
    doc.fontSize(24).text('ATS Analysis Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    
    // Header Info
    doc.fontSize(16).text('Analysis Overview', { underline: true });
    doc.fontSize(12).text(`Analysis ID: ${reportData.analysisId}`);
    doc.text(`File: ${reportData.fileName || 'N/A'}`);
    doc.text(`Target Role: ${reportData.targetRole || 'N/A'} ${reportData.targetIndustry || 'N/A'}`);
    doc.text(`Analyzed: ${reportData.analyzedAt ? new Date(reportData.analyzedAt).toLocaleString() : 'N/A'}`);
    doc.moveDown(1);
    
    // Overall Score Section
    if (reportData.scores) {
      doc.fontSize(16).text('Overall ATS Score', { underline: true });
      doc.fontSize(32).text(`${reportData.scores.overall || 'N/A'}%`, { align: 'center' });
      doc.moveDown(0.5);
      
      // Detailed Metrics
      if (reportData.detailedMetrics) {
        doc.fontSize(14).text('Detailed Metrics:', { underline: true });
        doc.fontSize(12).text(`• Section Completeness: ${reportData.detailedMetrics.sectionCompleteness || 'N/A'}%`);
        doc.text(`• Keyword Density: ${reportData.detailedMetrics.keywordDensity || 'N/A'}%`);
        doc.text(`• Structure Consistency: ${reportData.detailedMetrics.structureConsistency || 'N/A'}%`);
        doc.text(`• Action Verbs: ${reportData.detailedMetrics.actionVerbs || 'N/A'}%`);
        doc.text(`• Quantified Achievements: ${reportData.detailedMetrics.quantifiedAchievements || 'N/A'}%`);
        doc.moveDown(1);
      }
    }
    
    // Job Title & AI Summary
    if (reportData.detectedJobTitle || reportData.aiSummary) {
      doc.fontSize(16).text('AI Analysis', { underline: true });
      
      if (reportData.detectedJobTitle) {
        doc.fontSize(14).text('Detected Job Title:', { underline: true });
        doc.fontSize(12).text(reportData.detectedJobTitle);
        doc.moveDown(0.5);
      }
      
      if (reportData.aiSummary) {
        doc.fontSize(14).text('AI Summary:', { underline: true });
        doc.fontSize(12).text(reportData.aiSummary, { align: 'justify' });
        doc.moveDown(1);
      }
    }
    
    // Years of Experience
    if (reportData.yearsOfExperience) {
      doc.fontSize(16).text('Experience Analysis', { underline: true });
      doc.fontSize(14).text(`Years of Experience: ${reportData.yearsOfExperience.years || 'N/A'}`);
      if (reportData.yearsOfExperience.source) {
        doc.fontSize(12).text(`Source: ${reportData.yearsOfExperience.source}`);
      }
      if (reportData.yearsOfExperience.confidence) {
        doc.fontSize(12).text(`Confidence: ${reportData.yearsOfExperience.confidence}%`);
      }
      doc.moveDown(1);
    }
    
    // Keywords Analysis
    if (reportData.keywords) {
      doc.fontSize(16).text('Keywords & Skills Analysis', { underline: true });
      
      if (reportData.keywords.found && reportData.keywords.found.length > 0) {
        doc.fontSize(14).text('Detected Keywords:', { underline: true });
        doc.fontSize(12).text(reportData.keywords.found.join(', '), { align: 'justify' });
        doc.moveDown(0.5);
      }
      
      if (reportData.keywords.suggested && reportData.keywords.suggested.length > 0) {
        doc.fontSize(14).text('Suggested Keywords:', { underline: true });
        doc.fontSize(12).text(reportData.keywords.suggested.join(', '), { align: 'justify' });
        doc.moveDown(1);
      }
    }
    
    // Strengths
    if (reportData.strengths && reportData.strengths.length > 0) {
      doc.fontSize(16).text('Strengths', { underline: true });
      reportData.strengths.slice(0, 5).forEach((strength, index) => {
        doc.fontSize(12).text(`${index + 1}. ${strength}`, { align: 'justify' });
      });
      doc.moveDown(1);
    }
    
    // Weaknesses
    if (reportData.weaknesses && reportData.weaknesses.length > 0) {
      doc.fontSize(16).text('Areas for Improvement', { underline: true });
      reportData.weaknesses.slice(0, 5).forEach((weakness, index) => {
        doc.fontSize(12).text(`${index + 1}. ${weakness}`, { align: 'justify' });
      });
      doc.moveDown(1);
    }
    
    // Section Completeness Check (matches frontend exactly)
    if (reportData.sectionCompleteness && reportData.sectionSuggestions) {
      doc.fontSize(16).text('Section Completeness Check', { underline: true });
      
      // Use the same section structure as the frontend
      const sectionChecks = [
        { 
          section: "Contact Information", 
          completeness: reportData.sectionCompleteness.contactInfo || 0,
          suggestion: reportData.sectionSuggestions.contactInfo || "-"
        },
        { 
          section: "Summary/Profile", 
          completeness: reportData.sectionCompleteness.professionalSummary || 0,
          suggestion: reportData.sectionSuggestions.professionalSummary || "-"
        },
        { 
          section: "Work Experience", 
          completeness: reportData.sectionCompleteness.experience || 0,
          suggestion: reportData.sectionSuggestions.experience || "-"
        },
        { 
          section: "Skills", 
          completeness: reportData.sectionCompleteness.skills || 0,
          suggestion: reportData.sectionSuggestions.skills || "-"
        },
        { 
          section: "Education", 
          completeness: reportData.sectionCompleteness.education || 0,
          suggestion: reportData.sectionSuggestions.education || "-"
        },
        { 
          section: "Certifications", 
          completeness: reportData.sectionCompleteness.certifications || 0,
          suggestion: reportData.sectionSuggestions.certifications || "-"
        }
      ];
      
      sectionChecks.forEach((item, index) => {
        // Get status like the frontend does
        let status = "optional";
        if (item.completeness >= 80) status = "complete";
        else if (item.completeness > 0) status = "partial";
        
        // Get status badge like the frontend
        let statusBadge = "Optional";
        if (status === "complete") statusBadge = "Complete";
        else if (status === "partial") statusBadge = "Partial";
        
        doc.fontSize(12).text(`${item.section}: ${statusBadge}`, { underline: true });
        if (item.suggestion && item.suggestion !== '-') {
          doc.fontSize(11).text(`Suggestion: ${item.suggestion}`, { align: 'justify' });
        }
        doc.moveDown(0.3);
      });
      doc.moveDown(1);
    }
    
    // AI Recommendations (matches frontend "AI Recommendations" section)
    if (reportData.actionPlan) {
      doc.fontSize(16).text('AI Recommendations', { underline: true });
      
      // Generate recommendations array like the frontend does
      const recommendations = [];
      if (reportData.actionPlan.highPriority) {
        reportData.actionPlan.highPriority.forEach(item => {
          recommendations.push(item.description);
        });
      }
      if (reportData.actionPlan.mediumPriority) {
        reportData.actionPlan.mediumPriority.slice(0, 2).forEach(item => {
          recommendations.push(item.description);
        });
      }
      
      if (recommendations.length > 0) {
        recommendations.slice(0, 5).forEach((rec, index) => {
          doc.fontSize(12).text(`${index + 1}. ${rec}`, { align: 'justify' });
        });
      }
    }
    
    // Footer
    doc.moveDown(1);
    doc.fontSize(10).text('Generated by CVGenix ATS Analyzer', { align: 'center' });
    doc.text('Visit cvgenix.com for more resume optimization tools', { align: 'center' });
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ error: error.message });
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
