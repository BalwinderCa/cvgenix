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
    const Y_TOLERANCE = 0.6; // Elements within 0.5 units are considered same line

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
    
    // Smart text joining with minimal spacing
    let text = '';
    for (let i = 0; i < sortedElements.length; i++) {
      const currentElement = sortedElements[i];
      const nextElement = sortedElements[i + 1];
      
      text += currentElement.text;
      
      // Only add space for significant gaps (word boundaries)
      if (nextElement) {
        const gap = nextElement.x - (currentElement.x + currentElement.width);
        // Only add space for large gaps (likely word boundaries)
        if (gap > 3) {
          text += ' ';
        }
      }
    }
    
    // Clean up the text
    text = text
      .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space between lowercase and uppercase
      .replace(/([a-zA-Z])(\d)/g, '$1 $2')  // Add space between letters and numbers  
      .replace(/(\d)([a-zA-Z])/g, '$1 $2')  // Add space between numbers and letters
      .replace(/\s+/g, ' ')                 // Replace multiple spaces with single space
      .trim();
    
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
    
    return {
      text: organizedText.trim(),
      sections: sections,
      confidence: 100, // Fixed confidence since we successfully parsed
      quality: 100,    // Fixed quality since we successfully parsed
      processingTime: processingTime
    };
  }

  /**
   * Organize lines within a page (simplified - no section detection)
   */
  organizePageLines(lines) {
    const organizedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.text || line.text.trim().length === 0) continue;
      
      // Just add the line as-is
      organizedLines.push(line.text);
    }
    
    return {
      text: organizedLines.join('\n'),
      sections: [] // No sections tracked anymore
    };
  }

  // Removed section header and date detection functions - not needed anymore

  // Removed quality and confidence calculation functions - not needed anymore

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
      
      // No section detection - simplified analysis
    });

    return analysis;
  }
}

module.exports = StructuredParserNoAI;
