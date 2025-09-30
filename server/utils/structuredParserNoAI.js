const pdf2json = require('pdf2json');

/**
 * Structured Parser without AI dependency
 * Uses pdf2json to get precise layout data and organizes it intelligently
 */
class StructuredParserNoAI {
  constructor() {
    // No AI dependency - just intelligent text organization
  }

  /**
   * Main parsing method - uses pdf2json structure with intelligent organization
   */
  async parsePDF(filePath) {
    try {
      console.log('🔍 Starting structured PDF parsing (no AI)...');
      
      // Get structured data from pdf2json
      const structuredData = await this.getStructuredData(filePath);
      console.log(`📊 Extracted ${structuredData.pages.length} pages with ${structuredData.totalTextElements} text elements`);
      
      // Process with intelligent organization
      const organizedResult = this.organizeStructuredData(structuredData);
      
      return {
        success: true,
        text: organizedResult.text,
        method: 'structured-pdf2json-no-ai',
        confidence: organizedResult.confidence,
        quality: organizedResult.quality,
        sections: organizedResult.sections,
        metadata: {
          pages: structuredData.pages.length,
          totalElements: structuredData.totalTextElements,
          processingTime: organizedResult.processingTime
        }
      };
      
    } catch (error) {
      console.error('❌ Structured parsing failed:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  /**
   * Get structured data from PDF using pdf2json
   */
  async getStructuredData(filePath) {
    return new Promise((resolve, reject) => {
      const pdfParser = new pdf2json();
      
      pdfParser.on('pdfParser_dataError', (errData) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          const structuredData = this.processPDFData(pdfData);
          resolve(structuredData);
        } catch (error) {
          reject(error);
        }
      });

      pdfParser.loadPDF(filePath);
    });
  }

  /**
   * Process PDF data into organized structure with coordinates
   */
  processPDFData(pdfData) {
    const pages = [];
    let totalTextElements = 0;
    
    if (pdfData.Pages) {
      pdfData.Pages.forEach((page, pageIndex) => {
        const pageData = {
          pageNumber: pageIndex + 1,
          width: page.Width || 0,
          height: page.Height || 0,
          textElements: this.extractTextElements(page),
          lines: []
        };
        
        // Group text elements into lines
        pageData.lines = this.groupElementsIntoLines(pageData.textElements);
        
        totalTextElements += pageData.textElements.length;
        pages.push(pageData);
      });
    }

    return { 
      pages, 
      totalTextElements,
      metadata: pdfData.Meta || {}
    };
  }

  /**
   * Extract individual text elements with precise positioning
   */
  extractTextElements(page) {
    if (!page.Texts) return [];

    return page.Texts.map((textItem, index) => {
      if (textItem.R) {
        const text = textItem.R.map(r => decodeURIComponent(r.T)).join('');
        return {
          index: index,
          x: textItem.x,
          y: textItem.y,
          width: textItem.width || 0,
          height: textItem.height || 0,
          text: text,
          fontSize: textItem.R[0]?.TS ? textItem.R[0].TS[1] : 0
        };
      }
      return null;
    }).filter(item => item !== null);
  }

  /**
   * Group text elements into lines based on Y coordinate proximity
   */
  groupElementsIntoLines(textElements) {
    if (textElements.length === 0) return [];

    // Sort by Y coordinate first
    const sortedElements = [...textElements].sort((a, b) => a.y - b.y);
    
    const lines = [];
    let currentLine = [];
    let currentY = sortedElements[0].y;
    const Y_TOLERANCE = 0.5; // Elements within 0.5 units are considered same line

    sortedElements.forEach(element => {
      if (Math.abs(element.y - currentY) <= Y_TOLERANCE) {
        // Same line
        currentLine.push(element);
      } else {
        // New line
        if (currentLine.length > 0) {
          lines.push(this.createLineFromElements(currentLine));
        }
        currentLine = [element];
        currentY = element.y;
      }
    });

    // Add the last line
    if (currentLine.length > 0) {
      lines.push(this.createLineFromElements(currentLine));
    }

    return lines;
  }

  /**
   * Create a line object from grouped text elements
   */
  createLineFromElements(elements) {
    // Sort elements by X coordinate to maintain reading order
    const sortedElements = elements.sort((a, b) => a.x - b.x);
    
    const text = sortedElements.map(el => el.text).join('');
    const avgY = elements.reduce((sum, el) => sum + el.y, 0) / elements.length;
    const minX = Math.min(...elements.map(el => el.x));
    const maxX = Math.max(...elements.map(el => el.x + el.width));

    return {
      y: avgY,
      x: minX,
      width: maxX - minX,
      text: text.trim(),
      elements: sortedElements,
      elementCount: elements.length
    };
  }

  /**
   * Organize structured data intelligently without AI
   */
  organizeStructuredData(structuredData) {
    const startTime = Date.now();
    
    let organizedText = '';
    const sections = [];
    let currentSection = '';
    
    structuredData.pages.forEach((page, pageIndex) => {
      if (pageIndex > 0) {
        organizedText += '\n\n'; // Page break
      }
      
      const pageResult = this.organizePageLines(page.lines);
      organizedText += pageResult.text;
      
      // Collect sections
      pageResult.sections.forEach(section => {
        if (!sections.includes(section)) {
          sections.push(section);
        }
      });
    });

    const processingTime = Date.now() - startTime;
    
    // Calculate quality and confidence
    const quality = this.calculateQuality(organizedText, sections);
    const confidence = this.calculateConfidence(organizedText, structuredData);

    return {
      text: organizedText.trim(),
      sections: sections,
      confidence: confidence,
      quality: quality,
      processingTime: processingTime
    };
  }

  /**
   * Organize lines within a page
   */
  organizePageLines(lines) {
    const organizedLines = [];
    const sections = [];
    let currentSection = '';
    let lastLineWasHeader = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.text || line.text.trim().length === 0) continue;
      
      // Check if this is a section header
      if (this.isSectionHeader(line.text)) {
        // Add spacing before new section (except for first section)
        if (organizedLines.length > 0 && !lastLineWasHeader) {
          organizedLines.push('');
        }
        
        organizedLines.push(line.text.toUpperCase());
        sections.push(line.text);
        currentSection = line.text.toLowerCase();
        lastLineWasHeader = true;
        continue;
      }
      
      // Check if this is a date line
      if (this.isDateLine(line.text)) {
        // Try to associate with previous line if it's not already associated
        if (organizedLines.length > 0 && !lastLineWasHeader) {
          const lastLine = organizedLines[organizedLines.length - 1];
          if (!this.isDateLine(lastLine) && !this.isSectionHeader(lastLine)) {
            organizedLines[organizedLines.length - 1] = `${lastLine} - ${line.text}`;
            lastLineWasHeader = false;
            continue;
          }
        }
      }
      
      // Regular content line
      organizedLines.push(line.text);
      lastLineWasHeader = false;
    }
    
    return {
      text: organizedLines.join('\n'),
      sections: sections
    };
  }

  /**
   * Check if a line is a section header
   */
  isSectionHeader(text) {
    const sectionKeywords = [
      'experience', 'education', 'skills', 'summary', 'objective', 'profile',
      'contact', 'certifications', 'awards', 'honors', 'projects', 'work',
      'technical', 'professional', 'academic', 'credentials', 'achievements'
    ];
    
    const lowerText = text.toLowerCase().trim();
    
    // Check for exact matches or starts with
    return sectionKeywords.some(keyword => 
      lowerText === keyword || 
      lowerText.startsWith(keyword + ' ') ||
      lowerText.includes(keyword + ':') ||
      (lowerText.length < 20 && lowerText.includes(keyword))
    );
  }

  /**
   * Check if a line contains date information
   */
  isDateLine(text) {
    // Look for date patterns
    const datePatterns = [
      /^\d{4}\s*-\s*\d{4}$/, // 2010 - 2015
      /^\d{4}\s*-\s*(present|current)$/i, // 2010 - Present
      /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*-\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}$/i,
      /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*-\s*(present|current)$/i,
      /issued on/i,
      /^\d{4}$/ // Just a year
    ];
    
    return datePatterns.some(pattern => pattern.test(text.trim()));
  }

  /**
   * Calculate quality score
   */
  calculateQuality(text, sections) {
    let score = 50; // Base score
    
    // Bonus for having multiple sections
    if (sections.length >= 3) score += 20;
    if (sections.length >= 5) score += 10;
    
    // Bonus for reasonable text length
    if (text.length > 1000) score += 10;
    if (text.length > 2000) score += 10;
    
    // Penalty for very short text
    if (text.length < 500) score -= 20;
    
    // Bonus for having common resume sections
    const commonSections = ['experience', 'education', 'skills', 'contact'];
    const foundSections = commonSections.filter(section => 
      sections.some(s => s.toLowerCase().includes(section))
    );
    score += foundSections.length * 5;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(text, structuredData) {
    let confidence = 60; // Base confidence
    
    // Bonus for having structured data
    if (structuredData.totalTextElements > 100) confidence += 10;
    if (structuredData.totalTextElements > 500) confidence += 10;
    
    // Bonus for multiple pages
    if (structuredData.pages.length > 1) confidence += 10;
    
    // Bonus for reasonable text length
    if (text.length > 1000) confidence += 10;
    
    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Get detailed analysis of the structured data
   */
  getDetailedAnalysis(structuredData) {
    const analysis = {
      totalPages: structuredData.pages.length,
      totalTextElements: structuredData.totalTextElements,
      totalLines: 0,
      sections: [],
      layout: {},
      quality: {}
    };

    structuredData.pages.forEach(page => {
      analysis.totalLines += page.lines.length;
      
      // Analyze line characteristics
      const lineLengths = page.lines.map(line => line.text.length);
      analysis.layout[`page${page.pageNumber}`] = {
        lines: page.lines.length,
        avgLineLength: lineLengths.length > 0 ? Math.round(lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length) : 0,
        textElements: page.textElements.length
      };
      
      // Detect potential sections
      page.lines.forEach(line => {
        if (this.isSectionHeader(line.text)) {
          analysis.sections.push({
            name: line.text,
            page: page.pageNumber,
            position: { x: line.x, y: line.y }
          });
        }
      });
    });

    return analysis;
  }
}

module.exports = StructuredParserNoAI;
