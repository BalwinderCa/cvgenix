const pdf2json = require('pdf2json');

/**
 * Simple Structured Parser - Uses pdf2json to get layout data, then organizes it
 */
class SimpleStructuredParser {
  constructor() {
    // No AI dependency - just intelligent text organization
  }

  /**
   * Parse PDF and return structured, organized text
   */
  async parsePDF(filePath) {
    try {
      console.log('🔍 Parsing PDF with structured approach...');
      
      // Get structured data from pdf2json
      const structuredData = await this.getStructuredData(filePath);
      
      // Organize the data intelligently
      const organizedText = this.organizeStructuredData(structuredData);
      
      return {
        success: true,
        text: organizedText,
        method: 'structured-pdf2json',
        confidence: 90,
        quality: 85
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
   * Get structured data from PDF
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
   * Process PDF data into organized structure
   */
  processPDFData(pdfData) {
    const pages = [];
    
    if (pdfData.Pages) {
      pdfData.Pages.forEach((page, pageIndex) => {
        const pageData = {
          pageNumber: pageIndex + 1,
          lines: this.extractLinesFromPage(page)
        };
        pages.push(pageData);
      });
    }

    return { pages };
  }

  /**
   * Extract lines from page by grouping text elements by Y coordinate
   */
  extractLinesFromPage(page) {
    if (!page.Texts) return [];

    // Group text elements by Y coordinate (same line)
    const lineGroups = {};
    
    page.Texts.forEach(textItem => {
      if (textItem.R) {
        const y = Math.round(textItem.y * 10) / 10; // Round to 1 decimal place
        const text = textItem.R.map(r => decodeURIComponent(r.T)).join('');
        
        if (!lineGroups[y]) {
          lineGroups[y] = {
            y: y,
            x: textItem.x,
            text: text
          };
        } else {
          // Combine text from same line, maintaining X order
          lineGroups[y].text += text;
        }
      }
    });

    // Convert to array and sort by Y coordinate
    return Object.values(lineGroups)
      .sort((a, b) => a.y - b.y)
      .map(line => ({
        y: line.y,
        x: line.x,
        text: line.text.trim()
      }));
  }

  /**
   * Organize structured data into clean resume format
   */
  organizeStructuredData(structuredData) {
    let organizedText = '';
    
    structuredData.pages.forEach((page, pageIndex) => {
      if (pageIndex > 0) {
        organizedText += '\n\n'; // Page break
      }
      
      const organizedLines = this.organizePageLines(page.lines);
      organizedText += organizedLines.join('\n');
    });

    return organizedText.trim();
  }

  /**
   * Organize lines within a page
   */
  organizePageLines(lines) {
    const organizedLines = [];
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.text) continue;
      
      // Check if this is a section header
      if (this.isSectionHeader(line.text)) {
        // Add spacing before new section
        if (organizedLines.length > 0) {
          organizedLines.push('');
        }
        
        organizedLines.push(line.text.toUpperCase());
        currentSection = line.text.toLowerCase();
        continue;
      }
      
      // Check if this is a date line
      if (this.isDateLine(line.text)) {
        // Try to associate with previous line if it's not already associated
        if (organizedLines.length > 0) {
          const lastLine = organizedLines[organizedLines.length - 1];
          if (!this.isDateLine(lastLine) && !this.isSectionHeader(lastLine)) {
            organizedLines[organizedLines.length - 1] = `${lastLine} - ${line.text}`;
            continue;
          }
        }
      }
      
      // Regular content line
      organizedLines.push(line.text);
    }
    
    return organizedLines;
  }

  /**
   * Check if a line is a section header
   */
  isSectionHeader(text) {
    const sectionKeywords = [
      'experience', 'education', 'skills', 'summary', 'objective', 'profile',
      'contact', 'certifications', 'awards', 'honors', 'projects', 'work'
    ];
    
    const lowerText = text.toLowerCase().trim();
    
    // Check for exact matches or starts with
    return sectionKeywords.some(keyword => 
      lowerText === keyword || 
      lowerText.startsWith(keyword + ' ') ||
      lowerText.includes(keyword + ':')
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
   * Get analysis of the structured data
   */
  getAnalysis(structuredData) {
    const analysis = {
      totalPages: structuredData.pages.length,
      totalLines: 0,
      sections: [],
      layout: {}
    };

    structuredData.pages.forEach(page => {
      analysis.totalLines += page.lines.length;
      
      page.lines.forEach(line => {
        if (this.isSectionHeader(line.text)) {
          analysis.sections.push({
            name: line.text,
            page: page.pageNumber,
            position: line.y
          });
        }
      });
    });

    return analysis;
  }
}

module.exports = SimpleStructuredParser;
