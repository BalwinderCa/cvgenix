const pdf2json = require('pdf2json');
const OpenAI = require('openai');

/**
 * AI-Enhanced PDF Parser using pdf2json + OpenAI for intelligent content structuring
 */
class AIEnhancedParser {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Parse PDF using pdf2json to get structured data, then use AI to organize it
   */
  async parsePDFWithAI(filePath) {
    try {
      console.log('🤖 Starting AI-enhanced PDF parsing...');
      
      // Step 1: Get structured data from pdf2json
      const structuredData = await this.getStructuredData(filePath);
      
      // Step 2: Process with AI to organize content
      const organizedContent = await this.organizeWithAI(structuredData);
      
      return {
        success: true,
        text: organizedContent,
        method: 'ai-enhanced',
        confidence: 95,
        quality: 90
      };
      
    } catch (error) {
      console.error('❌ AI-enhanced parsing failed:', error);
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
          const structuredData = this.processStructuredData(pdfData);
          resolve(structuredData);
        } catch (error) {
          reject(error);
        }
      });

      pdfParser.loadPDF(filePath);
    });
  }

  /**
   * Process pdf2json data into organized structure
   */
  processStructuredData(pdfData) {
    const pages = [];
    
    if (pdfData.Pages) {
      pdfData.Pages.forEach((page, pageIndex) => {
        const pageData = {
          pageNumber: pageIndex + 1,
          lines: this.extractLinesFromPage(page),
          sections: []
        };
        pages.push(pageData);
      });
    }

    return {
      pages: pages,
      metadata: pdfData.Meta || {}
    };
  }

  /**
   * Extract lines from page data by grouping text elements by Y coordinate
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
            text: text,
            elements: []
          };
        } else {
          // Combine text from same line
          lineGroups[y].text += text;
          lineGroups[y].elements.push({
            x: textItem.x,
            text: text
          });
        }
      }
    });

    // Convert to array and sort by Y coordinate
    return Object.values(lineGroups)
      .sort((a, b) => a.y - b.y)
      .map(line => ({
        y: line.y,
        x: line.x,
        text: line.text.trim(),
        elements: line.elements
      }));
  }

  /**
   * Use AI to organize the structured content
   */
  async organizeWithAI(structuredData) {
    try {
      // Prepare data for AI processing
      const dataForAI = this.prepareDataForAI(structuredData);
      
      const prompt = `
You are an expert resume parser. I have extracted structured data from a PDF resume using coordinates and text positioning. Please analyze this data and organize it into a clean, well-structured resume format.

STRUCTURED DATA:
${JSON.stringify(dataForAI, null, 2)}

Please organize this content into a clean resume format with:
1. Clear section headers (CONTACT, SUMMARY, EXPERIENCE, EDUCATION, etc.)
2. Proper formatting for each section
3. Correctly associated dates with their respective entries
4. Clean, readable text without coordinate information
5. Logical flow and organization

Return only the cleaned, organized resume text. Do not include any explanations or metadata.
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.1,
        max_tokens: 2000
      });

      return response.choices[0].message.content.trim();
      
    } catch (error) {
      console.error('❌ AI organization failed:', error);
      // Fallback to simple text extraction
      return this.fallbackTextExtraction(structuredData);
    }
  }

  /**
   * Prepare structured data for AI processing
   */
  prepareDataForAI(structuredData) {
    const processedData = {
      pages: structuredData.pages.map(page => ({
        pageNumber: page.pageNumber,
        lines: page.lines.map(line => ({
          text: line.text,
          position: { x: line.x, y: line.y }
        }))
      })),
      metadata: structuredData.metadata
    };

    return processedData;
  }

  /**
   * Fallback text extraction if AI fails
   */
  fallbackTextExtraction(structuredData) {
    let text = '';
    
    structuredData.pages.forEach(page => {
      page.lines.forEach(line => {
        if (line.text.trim()) {
          text += line.text + '\n';
        }
      });
      text += '\n'; // Page break
    });

    return text.trim();
  }

  /**
   * Get analysis of the structured data for debugging
   */
  getStructuredAnalysis(structuredData) {
    const analysis = {
      totalPages: structuredData.pages.length,
      totalLines: 0,
      averageLineLength: 0,
      sections: [],
      layout: {}
    };

    let totalLength = 0;
    
    structuredData.pages.forEach(page => {
      analysis.totalLines += page.lines.length;
      
      page.lines.forEach(line => {
        totalLength += line.text.length;
        
        // Simple section detection based on text patterns
        if (line.text.match(/^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|CONTACT|CERTIFICATIONS?)$/i)) {
          analysis.sections.push({
            name: line.text,
            page: page.pageNumber,
            position: { x: line.x, y: line.y }
          });
        }
      });
    });

    analysis.averageLineLength = Math.round(totalLength / analysis.totalLines);
    
    return analysis;
  }
}

module.exports = AIEnhancedParser;
