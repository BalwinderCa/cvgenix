const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const pdf2json = require('pdf2json');
const mammoth = require('mammoth');
const cheerio = require('cheerio');
const Tesseract = require('tesseract.js');
const AdvancedPDFParser = require('./advancedPDFParser');
const AIStructuredParser = require('./aiStructuredParser');
const StructuredParserNoAI = require('./structuredParserNoAI');

/**
 * Enhanced Resume Parser - Only handles text extraction from files
 * Single Responsibility: Parse files and return clean text
 */
class EnhancedResumeParser {
  constructor() {
    this.supportedFormats = {
      'application/pdf': this.parsePDF.bind(this),
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': this.parseDOCX.bind(this),
      'text/plain': this.parseTXT.bind(this),
      'text/html': this.parseHTML.bind(this)
    };
    
    // Initialize advanced PDF parser for OCR
    this.advancedPDFParser = new AdvancedPDFParser();
    
    // Initialize AI-enhanced parsers (with fallback if no API key)
    try {
      this.aiStructuredParser = new AIStructuredParser();
      this.hasAI = true;
    } catch (error) {
      console.log('⚠️ AI parser not available (no API key), using structured parser without AI');
      this.aiStructuredParser = null;
      this.hasAI = false;
    }
    
    this.structuredParserNoAI = new StructuredParserNoAI();
  }

  /**
   * Main parsing method - Only extracts text from files
   */
  async parseResume(filePath, mimeType) {
    try {
      console.log(`🔍 Parsing resume: ${path.basename(filePath)} (${mimeType})`);
      
      const parser = this.supportedFormats[mimeType];
      if (!parser) {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      // Try primary parsing method
      let result = await parser(filePath);
      
      // If primary method fails or returns poor results, try fallbacks
      if (!result.success || !result.text || result.text.length < 100) {
        console.log('🔄 Primary parsing failed, trying fallbacks...');
        result = await this.tryFallbackMethods(filePath, mimeType);
      }

      if (result.success && result.text) {
        // Add file metadata
        result.fileName = path.basename(filePath);
        result.fileSize = fs.statSync(filePath).size;
        result.parsedAt = new Date().toISOString();
      }

      return result;
    } catch (error) {
      console.error('❌ Resume parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Parse PDF files with multiple methods for better accuracy
   */
  async parsePDF(filePath) {
    console.log('🔍 Starting multi-method PDF parsing...');
    
    // Try multiple parsing methods and select the best one
    const methods = [];
    
    // Add AI-structured method if available
    if (this.hasAI) {
      methods.push({ name: 'ai-structured', method: this.parsePDFWithAIStructured.bind(this) });
    }
    
    // Add other methods
    methods.push(
      { name: 'structured-no-ai', method: this.parsePDFWithStructuredNoAI.bind(this) },
      { name: 'pdf2json', method: this.parsePDFWithPDF2JSON.bind(this) },
      { name: 'pdf-parse', method: this.parsePDFWithPDFParse.bind(this) },
      { name: 'ocr-fallback', method: this.parsePDFWithOCR.bind(this) }
    );

    const results = [];
    
    // Try all methods and collect results
    for (const { name, method } of methods) {
      try {
        console.log(`🔄 Trying ${name} method...`);
        const result = await method(filePath);
        
        if (result.success && result.text && result.text.trim().length > 50) {
          // Simple text cleaning - just normalize spacing and add section separators
          const cleanedText = this.simpleTextClean(result.text);
          const confidence = this.calculateConfidence(cleanedText);
          const quality = this.assessTextQuality(cleanedText);
          
          console.log(`✅ ${name} method succeeded - extracted ${result.text.length} characters, quality: ${quality}/100`);
          
          results.push({
            ...result,
            text: cleanedText,
            parsingMethod: name,
            confidence: confidence,
            quality: quality
          });
        } else {
          console.log(`⚠️ ${name} method failed or returned insufficient text`);
        }
      } catch (error) {
        console.log(`❌ ${name} method failed:`, error.message);
      }
    }

    // Select the best result based on quality and confidence
    if (results.length > 0) {
      // Sort by quality first, then by confidence, then by text length
      results.sort((a, b) => {
        if (a.quality !== b.quality) return b.quality - a.quality;
        if (a.confidence !== b.confidence) return b.confidence - a.confidence;
        return b.text.length - a.text.length;
      });
      
      const bestResult = results[0];
      console.log(`🏆 Selected ${bestResult.parsingMethod} as best method (quality: ${bestResult.quality}/100, confidence: ${bestResult.confidence}/100)`);
      
      return bestResult;
    }

    // If all methods fail
    return {
      success: false,
      error: 'All PDF parsing methods failed',
      text: null,
      parsingMethod: 'none'
    };
  }

  /**
   * Parse PDF using pdf2json (better for structured content)
   */
  async parsePDFWithPDF2JSON(filePath) {
    return new Promise((resolve) => {
      const pdfParser = new pdf2json();
      
      pdfParser.on('pdfParser_dataError', (errData) => {
        console.error('PDF2JSON parsing error:', errData.parserError);
        resolve({
          success: false,
          error: errData.parserError,
          text: null
        });
      });

      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          let text = '';
          
          // Extract text from all pages
          if (pdfData.Pages) {
            pdfData.Pages.forEach((page, pageIndex) => {
              if (page.Texts) {
                page.Texts.forEach((textItem) => {
                  if (textItem.R) {
                    textItem.R.forEach((run) => {
                      if (run.T) {
                        text += decodeURIComponent(run.T) + ' ';
                      }
                    });
                  }
                });
              }
            });
          }

          resolve({
            success: true,
            text: text.trim(),
            pages: pdfData.Pages ? pdfData.Pages.length : 0,
            info: pdfData.Meta || {},
            method: 'pdf2json'
          });
        } catch (error) {
          resolve({
            success: false,
            error: error.message,
            text: null
          });
        }
      });

      pdfParser.loadPDF(filePath);
    });
  }


  /**
   * Parse PDF using pdf-parse (original method)
   */
  async parsePDFWithPDFParse(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        success: true,
        text: data.text,
        pages: data.numpages,
        info: data.info,
        method: 'pdf-parse'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Parse PDF using OCR as fallback for scanned documents
   */
  async parsePDFWithOCR(filePath) {
    try {
      console.log('🔍 Attempting OCR parsing for scanned PDF...');
      
      const result = await this.advancedPDFParser.parsePDFWithOCR(filePath);
      
      if (result.success) {
        // Clean and validate the OCR text
        const cleanedText = this.advancedPDFParser.cleanOCRText(result.text);
        const isValidResume = this.advancedPDFParser.validateResumeContent(cleanedText);
        
        return {
          ...result,
          text: cleanedText,
          isValidResume: isValidResume,
          method: 'ocr-advanced'
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Simple text cleaning - just normalize spacing and add clear section separators
   */
  simpleTextClean(text) {
    if (!text) return '';

    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n\s*\n+/g, '\n\n') // Normalize multiple newlines
      .replace(/[ \t]+/g, ' ') // Normalize spaces and tabs
      .replace(/^\s+|\s+$/gm, '') // Trim each line
      .trim();
  }

  /**
   * Calculate confidence score based on text quality
   */
  calculateConfidence(text) {
    if (!text || text.length < 10) return 0;
    
    let confidence = 50; // Base confidence
    
    // Check for common resume sections
    const resumeKeywords = [
      'experience', 'education', 'skills', 'summary', 'objective',
      'contact', 'phone', 'email', 'linkedin', 'github',
      'university', 'degree', 'certification', 'project'
    ];
    
    const foundKeywords = resumeKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    confidence += Math.min(foundKeywords * 5, 30); // Up to 30 points for keywords
    
    // Check for proper formatting (newlines, structure)
    const lineCount = text.split('\n').length;
    if (lineCount > 10) confidence += 10;
    
    // Check for contact information patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    
    if (emailRegex.test(text)) confidence += 10;
    if (phoneRegex.test(text)) confidence += 10;
    
    return Math.min(confidence, 100);
  }

  /**
   * Assess text quality for ATS scoring (similar to parserComparison)
   */
  assessTextQuality(text) {
    if (!text || text.length < 10) return 0;

    let quality = 0;

    // Check for resume structure
    const structureKeywords = [
      'experience', 'education', 'skills', 'summary', 'objective',
      'contact', 'phone', 'email', 'linkedin', 'github'
    ];
    
    const foundStructure = structureKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    quality += foundStructure * 10; // Up to 100 points for structure

    // Check for contact information
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    
    if (emailRegex.test(text)) quality += 20;
    if (phoneRegex.test(text)) quality += 20;

    // Check for professional content
    const professionalKeywords = [
      'university', 'degree', 'certification', 'project', 'achievement',
      'responsibility', 'leadership', 'management', 'development', 'analysis'
    ];
    
    const foundProfessional = professionalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    quality += Math.min(foundProfessional * 5, 50); // Up to 50 points

    // Check for proper formatting (newlines, structure)
    const lineCount = text.split('\n').length;
    if (lineCount > 10) quality += 10;
    if (lineCount > 20) quality += 10;

    // Check for OCR artifacts (negative quality indicators)
    const ocrArtifacts = [
      /\b[0-9]{1,2}\s*[a-z]\b/g,  // Numbers followed by single letters
      /\b[a-z]{1,2}\s*[0-9]\b/g,  // Single letters followed by numbers
      /[^\w\s@.-]/g               // Special characters that shouldn't be in resumes
    ];
    
    let artifactCount = 0;
    ocrArtifacts.forEach(regex => {
      const matches = text.match(regex);
      if (matches) artifactCount += matches.length;
    });
    
    quality -= Math.min(artifactCount * 2, 30); // Penalize OCR artifacts

    // Check for spaced-out text (pdf2json issue)
    const spacedTextPattern = /[a-z]\s[a-z]\s[a-z]/g;
    const spacedMatches = text.match(spacedTextPattern);
    if (spacedMatches && spacedMatches.length > 10) {
      quality -= 40; // Heavy penalty for spaced-out text
    }

    return Math.max(0, Math.min(quality, 100));
  }

  /**
   * Parse DOCX files
   */
  async parseDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      
      return {
        success: true,
        text: result.value,
        messages: result.messages
      };
    } catch (error) {
      console.error('DOCX parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Parse TXT files
   */
  async parseTXT(filePath) {
    try {
      const text = fs.readFileSync(filePath, 'utf8');
      
      return {
        success: true,
        text: text
      };
    } catch (error) {
      console.error('TXT parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Parse HTML files
   */
  async parseHTML(filePath) {
    try {
      const html = fs.readFileSync(filePath, 'utf8');
      const $ = cheerio.load(html);
      
      // Remove script and style elements
      $('script, style').remove();
      
      const text = $.text();
      
      return {
        success: true,
        text: text
      };
    } catch (error) {
      console.error('HTML parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Try fallback parsing methods
   */
  async tryFallbackMethods(filePath, mimeType) {
    console.log('🔄 Attempting fallback parsing methods...');
    
    if (mimeType === 'application/pdf') {
      // For PDFs, try alternative methods
      const fallbackMethods = [
        { name: 'pdf-parse', method: this.parsePDFWithPDFParse.bind(this) }
      ];

      for (const { name, method } of fallbackMethods) {
        try {
          console.log(`🔄 Fallback: Trying ${name}...`);
          const result = await method(filePath);
          
          if (result.success && result.text && result.text.trim().length > 20) {
            console.log(`✅ Fallback ${name} succeeded`);
            return {
              ...result,
              parsingMethod: `fallback-${name}`,
              confidence: this.calculateConfidence(result.text)
            };
          }
        } catch (error) {
          console.log(`❌ Fallback ${name} failed:`, error.message);
        }
      }
    }

    // If all fallbacks fail
    return {
      success: false,
      error: 'All parsing methods and fallbacks failed',
      text: null,
      parsingMethod: 'none'
    };
  }

  /**
   * Parse PDF using AI-enhanced structured approach
   */
  async parsePDFWithAIStructured(filePath) {
    try {
      if (!this.hasAI || !this.aiStructuredParser) {
        throw new Error('AI parser not available');
      }
      
      console.log('🤖 Trying AI-structured parsing...');
      const result = await this.aiStructuredParser.parsePDF(filePath);
      
      if (result.success) {
        console.log(`✅ AI-structured parsing succeeded - quality: ${result.quality}/100, confidence: ${result.confidence}/100`);
      }
      
      return result;
    } catch (error) {
      console.log(`❌ AI-structured parsing failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Parse PDF using structured approach without AI
   */
  async parsePDFWithStructuredNoAI(filePath) {
    try {
      console.log('🔍 Trying structured parsing (no AI)...');
      const result = await this.structuredParserNoAI.parsePDF(filePath);
      
      if (result.success) {
        console.log(`✅ Structured parsing succeeded - quality: ${result.quality}/100, confidence: ${result.confidence}/100`);
      }
      
      return result;
    } catch (error) {
      console.log(`❌ Structured parsing failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }
}

module.exports = EnhancedResumeParser;