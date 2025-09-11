const fs = require('fs');
const path = require('path');
const pdf2pic = require('pdf2pic');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');

/**
 * Advanced PDF Parser with OCR support for scanned documents
 * Handles both text-based and image-based PDFs
 */
class AdvancedPDFParser {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Parse PDF with OCR fallback for scanned documents
   */
  async parsePDFWithOCR(filePath) {
    try {
      console.log('🔍 Starting OCR-based PDF parsing...');
      
      // Convert PDF to images
      const images = await this.convertPDFToImages(filePath);
      
      if (!images || images.length === 0) {
        throw new Error('Failed to convert PDF to images');
      }

      let fullText = '';
      let totalConfidence = 0;

      // Process each page with OCR
      for (let i = 0; i < images.length; i++) {
        console.log(`📄 Processing page ${i + 1}/${images.length} with OCR...`);
        
        const ocrResult = await this.performOCR(images[i]);
        
        if (ocrResult.success) {
          fullText += ocrResult.text + '\n\n';
          totalConfidence += ocrResult.confidence;
        }
      }

      const averageConfidence = images.length > 0 ? totalConfidence / images.length : 0;

      // Clean up temporary images
      await this.cleanupTempImages(images);

      return {
        success: true,
        text: fullText.trim(),
        pages: images.length,
        confidence: Math.round(averageConfidence),
        method: 'ocr',
        info: {
          ocrEngine: 'tesseract',
          pagesProcessed: images.length
        }
      };

    } catch (error) {
      console.error('❌ OCR PDF parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Convert PDF to images using pdf2pic
   */
  async convertPDFToImages(filePath) {
    try {
      const convert = pdf2pic.fromPath(filePath, {
        density: 300,           // Higher DPI for better OCR
        saveFilename: "page",
        savePath: this.tempDir,
        format: "png",
        width: 2000,           // Higher resolution
        height: 2000
      });

      const results = await convert.bulk(-1); // Convert all pages
      
      return results.map(result => result.path);
    } catch (error) {
      console.error('❌ PDF to image conversion failed:', error);
      throw error;
    }
  }

  /**
   * Perform OCR on an image using Tesseract
   */
  async performOCR(imagePath) {
    try {
      // Preprocess image for better OCR
      const processedImagePath = await this.preprocessImage(imagePath);
      
      const { data: { text, confidence } } = await Tesseract.recognize(
        processedImagePath,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`🔍 OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      // Clean up processed image
      if (processedImagePath !== imagePath) {
        fs.unlinkSync(processedImagePath);
      }

      return {
        success: true,
        text: text.trim(),
        confidence: confidence
      };

    } catch (error) {
      console.error('❌ OCR failed:', error);
      return {
        success: false,
        error: error.message,
        text: null,
        confidence: 0
      };
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(imagePath) {
    try {
      const processedPath = imagePath.replace('.png', '_processed.png');
      
      await sharp(imagePath)
        .greyscale()                    // Convert to grayscale
        .normalize()                    // Normalize contrast
        .sharpen()                      // Sharpen edges
        .threshold(128)                 // Apply threshold for better text recognition
        .png({ quality: 100 })
        .toFile(processedPath);

      return processedPath;
    } catch (error) {
      console.error('❌ Image preprocessing failed:', error);
      return imagePath; // Return original if preprocessing fails
    }
  }

  /**
   * Clean up temporary image files
   */
  async cleanupTempImages(imagePaths) {
    try {
      for (const imagePath of imagePaths) {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      console.log('🧹 Cleaned up temporary image files');
    } catch (error) {
      console.error('❌ Failed to cleanup temp images:', error);
    }
  }

  /**
   * Enhanced text cleaning for OCR results
   */
  cleanOCRText(text) {
    if (!text) return '';

    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Fix common OCR errors
      .replace(/\bl\b/g, 'I')           // Fix lowercase 'l' to 'I'
      .replace(/\b0\b/g, 'O')           // Fix '0' to 'O' in words
      .replace(/\b5\b/g, 'S')           // Fix '5' to 'S' in words
      // Remove non-printable characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      // Fix common resume formatting issues
      .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space between camelCase
      .trim();
  }

  /**
   * Validate OCR results for resume content
   */
  validateResumeContent(text) {
    if (!text || text.length < 50) return false;

    const resumeIndicators = [
      'experience', 'education', 'skills', 'summary', 'objective',
      'contact', 'phone', 'email', 'linkedin', 'github',
      'university', 'degree', 'certification', 'project',
      'work', 'employment', 'position', 'role', 'responsibilities'
    ];

    const lowerText = text.toLowerCase();
    const foundIndicators = resumeIndicators.filter(indicator => 
      lowerText.includes(indicator)
    );

    // Consider it a valid resume if we find at least 3 resume indicators
    return foundIndicators.length >= 3;
  }
}

module.exports = AdvancedPDFParser;
