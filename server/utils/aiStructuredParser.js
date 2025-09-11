const pdf2json = require('pdf2json');
const OpenAI = require('openai');

/**
 * AI-Enhanced Structured Parser
 * Uses pdf2json to get precise layout data, then AI to intelligently organize content
 */
class AIStructuredParser {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Main parsing method - combines pdf2json structure with AI intelligence
   */
  async parsePDF(filePath) {
    try {
      console.log('🤖 Starting AI-enhanced structured parsing...');
      
      // Step 1: Get structured data from pdf2json
      const structuredData = await this.getStructuredData(filePath);
      console.log(`📊 Extracted ${structuredData.pages.length} pages with ${structuredData.totalTextElements} text elements`);
      
      // Step 2: Process with AI for intelligent organization
      const aiResult = await this.processWithAI(structuredData);
      
      return {
        success: true,
        text: aiResult.organizedText,
        method: 'ai-structured-pdf2json',
        confidence: aiResult.confidence,
        quality: aiResult.quality,
        sections: aiResult.sections,
        metadata: {
          pages: structuredData.pages.length,
          totalElements: structuredData.totalTextElements,
          aiProcessingTime: aiResult.processingTime
        }
      };
      
    } catch (error) {
      console.error('❌ AI-structured parsing failed:', error);
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
   * Process structured data with AI for intelligent organization
   */
  async processWithAI(structuredData) {
    const startTime = Date.now();
    
    try {
      // Prepare data for AI processing
      const dataForAI = this.prepareDataForAI(structuredData);
      
      const prompt = this.createAIPrompt(dataForAI);
      
      console.log('🧠 Sending structured data to AI for processing...');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.1,
        max_tokens: 3000
      });

      const aiResponse = response.choices[0].message.content.trim();
      const processingTime = Date.now() - startTime;
      
      // Parse AI response
      const result = this.parseAIResponse(aiResponse);
      
      return {
        organizedText: result.text,
        sections: result.sections,
        confidence: result.confidence,
        quality: result.quality,
        processingTime: processingTime
      };
      
    } catch (error) {
      console.error('❌ AI processing failed:', error);
      // Fallback to simple text extraction
      return this.fallbackProcessing(structuredData);
    }
  }

  /**
   * Prepare structured data for AI processing
   */
  prepareDataForAI(structuredData) {
    const processedData = {
      pages: structuredData.pages.map(page => ({
        pageNumber: page.pageNumber,
        dimensions: { width: page.width, height: page.height },
        lines: page.lines.map(line => ({
          text: line.text,
          position: { x: line.x, y: line.y, width: line.width },
          elementCount: line.elementCount
        }))
      })),
      totalElements: structuredData.totalTextElements,
      metadata: structuredData.metadata
    };

    return processedData;
  }

  /**
   * Create AI prompt for resume organization
   */
  createAIPrompt(dataForAI) {
    return `
You are an expert resume parser and ATS optimization specialist. I have extracted structured data from a PDF resume using precise positioning coordinates. Please analyze this data and organize it into a clean, well-structured resume format that will score well with ATS systems.

STRUCTURED DATA FROM PDF:
${JSON.stringify(dataForAI, null, 2)}

Please organize this content into a clean resume format with the following requirements:

1. **Section Organization**: Clearly identify and separate sections (Contact, Summary, Experience, Education, Skills, etc.)
2. **Content Flow**: Ensure logical flow and proper association of dates with their respective entries
3. **Formatting**: Fix any spacing issues, character separation problems, or formatting inconsistencies
4. **ATS Optimization**: Structure content in a way that ATS systems can easily parse and understand
5. **Completeness**: Preserve all information while organizing it properly

Return your response in this exact JSON format:
{
  "text": "The complete organized resume text",
  "sections": ["Contact", "Summary", "Experience", "Education", "Skills"],
  "confidence": 95,
  "quality": 90,
  "notes": "Any important observations about the parsing"
}

Focus on creating clean, readable text that maintains all the original information while fixing formatting issues and ensuring proper section separation.
`;
  }

  /**
   * Parse AI response
   */
  parseAIResponse(aiResponse) {
    try {
      // Try to parse as JSON first
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          text: parsed.text || aiResponse,
          sections: parsed.sections || [],
          confidence: parsed.confidence || 85,
          quality: parsed.quality || 80,
          notes: parsed.notes || ''
        };
      }
    } catch (error) {
      console.log('⚠️ Could not parse AI response as JSON, using raw text');
    }

    // Fallback to raw text
    return {
      text: aiResponse,
      sections: [],
      confidence: 75,
      quality: 70,
      notes: 'AI response could not be parsed as structured JSON'
    };
  }

  /**
   * Fallback processing if AI fails
   */
  fallbackProcessing(structuredData) {
    console.log('🔄 Using fallback text extraction...');
    
    let text = '';
    structuredData.pages.forEach((page, pageIndex) => {
      if (pageIndex > 0) text += '\n\n';
      
      page.lines.forEach(line => {
        if (line.text.trim()) {
          text += line.text + '\n';
        }
      });
    });

    return {
      organizedText: text.trim(),
      sections: [],
      confidence: 60,
      quality: 50,
      processingTime: 0
    };
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
        avgLineLength: Math.round(lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length),
        textElements: page.textElements.length
      };
      
      // Detect potential sections
      page.lines.forEach(line => {
        if (this.isPotentialSectionHeader(line.text)) {
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

  /**
   * Check if text might be a section header
   */
  isPotentialSectionHeader(text) {
    const sectionKeywords = [
      'experience', 'education', 'skills', 'summary', 'objective', 'profile',
      'contact', 'certifications', 'awards', 'honors', 'projects', 'work',
      'technical', 'professional', 'academic', 'credentials'
    ];
    
    const lowerText = text.toLowerCase().trim();
    
    return sectionKeywords.some(keyword => 
      lowerText === keyword || 
      lowerText.startsWith(keyword + ' ') ||
      lowerText.includes(keyword + ':') ||
      lowerText.includes(keyword)
    );
  }
}

module.exports = AIStructuredParser;
