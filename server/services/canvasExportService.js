const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CanvasExportService {
  constructor() {
    this.tempPath = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempPath)) {
      fs.mkdirSync(this.tempPath, { recursive: true });
    }
  }

  // Generate HTML page that renders Fabric.js canvas
  generateCanvasHTML(canvasData) {
    // Escape the JSON to prevent XSS
    const canvasDataJson = JSON.stringify(canvasData).replace(/</g, '\\u003c');
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background: white;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      font-family: Arial, sans-serif;
      width: 100%;
      min-height: 100vh;
    }
    #canvas-container {
      background: white;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    canvas {
      display: block;
      max-width: 100%;
      height: auto;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      #canvas-container {
        margin: 0;
        padding: 0;
      }
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <script>
    (async function() {
      try {
        const canvasData = ${canvasDataJson};
        const container = document.getElementById('canvas-container');
        
        // Get canvas dimensions
        const width = canvasData.width || 800;
        const height = canvasData.height || 1000;
        
        // Create canvas element
        const canvasEl = document.createElement('canvas');
        canvasEl.width = width;
        canvasEl.height = height;
        container.appendChild(canvasEl);
        
        // Initialize Fabric.js canvas
        const canvas = new fabric.Canvas(canvasEl, {
          width: width,
          height: height,
          backgroundColor: 'white'
        });
        
        // Load canvas data
        await new Promise((resolve, reject) => {
          try {
            canvas.loadFromJSON(canvasData, () => {
              canvas.renderAll();
              // Wait a bit for fonts/images to load
              setTimeout(() => {
                window.canvasReady = true;
                resolve();
              }, 500);
            }, (error) => {
              console.error('Error loading canvas:', error);
              window.canvasReady = true; // Still signal ready to avoid hanging
              resolve();
            });
          } catch (error) {
            console.error('Error in loadFromJSON:', error);
            window.canvasReady = true;
            resolve();
          }
        });
      } catch (error) {
        console.error('Error initializing canvas:', error);
        window.canvasReady = true;
      }
    })();
  </script>
</body>
</html>
    `;
  }

  // Generate PDF from canvas data
  async generatePdfFromCanvas(canvasData) {
    let browser = null;
    
    try {
      // Generate HTML
      const html = this.generateCanvasHTML(canvasData);
      
      // Save HTML to temp file
      const tempHtmlPath = path.join(this.tempPath, `canvas-export-${uuidv4()}.html`);
      fs.writeFileSync(tempHtmlPath, html);
      
      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set viewport to A4 size for better PDF rendering
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      });
      
      // Load HTML
      await page.goto(`file://${tempHtmlPath}`, {
        waitUntil: 'networkidle0'
      });
      
      // Wait for canvas to be ready
      await page.waitForFunction(() => window.canvasReady === true, { timeout: 10000 });
      
      // Wait a bit more for rendering and fonts to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Wait for fonts to be ready
      await page.evaluateHandle('document.fonts.ready');
      
      // Generate PDF using A4 format (more reliable than custom dimensions)
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.25in',
          right: '0.25in',
          bottom: '0.25in',
          left: '0.25in'
        },
        preferCSSPageSize: false,
        displayHeaderFooter: false
      });
      
      // Clean up temp file
      fs.unlinkSync(tempHtmlPath);
      
      return {
        success: true,
        pdfBuffer,
        size: pdfBuffer.length
      };
    } catch (error) {
      console.error('Error generating PDF from canvas:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Generate PNG from canvas data
  async generatePngFromCanvas(canvasData) {
    let browser = null;
    
    try {
      // Generate HTML
      const html = this.generateCanvasHTML(canvasData);
      
      // Save HTML to temp file
      const tempHtmlPath = path.join(this.tempPath, `canvas-export-${uuidv4()}.html`);
      fs.writeFileSync(tempHtmlPath, html);
      
      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set viewport to match canvas size
      const width = canvasData.width || 800;
      const height = canvasData.height || 1000;
      
      await page.setViewport({
        width: width,
        height: height,
        deviceScaleFactor: 2
      });
      
      // Load HTML
      await page.goto(`file://${tempHtmlPath}`, {
        waitUntil: 'networkidle0'
      });
      
      // Wait for canvas to be ready
      await page.waitForFunction(() => window.canvasReady === true, { timeout: 10000 });
      
      // Wait a bit more for rendering (using Promise-based delay)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take screenshot
      const canvas = await page.$('canvas');
      const pngBuffer = await canvas.screenshot({
        type: 'png',
        omitBackground: false
      });
      
      // Clean up temp file
      fs.unlinkSync(tempHtmlPath);
      
      return {
        success: true,
        pngBuffer,
        size: pngBuffer.length
      };
    } catch (error) {
      console.error('Error generating PNG from canvas:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Generate Word/HTML from canvas data
  async generateWordFromCanvas(canvasData) {
    // For Word export, we'll generate an HTML file that can be opened in Word
    const html = this.generateCanvasHTML(canvasData);
    
    return {
      success: true,
      html: html,
      size: html.length
    };
  }
}

module.exports = new CanvasExportService();

