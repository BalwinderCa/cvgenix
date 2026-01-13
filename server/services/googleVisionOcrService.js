const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');

class GoogleVisionOcrService {
  constructor() {
    // Initialize Google Vision client
    // Credentials can be provided via:
    // 1. GOOGLE_APPLICATION_CREDENTIALS environment variable (path to JSON key file)
    // 2. Or credentials object passed directly
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.client = new vision.ImageAnnotatorClient({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });
        console.log('🔧 Google Vision OCR Service initialized with credentials file');
      } else if (process.env.GOOGLE_CLOUD_CREDENTIALS_JSON) {
        // Support for JSON credentials as environment variable
        const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS_JSON);
        this.client = new vision.ImageAnnotatorClient({
          credentials: credentials
        });
        console.log('🔧 Google Vision OCR Service initialized with JSON credentials');
      } else {
        // Try default credentials (for GCP environments)
        this.client = new vision.ImageAnnotatorClient();
        console.log('🔧 Google Vision OCR Service initialized with default credentials');
      }
      this.isConfigured = true;
    } catch (error) {
      console.error('⚠️ Google Vision OCR Service initialization failed:', error.message);
      this.isConfigured = false;
      this.client = null;
    }
  }

  /**
   * Extract text from PDF using Google Cloud Vision API
   * Note: Google Vision API may not support PDFs directly in all cases
   * This method tries direct PDF detection first, then falls back to image conversion
   * @param {string|Buffer} pdfPathOrBuffer - Path to PDF file or PDF buffer
   * @returns {Promise<Object>} OCR results with text, words, lines, and blocks
   */
  async extractTextFromPdf(pdfPathOrBuffer) {
    if (!this.isConfigured || !this.client) {
      throw new Error('Google Cloud Vision is not configured. Please set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_CREDENTIALS_JSON in your .env file.');
    }

    // Google Vision API's documentTextDetection may not work reliably with PDFs
    // Convert PDF to image first for better results
    console.log('🖼️ Converting PDF to image for Google Vision OCR (PDF direct detection not always reliable)...');
    return await this.extractTextFromPdfViaImage(pdfPathOrBuffer);
  }

  /**
   * Extract text from PDF by converting to image first (more reliable)
   * @param {string|Buffer} pdfPathOrBuffer - Path to PDF file or PDF buffer
   * @returns {Promise<Object>} OCR results
   */
  async extractTextFromPdfViaImage(pdfPathOrBuffer) {
    const puppeteer = require('puppeteer');
    const path = require('path');
    const fs = require('fs');
    
    let pdfPath = pdfPathOrBuffer;
    let tempPdfCreated = false;
    let browser = null;
    
    try {
      // Handle buffer - save to temp file
      if (Buffer.isBuffer(pdfPathOrBuffer)) {
        const tempDir = path.join(__dirname, '../uploads/temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        pdfPath = path.join(tempDir, `temp-${Date.now()}.pdf`);
        fs.writeFileSync(pdfPath, pdfPathOrBuffer);
        tempPdfCreated = true;
      }

      console.log('🖼️ Converting PDF to image using Puppeteer...');
      
      // Use Puppeteer to convert PDF to image
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const page = await browser.newPage();
      
      // Read PDF buffer
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfBase64 = pdfBuffer.toString('base64');
      
      // Create HTML page that uses PDF.js to render PDF to canvas (no browser UI)
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            #pdf-canvas {
              display: block;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <canvas id="pdf-canvas"></canvas>
          <script>
            (async function() {
              const pdfjsLib = window['pdfjs-dist/build/pdf'];
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              
              const pdfData = atob('${pdfBase64}');
              const loadingTask = pdfjsLib.getDocument({ data: pdfData });
              const pdf = await loadingTask.promise;
              
              // Render first page
              const page = await pdf.getPage(1);
              const viewport = page.getViewport({ scale: 2.0 });
              
              const canvas = document.getElementById('pdf-canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              await page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;
              
              // Signal that rendering is complete
              window.pdfRendered = true;
            })();
          </script>
        </body>
        </html>
      `;
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Wait for PDF to render
      await page.waitForFunction(() => window.pdfRendered === true, { timeout: 30000 });
      
      // Get canvas dimensions
      const canvasDimensions = await page.evaluate(() => {
        const canvas = document.getElementById('pdf-canvas');
        return {
          width: canvas.width,
          height: canvas.height
        };
      });
      
      // Set viewport to match canvas
      await page.setViewport({
        width: canvasDimensions.width,
        height: canvasDimensions.height,
        deviceScaleFactor: 1
      });
      
      // Take screenshot of just the canvas
      const tempDir = path.join(__dirname, '../uploads/temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const imagePath = path.join(tempDir, `temp-ocr-${Date.now()}.png`);
      
      // Screenshot just the canvas element (no browser UI)
      const canvasElement = await page.$('#pdf-canvas');
      await canvasElement.screenshot({
        path: imagePath,
        type: 'png'
      });
      
      await browser.close();
      browser = null;

      console.log('✅ PDF converted to image:', imagePath);
      
      // Read image and use Google Vision documentTextDetection
      const imageBuffer = fs.readFileSync(imagePath);
      console.log('🔍 Running Google Vision OCR on converted image...');
      
      const [ocrResult] = await this.client.documentTextDetection({
        image: { content: imageBuffer }
      });

      const fullTextAnnotation = ocrResult?.fullTextAnnotation;
      
      if (!fullTextAnnotation || !fullTextAnnotation.pages || fullTextAnnotation.pages.length === 0) {
        console.warn('⚠️ No text detected in converted image');
        // Clean up
        try {
          if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
          if (tempPdfCreated && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
          if (browser) await browser.close();
        } catch (e) {}
        
        return {
          text: '',
          words: [],
          lines: [],
          blocks: [],
          confidence: 0,
          pdfWidth: 612,
          pdfHeight: 792
        };
      }

      // Process the results (same as before)
      const firstPage = fullTextAnnotation.pages[0];
      const pdfWidth = firstPage.width || 612;
      const pdfHeight = firstPage.height || 792;

      console.log(`📐 Image dimensions: ${pdfWidth} x ${pdfHeight} pixels`);
      
      const words = [];
      const lines = [];
      const blocks = [];

      // Process blocks, paragraphs, words (same logic as before)
      if (firstPage.blocks) {
        firstPage.blocks.forEach((block) => {
          if (block.paragraphs) {
            block.paragraphs.forEach((paragraph) => {
              if (paragraph.words) {
                paragraph.words.forEach((word) => {
                  const wordText = this.extractTextFromSymbols(word.symbols);
                  if (!wordText.trim()) return;

                  const boundingBox = word.boundingBox;
                  if (!boundingBox || !boundingBox.vertices || boundingBox.vertices.length < 4) return;

                  const vertices = boundingBox.vertices;
                  const x0 = vertices[0].x || 0;
                  const y0 = vertices[0].y || 0;
                  const x1 = vertices[2].x || vertices[1].x || x0;
                  const y1 = vertices[2].y || vertices[3].y || y0;

                  const wordHeight = Math.abs(y1 - y0);
                  const fontSize = Math.max(8, Math.min(24, wordHeight * 0.85));

                  words.push({
                    text: wordText,
                    bbox: { x0, y0, x1, y1 },
                    fontSize: fontSize,
                    confidence: word.confidence || 95
                  });
                });
              }
            });
          }
        });
      }

      // Group words into lines (same logic as before)
      const sortedWords = [...words].sort((a, b) => {
        const yDiff = Math.abs(a.bbox.y0 - b.bbox.y0);
        if (yDiff < 5) return a.bbox.x0 - b.bbox.x0;
        return a.bbox.y0 - b.bbox.y0;
      });

      let currentLine = [];
      let currentLineY = -1;
      const lineTolerance = 5;

      sortedWords.forEach((word) => {
        if (currentLineY === -1 || Math.abs(word.bbox.y0 - currentLineY) < lineTolerance) {
          currentLine.push(word);
          if (currentLineY === -1) currentLineY = word.bbox.y0;
        } else {
          if (currentLine.length > 0) {
            const lineText = currentLine.map(w => w.text).join(' ');
            const minX = Math.min(...currentLine.map(w => w.bbox.x0));
            const maxX = Math.max(...currentLine.map(w => w.bbox.x1));
            const minY = Math.min(...currentLine.map(w => w.bbox.y0));
            const maxY = Math.max(...currentLine.map(w => w.bbox.y1));
            const avgFontSize = currentLine.reduce((sum, w) => sum + (w.fontSize || 12), 0) / currentLine.length;
            const lineHeight = maxY - minY;

            let fontSize = avgFontSize;
            if (lineHeight > avgFontSize * 1.5) {
              const estimatedLines = Math.ceil(lineHeight / (avgFontSize * 1.2));
              fontSize = (lineHeight / estimatedLines) * 0.85;
              fontSize = Math.max(8, Math.min(24, fontSize));
            }

            lines.push({
              text: lineText,
              bbox: { x0: minX, y0: minY, x1: maxX, y1: maxY },
              fontSize: fontSize,
              fontFamily: 'Arial, sans-serif',
              confidence: currentLine.reduce((sum, w) => sum + (w.confidence || 95), 0) / currentLine.length
            });
          }
          currentLine = [word];
          currentLineY = word.bbox.y0;
        }
      });

      // Add last line
      if (currentLine.length > 0) {
        const lineText = currentLine.map(w => w.text).join(' ');
        const minX = Math.min(...currentLine.map(w => w.bbox.x0));
        const maxX = Math.max(...currentLine.map(w => w.bbox.x1));
        const minY = Math.min(...currentLine.map(w => w.bbox.y0));
        const maxY = Math.max(...currentLine.map(w => w.bbox.y1));
        const avgFontSize = currentLine.reduce((sum, w) => sum + (w.fontSize || 12), 0) / currentLine.length;
        const lineHeight = maxY - minY;

        let fontSize = avgFontSize;
        if (lineHeight > avgFontSize * 1.5) {
          const estimatedLines = Math.ceil(lineHeight / (avgFontSize * 1.2));
          fontSize = (lineHeight / estimatedLines) * 0.85;
          fontSize = Math.max(8, Math.min(24, fontSize));
        }

        lines.push({
          text: lineText,
          bbox: { x0: minX, y0: minY, x1: maxX, y1: maxY },
          fontSize: fontSize,
          fontFamily: 'Arial, sans-serif',
          confidence: currentLine.reduce((sum, w) => sum + (w.confidence || 95), 0) / currentLine.length
        });
      }
      
      // Clean up temp files
      try {
        if (fs.existsSync(result.path)) fs.unlinkSync(result.path);
        if (tempPdfCreated && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      } catch (cleanupError) {
        console.warn('Could not clean up temp files:', cleanupError.message);
      }

      console.log(`✅ Google Vision OCR completed: ${words.length} words, ${lines.length} lines`);

      return {
        text: fullTextAnnotation.text || '',
        words: words,
        lines: lines,
        blocks: blocks,
        confidence: firstPage.confidence || 95,
        pdfWidth: pdfWidth,
        pdfHeight: pdfHeight
      };
      
    } catch (error) {
      console.error('❌ PDF to image conversion or OCR failed:', error);
      // Clean up on error
      try {
        if (browser) {
          await browser.close();
        }
        if (tempPdfCreated && pdfPath && fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
      } catch (e) {}
      throw error;
    }
  }

  /**
   * Legacy method - kept for reference but not used
   * Direct PDF detection (may not work reliably)
   */
  async extractTextFromPdfDirect(pdfPathOrBuffer) {
    if (!this.isConfigured || !this.client) {
      throw new Error('Google Cloud Vision is not configured.');
    }

    let pdfBuffer = null;
    try {
      if (Buffer.isBuffer(pdfPathOrBuffer)) {
        pdfBuffer = pdfPathOrBuffer;
      } else {
        pdfBuffer = fs.readFileSync(pdfPathOrBuffer);
      }

      console.log('🔍 Starting Google Vision document text detection (direct PDF)...');
      
      const [result] = await this.client.documentTextDetection({
        image: { content: pdfBuffer }
      });

      const fullTextAnnotation = result?.fullTextAnnotation;
      
      if (!fullTextAnnotation || !fullTextAnnotation.pages || fullTextAnnotation.pages.length === 0) {
        throw new Error('No text detected in PDF');
      }

      // This method is kept for reference but extractTextFromPdf now uses image conversion
      // Processing logic would go here if needed
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Extract text from image using Google Cloud Vision API
   * @param {string|Buffer} imagePathOrBuffer - Path to image file or image buffer
   * @returns {Promise<Object>} OCR results
   */
  async extractTextFromImage(imagePathOrBuffer) {
    if (!this.isConfigured || !this.client) {
      throw new Error('Google Cloud Vision is not configured. Please set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_CREDENTIALS_JSON in your .env file.');
    }

    let imageBuffer = null;

    try {
      if (Buffer.isBuffer(imagePathOrBuffer)) {
        imageBuffer = imagePathOrBuffer;
      } else {
        imageBuffer = fs.readFileSync(imagePathOrBuffer);
      }

      console.log('🔍 Starting Google Vision text detection on image...');
      
      const [result] = await this.client.textDetection({
        image: { content: imageBuffer }
      });

      const detections = result.textAnnotations || [];
      
      if (detections.length === 0) {
        return {
          text: '',
          words: [],
          lines: [],
          confidence: 0
        };
      }

      // First detection is the full text
      const fullText = detections[0].description || '';
      
      // Remaining detections are individual words/phrases
      const words = detections.slice(1).map(detection => {
        const vertices = detection.boundingPoly.vertices;
        const x0 = Math.min(...vertices.map(v => v.x || 0));
        const y0 = Math.min(...vertices.map(v => v.y || 0));
        const x1 = Math.max(...vertices.map(v => v.x || 0));
        const y1 = Math.max(...vertices.map(v => v.y || 0));

        return {
          text: detection.description || '',
          bbox: {
            x0: x0,
            y0: y0,
            x1: x1,
            y1: y1
          },
          confidence: detection.confidence || 95
        };
      });

      return {
        text: fullText,
        words: words,
        lines: words, // For images, words are treated as lines
        confidence: 95
      };

    } catch (error) {
      console.error('❌ Google Vision OCR error:', error);
      throw error;
    }
  }

  /**
   * Extract text from word symbols
   * @private
   */
  extractTextFromSymbols(symbols) {
    if (!symbols || !Array.isArray(symbols)) return '';
    return symbols.map(symbol => symbol.text || '').join('');
  }
}

module.exports = new GoogleVisionOcrService();
