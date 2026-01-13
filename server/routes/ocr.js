const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const adobeOcrService = require('../services/adobeOcrService');
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

// OCR endpoint - Uses Google Vision API (preferred) or falls back to Adobe OCR
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
    
    // Try Google Vision first (better for PDFs with structured data)
    if (googleVisionOcrService.isConfigured) {
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
        // Don't delete file yet - fall through to Adobe OCR if available
        // File will be cleaned up in the Adobe section or error handler
      }
    }

    // Fallback to Adobe OCR if Google Vision is not configured or failed
    if (!adobeOcrService.isConfigured) {
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('Could not delete OCR temp file:', cleanupError.message);
      }
      
      return res.status(500).json({
        success: false,
        error: 'No OCR service configured. Please set GOOGLE_APPLICATION_CREDENTIALS or ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in your .env file.'
      });
    }

    // Adobe OCR only works with PDFs
    if (fileExt !== '.pdf') {
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('Could not delete OCR temp file:', cleanupError.message);
      }
      
      return res.status(400).json({
        success: false,
        error: 'Adobe OCR only supports PDF files. Please upload a PDF file or configure Google Vision API.'
      });
    }

    console.log(`🔍 Starting Adobe OCR on PDF: ${req.file.filename}`);
    console.log(`🔧 Adobe OCR Service configured: ${adobeOcrService.isConfigured}, using OAuth: ${adobeOcrService.useOAuth}`);
    
    try {
      const ocrResult = await adobeOcrService.extractTextFromPdf(filePath);
      
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('Could not delete OCR temp file:', cleanupError.message);
      }

      if (!ocrResult || (!ocrResult.words || ocrResult.words.length === 0)) {
        return res.json({
          success: true,
          textBlocks: [],
          wordCount: 0,
          lineCount: 0,
          method: 'adobe',
          warning: 'No text found in PDF'
        });
      }

      // Convert to text blocks format
      // Adobe provides fontSize and fontFamily in the line data
      // BUT: Adobe often returns fontSize = lineHeight for multi-line text (which is wrong!)
      const textBlocks = ocrResult.lines.map((line) => {
        const lineHeight = line.bbox.y1 - line.bbox.y0;
        const textWidth = line.bbox.x1 - line.bbox.x0;
        const text = line.text.trim();
        
        // Adobe sometimes returns fontSize equal to lineHeight (which is wrong for multi-line text)
        // Calculate actual font size more accurately
        let fontSize = line.fontSize;
        
        // Detect if fontSize is suspiciously large (close to or equal to lineHeight)
        // For single-line text, fontSize should be about 70-85% of lineHeight
        // For multi-line text, fontSize should be lineHeight / number of lines
        const isSuspiciouslyLarge = fontSize && fontSize > lineHeight * 0.85;
        
        if (!fontSize || isSuspiciouslyLarge) {
          // Estimate number of lines based on text characteristics
          // Average character width is roughly fontSize * 0.6, so chars per line ≈ width / (fontSize * 0.6)
          // But we don't know fontSize yet, so estimate from lineHeight
          const estimatedCharWidth = lineHeight * 0.5; // Rough estimate: char width ≈ 50% of line height
          const estimatedCharsPerLine = Math.max(10, Math.floor(textWidth / estimatedCharWidth));
          const estimatedLines = Math.max(1, Math.ceil(text.length / estimatedCharsPerLine));
          
          // Calculate fontSize: for single line, fontSize ≈ lineHeight * 0.8
          // For multiple lines, fontSize ≈ lineHeight / lines * 0.8
          if (estimatedLines === 1) {
            fontSize = lineHeight * 0.8; // Single line: 80% of height
          } else {
            fontSize = (lineHeight / estimatedLines) * 0.85; // Multi-line: divide by lines, then 85%
          }
          
          // Clamp to reasonable values (8-20px for body text, up to 24px for headings)
          const isHeading = text.toUpperCase() === text && text.length < 50;
          const maxFontSize = isHeading ? 24 : 20;
          fontSize = Math.max(8, Math.min(maxFontSize, fontSize));
          
          if (isSuspiciouslyLarge) {
            console.log(`🔧 Fixed suspicious fontSize for "${text.substring(0, 40)}": ${line.fontSize.toFixed(1)}px → ${fontSize.toFixed(1)}px (height: ${lineHeight.toFixed(1)}, estimated lines: ${estimatedLines})`);
          }
        } else {
          // Adobe's fontSize seems reasonable, but clamp it anyway
          fontSize = Math.max(8, Math.min(24, fontSize));
        }
        
        return {
          text: text,
          x: line.bbox.x0,
          y: line.bbox.y0,
          width: textWidth,
          height: lineHeight,
          fontSize: fontSize,
          fontFamily: line.fontFamily || 'Arial, sans-serif',
          confidence: ocrResult.confidence || 95
        };
      });

      console.log(`✅ Adobe OCR completed: ${textBlocks.length} text blocks extracted`);

      return res.json({
        success: true,
        textBlocks: textBlocks,
        wordCount: ocrResult.words.length,
        lineCount: ocrResult.lines.length,
        method: 'adobe',
        confidence: ocrResult.confidence,
        // Include PDF dimensions for proper scaling on frontend
        pdfWidth: ocrResult.pdfWidth,
        pdfHeight: ocrResult.pdfHeight
      });

    } catch (adobeError) {
      console.error('❌ Adobe OCR failed:', adobeError);
      
      // Clean up uploaded file on error
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('Could not delete OCR temp file after error:', cleanupError.message);
      }
      
      return res.status(500).json({
        success: false,
        error: `Adobe OCR failed: ${adobeError.message || 'Unknown error'}`
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
