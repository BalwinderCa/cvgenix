const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const googleVisionOcrService = require('../services/googleVisionOcrService');

// Optional auth middleware - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
    } catch (err) {
      // Invalid token, but continue without user
      req.user = null;
    }
  }
  next();
};

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/ocr');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ocr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit (increased for PDFs)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image and PDF files are allowed.'));
    }
  }
});

// OCR endpoint - Uses Google Vision API
// Authentication is optional - allows unauthenticated requests for testing
router.post('/extract-text', optionalAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // Check if Google Vision is configured
    if (!googleVisionOcrService.isConfigured) {
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('Could not delete OCR temp file:', cleanupError.message);
      }
      
      return res.status(500).json({
        success: false,
        error: 'Google Vision OCR is not configured. Please set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_CREDENTIALS_JSON in your .env file.'
      });
    }
    
    // Use Google Vision OCR
    console.log(`🔍 Starting Google Vision OCR on ${fileExt} file: ${req.file.filename}`);
    
    try {
      let ocrResult;
      if (fileExt === '.pdf') {
        ocrResult = await googleVisionOcrService.extractTextFromPdf(filePath);
      } else {
        ocrResult = await googleVisionOcrService.extractTextFromImage(filePath);
      }

      if (!ocrResult || (!ocrResult.words || ocrResult.words.length === 0)) {
        // Clean up uploaded file before returning
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.warn('Could not delete OCR temp file:', cleanupError.message);
        }
        
        return res.json({
          success: true,
          textBlocks: [],
          wordCount: 0,
          lineCount: 0,
          method: 'google-vision',
          warning: 'No text found in file'
        });
      }

      // Convert to text blocks format
      // Note: Coordinates are in image space (could be 4000px wide), frontend will scale them
      // But we should still ensure widths are reasonable
      const CANVAS_WIDTH = 800; // Frontend canvas width
      const MAX_REASONABLE_WIDTH = 2000; // Max reasonable width in image space
      
      const textBlocks = ocrResult.lines.map((line) => {
        const lineHeight = line.bbox.y1 - line.bbox.y0;
        let textWidth = line.bbox.x1 - line.bbox.x0;
        
        // Constrain width if it's unreasonably large (likely OCR error)
        // Frontend will scale this to canvas space, but we should still cap it here
        if (textWidth > MAX_REASONABLE_WIDTH) {
          console.warn(`⚠️ OCR line width ${textWidth}px is unreasonably large, constraining to ${MAX_REASONABLE_WIDTH}px`);
          textWidth = MAX_REASONABLE_WIDTH;
        }
        
        return {
          text: line.text.trim(),
          x: line.bbox.x0,
          y: line.bbox.y0,
          width: textWidth,
          height: lineHeight,
          fontSize: line.fontSize || Math.max(8, Math.min(24, lineHeight * 0.85)),
          fontFamily: line.fontFamily || 'Arial, sans-serif',
          confidence: line.confidence || ocrResult.confidence || 95
        };
      });

      // Clean up uploaded file after successful processing
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('Could not delete OCR temp file:', cleanupError.message);
      }

      console.log(`✅ Google Vision OCR completed: ${textBlocks.length} text blocks extracted`);

      return res.json({
        success: true,
        textBlocks: textBlocks,
        wordCount: ocrResult.words.length,
        lineCount: ocrResult.lines.length,
        method: 'google-vision',
        confidence: ocrResult.confidence,
        pdfWidth: ocrResult.pdfWidth,
        pdfHeight: ocrResult.pdfHeight
      });

    } catch (googleError) {
      console.error('❌ Google Vision OCR failed:', googleError);
      
      // Clean up uploaded file on error
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('Could not delete OCR temp file after error:', cleanupError.message);
      }
      
      return res.status(500).json({
        success: false,
        error: `Google Vision OCR failed: ${googleError.message || 'Unknown error'}`
      });
    }

  } catch (error) {
    console.error('❌ OCR error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Could not delete OCR temp file after error:', cleanupError.message);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'OCR processing failed'
    });
  }
});

module.exports = router;
