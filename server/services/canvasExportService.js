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

  // Generate HTML for multiple canvas pages (for multi-page PDF)
  generateMultiPageCanvasHTML(pagesData) {
    const pages = Array.isArray(pagesData) ? pagesData : [pagesData];
    const pagesHtml = pages.map((canvasData, i) => {
      const canvasDataJson = JSON.stringify(canvasData).replace(/</g, '\\u003c');
      const isLast = i === pages.length - 1;
      return `
    <div class="page-wrapper" style="page-break-after: ${isLast ? 'auto' : 'always'}; margin-bottom: ${isLast ? '0' : '20px'};">
      <div id="canvas-container-${i}" class="canvas-page"></div>
    </div>
    <script>
      (async function() {
        try {
          const canvasData = ${canvasDataJson};
          const container = document.getElementById('canvas-container-${i}');
          const width = canvasData.width || 800;
          const height = canvasData.height || 1000;
          const canvasEl = document.createElement('canvas');
          canvasEl.width = width;
          canvasEl.height = height;
          container.appendChild(canvasEl);
          const canvas = new fabric.Canvas(canvasEl, { width, height, backgroundColor: 'white' });
          await new Promise((resolve) => {
            canvas.loadFromJSON(canvasData, () => {
              canvas.renderAll();
              setTimeout(() => { window.canvasReady_${i} = true; resolve(); }, 500);
            });
          });
        } catch (e) { window.canvasReady_${i} = true; }
      })();
    <\/script>`;
    }).join('\n');
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; background: white; font-family: Arial, sans-serif; }
    .page-wrapper { display: flex; justify-content: center; align-items: flex-start; }
    canvas { display: block; }
    @media print { body { margin: 0; padding: 0; } .page-wrapper { page-break-after: always; } .page-wrapper:last-child { page-break-after: auto; } }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
</head>
<body>
  ${pagesHtml}
  <script>
    (function checkReady() {
      const total = ${pages.length};
      let ready = 0;
      for (let i = 0; i < total; i++) { if (window['canvasReady_' + i]) ready++; }
      if (ready === total) window.allCanvasesReady = true;
      else setTimeout(checkReady, 100);
    })();
  </script>
</body>
</html>`;
  }

  // Generate PDF from canvas data (single page or array of pages)
  async generatePdfFromCanvas(canvasData) {
    const isMultiPage = Array.isArray(canvasData) && canvasData.length > 1;
    if (isMultiPage) {
      return this.generatePdfFromCanvasMultiPage(canvasData);
    }
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
      let pdfBuffer = await page.pdf({
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
      
      // Ensure pdfBuffer is a Buffer (puppeteer may return Uint8Array)
      if (!Buffer.isBuffer(pdfBuffer)) {
        pdfBuffer = Buffer.from(pdfBuffer);
      }
      
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

  async generatePdfFromCanvasMultiPage(pagesData) {
    let browser = null;
    try {
      const html = this.generateMultiPageCanvasHTML(pagesData);
      const tempHtmlPath = path.join(this.tempPath, `canvas-export-multi-${uuidv4()}.html`);
      fs.writeFileSync(tempHtmlPath, html);
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--disable-gpu']
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
      await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
      await page.waitForFunction(() => window.allCanvasesReady === true, { timeout: 15000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.evaluateHandle('document.fonts.ready');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0.25in', right: '0.25in', bottom: '0.25in', left: '0.25in' },
        preferCSSPageSize: false,
        displayHeaderFooter: false
      });
      fs.unlinkSync(tempHtmlPath);
      return {
        success: true,
        pdfBuffer: Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer),
        size: (Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer)).length
      };
    } catch (error) {
      console.error('Error generating multi-page PDF:', error);
      return { success: false, error: error.message };
    } finally {
      if (browser) await browser.close();
    }
  }

  // Generate PNG from canvas data (single page or first page of array)
  async generatePngFromCanvas(canvasData) {
    const data = Array.isArray(canvasData) ? canvasData[0] : canvasData;
    if (!data) return { success: false, error: 'No canvas data' };
    let browser = null;
    
    try {
      // Generate HTML
      const html = this.generateCanvasHTML(data);
      
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
      const width = data.width || 800;
      const height = data.height || 1000;
      
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
      let pngBuffer = await canvas.screenshot({
        type: 'png',
        omitBackground: false
      });
      
      // Ensure pngBuffer is a Buffer (puppeteer may return Uint8Array)
      if (!Buffer.isBuffer(pngBuffer)) {
        pngBuffer = Buffer.from(pngBuffer);
      }
      
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

