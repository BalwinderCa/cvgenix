const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

class AdobeOcrService {
  constructor() {
    // Don't cache credentials - read them dynamically each time
    // This allows the service to pick up changes without restarting the server
    console.log('🔧 Adobe OCR Service initialized (credentials will be read dynamically)');
  }

  /**
   * Get credentials from environment variables (read dynamically)
   */
  getCredentials() {
    return {
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET,
      organizationId: process.env.ADOBE_ORGANIZATION_ID,
      accountId: process.env.ADOBE_ACCOUNT_ID,
      privateKeyPath: process.env.ADOBE_PRIVATE_KEY_PATH,
      privateKey: process.env.ADOBE_PRIVATE_KEY
    };
  }

  /**
   * Check if credentials are valid and configured
   */
  get isConfigured() {
    const creds = this.getCredentials();
    return this.validateCredentials(creds).isValid;
  }

  /**
   * Check if using OAuth authentication
   */
  get useOAuth() {
    const creds = this.getCredentials();
    const validation = this.validateCredentials(creds);
    return validation.isValid && !creds.privateKey && !creds.privateKeyPath;
  }

  /**
   * Validate credentials and check for placeholders
   */
  validateCredentials(creds) {
    const placeholderPatterns = [
      'your-adobe-client-id',
      'your-adobe-client-secret',
      'your-adobe-organization-id',
      'your-adobe-account-id'
    ];
    
    const isPlaceholder = (value) => {
      if (!value) return false;
      const trimmed = String(value).trim().toLowerCase();
      return placeholderPatterns.some(pattern => trimmed.includes(pattern));
    };
    
    const hasValidClientId = creds.clientId && 
                             String(creds.clientId).trim().length > 0 && 
                             !isPlaceholder(creds.clientId);
    const hasValidClientSecret = creds.clientSecret && 
                                 String(creds.clientSecret).trim().length > 0 && 
                                 !isPlaceholder(creds.clientSecret);
    
    return {
      isValid: hasValidClientId && hasValidClientSecret,
      hasValidClientId,
      hasValidClientSecret
    };
  }

  /**
   * Extract text from PDF using Adobe OCR
   * @param {string|Buffer} pdfPathOrBuffer - Path to PDF file or PDF buffer
   * @returns {Promise<Object>} OCR results with text, words, and lines
   */
  async extractTextFromPdf(pdfPathOrBuffer) {
    // Read credentials dynamically
    const creds = this.getCredentials();
    const validation = this.validateCredentials(creds);
    
    if (!validation.isValid) {
      console.log('🔧 Adobe OCR Service check:');
      console.log('  - Client ID:', creds.clientId ? `${String(creds.clientId).trim().substring(0, 8)}...` : 'NOT SET');
      console.log('  - Client Secret:', creds.clientSecret ? 'SET' : 'NOT SET');
      console.log('  - Is Configured:', false);
      throw new Error('Adobe PDF Services credentials not configured. Please set ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in your .env file.');
    }

    let tempPdfPath = null;
    let pdfBuffer = null;

    try {
      // Handle both file path and buffer
      if (Buffer.isBuffer(pdfPathOrBuffer)) {
        pdfBuffer = pdfPathOrBuffer;
        // Save buffer to temp file for Adobe SDK
        tempPdfPath = path.join(__dirname, '../uploads/temp', `temp-${Date.now()}.pdf`);
        const tempDir = path.dirname(tempPdfPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        fs.writeFileSync(tempPdfPath, pdfBuffer);
      } else {
        tempPdfPath = pdfPathOrBuffer;
      }

      // Set up credentials - use OAuth if no private key, otherwise use Service Account
      let credentials;
      const useOAuth = !creds.privateKey && !creds.privateKeyPath;
      
      if (useOAuth) {
        // OAuth Server-to-Server authentication (Client ID + Secret only)
        // Use ServicePrincipalCredentials for OAuth authentication
        console.log('🔐 Using OAuth authentication with ServicePrincipalCredentials');
        
        // Trim whitespace in case there's any
        const trimmedClientId = String(creds.clientId || '').trim();
        const trimmedClientSecret = String(creds.clientSecret || '').trim();
        
        if (!trimmedClientId || !trimmedClientSecret) {
          throw new Error('Adobe PDF Services credentials are empty. Please set valid ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET values in your .env file.');
        }
        
        console.log(`✅ Creating ServicePrincipalCredentials with clientId: ${trimmedClientId.substring(0, 8)}... (length: ${trimmedClientId.length})`);
        console.log(`🔍 Client Secret length: ${trimmedClientSecret.length}`);
        try {
          // ServicePrincipalCredentials expects an object with clientId and clientSecret properties
          credentials = new PDFServicesSdk.ServicePrincipalCredentials({
            clientId: trimmedClientId,
            clientSecret: trimmedClientSecret
          });
          console.log(`✅ ServicePrincipalCredentials created successfully`);
        } catch (credError) {
          // Log the full error details for debugging
          console.error('❌ Adobe SDK Error Details:');
          console.error('  - Error message:', credError.message);
          console.error('  - Error name:', credError.name);
          console.error('  - Error stack:', credError.stack);
          console.error('  - Client ID (first 8 chars):', trimmedClientId.substring(0, 8));
          console.error('  - Client ID length:', trimmedClientId.length);
          console.error('  - Client Secret length:', trimmedClientSecret.length);
          
          // Catch Adobe SDK errors and provide clearer messages
          if (credError.message && credError.message.includes('Client ID')) {
            throw new Error(`Adobe PDF Services Client ID is invalid or empty: ${credError.message}. Please check your ADOBE_CLIENT_ID in the .env file.`);
          }
          if (credError.message && credError.message.includes('Client Secret')) {
            throw new Error(`Adobe PDF Services Client Secret is invalid or empty: ${credError.message}. Please check your ADOBE_CLIENT_SECRET in the .env file.`);
          }
          throw new Error(`Failed to initialize Adobe PDF Services credentials: ${credError.message || credError.toString()}`);
        }
      } else {
        // Service Account authentication (requires private key)
        credentials = PDFServicesSdk.Credentials
          .serviceAccountCredentialsBuilder()
          .withClientId(creds.clientId)
          .withClientSecret(creds.clientSecret)
          .withPrivateKey(this.getPrivateKey(creds))
          .withOrganizationId(creds.organizationId)
          .withAccountId(creds.accountId)
          .build();
      }

      // Create PDFServices instance with credentials (v4.x API)
      const pdfServices = new PDFServicesSdk.PDFServices({ credentials });

      // Upload the PDF file
      console.log('📤 Uploading PDF to Adobe PDF Services...');
      const readStream = fs.createReadStream(tempPdfPath);
      const inputAsset = await pdfServices.upload({
        readStream,
        mimeType: PDFServicesSdk.MimeType.PDF
      });
      console.log('✅ PDF uploaded successfully');

      // Create ExtractPDF parameters - extract text elements
      const extractParams = new PDFServicesSdk.ExtractPDFParams({
        elementsToExtract: [PDFServicesSdk.ExtractElementType.TEXT]
      });

      // Create ExtractPDF job
      const extractJob = new PDFServicesSdk.ExtractPDFJob({
        inputAsset,
        params: extractParams
      });

      // Submit the job
      console.log('🔍 Starting Adobe ExtractPDF extraction...');
      const pollingURL = await pdfServices.submit({ job: extractJob });
      console.log('✅ Job submitted, polling URL:', pollingURL);

      // Poll for job completion and get result
      const pdfServicesResponse = await pdfServices.getJobResult({
        pollingURL,
        resultType: PDFServicesSdk.ExtractPDFResult
      });

      // Get the result content
      const resultAsset = pdfServicesResponse.result.resource;
      const streamAsset = await pdfServices.getContent({ asset: resultAsset });

      // Read the result from the stream (Adobe returns a ZIP file containing the JSON)
      const chunks = [];
      for await (const chunk of streamAsset.readStream) {
        chunks.push(chunk);
      }
      const resultBuffer = Buffer.concat(chunks);
      
      // Check if the result is a ZIP file (Adobe ExtractPDF returns results in ZIP format)
      let resultData;
      if (streamAsset.mimeType === 'application/zip' || resultBuffer[0] === 0x50 && resultBuffer[1] === 0x4B) {
        // Extract ZIP file
        console.log('📦 Extracting ZIP file from Adobe ExtractPDF result...');
        const zip = new AdmZip(resultBuffer);
        const zipEntries = zip.getEntries();
        
        // Find the JSON file in the ZIP (usually named "structuredData.json" or similar)
        const jsonEntry = zipEntries.find(entry => 
          entry.entryName.endsWith('.json') || 
          entry.entryName.includes('structuredData') ||
          entry.entryName.includes('extract')
        );
        
        if (!jsonEntry) {
          // If no JSON file found, try the first entry
          const firstEntry = zipEntries[0];
          if (firstEntry) {
            console.log(`📄 Using ZIP entry: ${firstEntry.entryName}`);
            resultData = JSON.parse(zip.readAsText(firstEntry));
          } else {
            throw new Error('No JSON file found in ZIP archive from Adobe ExtractPDF');
          }
        } else {
          console.log(`📄 Extracting JSON from ZIP entry: ${jsonEntry.entryName}`);
          resultData = JSON.parse(zip.readAsText(jsonEntry));
        }
      } else {
        // Not a ZIP file, parse directly as JSON
        resultData = JSON.parse(resultBuffer.toString('utf8'));
      }
      
      console.log(`📊 Adobe ExtractPDF returned ${resultData.elements?.length || 0} elements`);

      // Clean up temp files
      try {
        if (tempPdfPath && fs.existsSync(tempPdfPath) && Buffer.isBuffer(pdfPathOrBuffer)) {
          fs.unlinkSync(tempPdfPath);
        }
      } catch (cleanupError) {
        console.warn('Could not clean up temp files:', cleanupError.message);
      }

      // Get PDF page dimensions from result if available
      const pdfWidth = resultData.document?.pageWidth || 612; // Default to letter width (8.5 inches * 72 DPI)
      const pdfHeight = resultData.document?.pageHeight || 792; // Default to letter height (11 inches * 72 DPI)
      
      console.log(`📐 PDF dimensions: ${pdfWidth} x ${pdfHeight} points`);
      
      // Convert Adobe ExtractPDF result to our format
      const result = this.convertAdobeResultToStandardFormat(resultData, pdfWidth, pdfHeight);
      
      // Add PDF dimensions to result for frontend scaling
      result.pdfWidth = pdfWidth;
      result.pdfHeight = pdfHeight;
      
      return result;

    } catch (error) {
      // Clean up on error
      if (tempPdfPath && fs.existsSync(tempPdfPath) && Buffer.isBuffer(pdfPathOrBuffer)) {
        try {
          fs.unlinkSync(tempPdfPath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  /**
   * Extract text from image using Adobe OCR (via PDF conversion)
   * @param {string|Buffer} imagePathOrBuffer - Path to image file or image buffer
   * @returns {Promise<Object>} OCR results
   */
  async extractTextFromImage(imagePathOrBuffer) {
    // Adobe PDF Services doesn't directly support images
    // We need to convert image to PDF first, then run OCR
    // For now, we'll throw an error and suggest using PDF
    throw new Error('Adobe OCR currently supports PDF files only. Please convert your image to PDF first, or use Tesseract for direct image OCR.');
  }

  /**
   * Get private key from file or environment variable
   * Only needed for Service Account authentication
   */
  getPrivateKey(creds = null) {
    const credentials = creds || this.getCredentials();
    if (credentials.privateKey) {
      // Private key from environment variable (for production)
      return credentials.privateKey.replace(/\\n/g, '\n');
    } else if (credentials.privateKeyPath) {
      // Private key from file path
      if (!fs.existsSync(credentials.privateKeyPath)) {
        throw new Error(`Adobe private key file not found: ${credentials.privateKeyPath}`);
      }
      return fs.readFileSync(credentials.privateKeyPath, 'utf8');
    } else {
      throw new Error('Adobe private key not configured. Set ADOBE_PRIVATE_KEY or ADOBE_PRIVATE_KEY_PATH in .env');
    }
  }

  /**
   * Convert Adobe ExtractPDF result to standard format
   * Adobe returns: { elements: [{ Text: "...", Bounds: [x0, y0, x1, y1], FontSize: 16 }] }
   * Note: PDF coordinates start from bottom-left, need to flip Y
   */
  convertAdobeResultToStandardFormat(adobeResult, pdfWidth = 612, pdfHeight = 792) {
    // Adobe ExtractPDF returns elements with Text, Bounds array, and FontSize
    const words = [];
    const lines = [];
    let fullText = '';

    if (!adobeResult.elements || !Array.isArray(adobeResult.elements)) {
      console.warn('⚠️ Adobe result has no elements array');
      return {
        text: '',
        words: [],
        lines: [],
        confidence: 0
      };
    }

    // Get PDF height from result if available, otherwise use default
    const canvasHeight = adobeResult.document?.pageHeight || pdfHeight;
    console.log(`📐 PDF Height: ${canvasHeight}, Processing ${adobeResult.elements.length} elements`);

    // Process each element and collect words
    adobeResult.elements.forEach((element, index) => {
      // Check if this is a text element
      if (element.Text && element.Bounds && Array.isArray(element.Bounds) && element.Bounds.length >= 4) {
        const text = element.Text.trim();
        if (!text) return;

        // Bounds format: [x0, y0, x1, y1] where coordinates are from bottom-left origin
        const [x0, y0Bottom, x1, y1Bottom] = element.Bounds;
        
        // Flip Y coordinates: PDF uses bottom-left origin, canvas uses top-left
        // y0Bottom is the bottom Y coordinate, y1Bottom is the top Y coordinate (higher Y value)
        const y0 = canvasHeight - y1Bottom; // Top of text box (smaller Y in canvas coords)
        const y1 = canvasHeight - y0Bottom; // Bottom of text box (larger Y in canvas coords)
        
        // Calculate font size from height if not provided
        const fontSize = element.FontSize || Math.max(12, y1 - y0);
        const fontFamily = element.Font || 'Arial, sans-serif';

        // Skip if bounding box is invalid (width or height is 0 or negative)
        if (x1 <= x0 || y1 <= y0) {
          console.warn(`⚠️ Skipping element ${index} with invalid bounds: [${x0}, ${y0}, ${x1}, ${y1}]`);
          return;
        }

        fullText += text + ' ';

        words.push({
          text: text,
          bbox: {
            x0: x0,
            y0: y0,
            x1: x1,
            y1: y1,
          },
          fontSize: fontSize,
          fontFamily: fontFamily,
          confidence: 95 // Adobe doesn't provide confidence, assume high
        });
      }
    });

    console.log(`📝 Extracted ${words.length} words from PDF`);

    // Remove duplicate/overlapping words (same text at same position)
    const uniqueWords = [];
    const seenPositions = new Set();
    
    words.forEach((word) => {
      const positionKey = `${Math.round(word.bbox.x0)}_${Math.round(word.bbox.y0)}_${word.text}`;
      if (!seenPositions.has(positionKey)) {
        seenPositions.add(positionKey);
        uniqueWords.push(word);
      }
    });

    console.log(`🔍 Deduplicated to ${uniqueWords.length} unique words`);

    // Group words into lines based on Y position with better tolerance
    // Sort words by Y position (top to bottom), then X position (left to right)
    const sortedWords = [...uniqueWords].sort((a, b) => {
      // First sort by Y position (with tolerance for same line)
      const yDiff = Math.abs(a.bbox.y0 - b.bbox.y0);
      const avgHeight = (Math.abs(a.bbox.y1 - a.bbox.y0) + Math.abs(b.bbox.y1 - b.bbox.y0)) / 2;
      const lineTolerance = Math.max(avgHeight * 0.3, 3); // Dynamic tolerance based on font size
      
      if (yDiff < lineTolerance) {
        // Same line, sort by X position
        return a.bbox.x0 - b.bbox.x0;
      }
      // Different lines, sort by Y position
      return a.bbox.y0 - b.bbox.y0;
    });

    // Group words into lines with improved logic
    let currentLine = [];
    let currentLineY = -1;
    let currentLineHeight = 0;

    sortedWords.forEach((word, index) => {
      const wordHeight = Math.abs(word.bbox.y1 - word.bbox.y0);
      const avgHeight = currentLine.length > 0 
        ? (currentLineHeight + wordHeight) / 2 
        : wordHeight;
      const lineTolerance = Math.max(avgHeight * 0.4, 5); // More generous tolerance
      
      const wordCenterY = word.bbox.y0 + wordHeight / 2;
      const lineCenterY = currentLineY + currentLineHeight / 2;
      
      if (currentLineY === -1 || Math.abs(wordCenterY - lineCenterY) < lineTolerance) {
        // Same line
        currentLine.push(word);
        if (currentLineY === -1) {
          currentLineY = word.bbox.y0;
          currentLineHeight = wordHeight;
        } else {
          // Update line bounds
          currentLineY = Math.min(currentLineY, word.bbox.y0);
          currentLineHeight = Math.max(
            currentLineHeight,
            Math.max(...currentLine.map(w => w.bbox.y1)) - currentLineY
          );
        }
      } else {
        // Finish current line
        if (currentLine.length > 0) {
          const lineText = currentLine.map(w => w.text).join(' ');
          const minX = Math.min(...currentLine.map(w => w.bbox.x0));
          const maxX = Math.max(...currentLine.map(w => w.bbox.x1));
          const minY = Math.min(...currentLine.map(w => w.bbox.y0));
          const maxY = Math.max(...currentLine.map(w => w.bbox.y1));
          
          // Calculate line height
          const lineHeight = maxY - minY;
          
          // Calculate font size more accurately
          // Don't just average word font sizes - they might be wrong for multi-line text
          // Instead, calculate from line height and estimated number of lines
          const avgWordFontSize = currentLine.reduce((sum, w) => sum + (w.fontSize || 12), 0) / currentLine.length;
          
          // If avgFontSize is suspiciously large (close to lineHeight), it's likely wrong
          // Estimate actual font size based on line height
          let fontSize;
          if (avgWordFontSize > lineHeight * 0.85) {
            // Suspiciously large - calculate from line height
            // Estimate lines: if text is long and width is limited, it's likely multi-line
            const textWidth = maxX - minX;
            const estimatedCharWidth = lineHeight * 0.5; // Rough estimate
            const estimatedCharsPerLine = Math.max(10, Math.floor(textWidth / estimatedCharWidth));
            const estimatedLines = Math.max(1, Math.ceil(lineText.length / estimatedCharsPerLine));
            
            fontSize = (lineHeight / estimatedLines) * 0.85;
            fontSize = Math.max(8, Math.min(24, fontSize));
            
            console.log(`🔧 Fixed line fontSize: "${lineText.substring(0, 40)}" - avgWordSize: ${avgWordFontSize.toFixed(1)}px, lineHeight: ${lineHeight.toFixed(1)}, estimatedLines: ${estimatedLines}, final: ${fontSize.toFixed(1)}px`);
          } else {
            // Use average word font size if it seems reasonable
            fontSize = Math.max(8, Math.min(24, avgWordFontSize));
          }
          
          lines.push({
            text: lineText,
            bbox: {
              x0: minX,
              y0: minY,
              x1: maxX,
              y1: maxY,
            },
            fontSize: fontSize,
            fontFamily: currentLine[0].fontFamily || 'Arial, sans-serif'
          });
        }
        // Start new line
        currentLine = [word];
        currentLineY = word.bbox.y0;
        currentLineHeight = wordHeight;
      }
    });

    // Add last line
    if (currentLine.length > 0) {
      const lineText = currentLine.map(w => w.text).join(' ');
      const minX = Math.min(...currentLine.map(w => w.bbox.x0));
      const maxX = Math.max(...currentLine.map(w => w.bbox.x1));
      const minY = Math.min(...currentLine.map(w => w.bbox.y0));
      const maxY = Math.max(...currentLine.map(w => w.bbox.y1));
      
      // Calculate line height
      const lineHeight = maxY - minY;
      
      // Calculate font size more accurately (same logic as above)
      const avgWordFontSize = currentLine.reduce((sum, w) => sum + (w.fontSize || 12), 0) / currentLine.length;
      
      let fontSize;
      if (avgWordFontSize > lineHeight * 0.85) {
        // Suspiciously large - calculate from line height
        const textWidth = maxX - minX;
        const estimatedCharWidth = lineHeight * 0.5;
        const estimatedCharsPerLine = Math.max(10, Math.floor(textWidth / estimatedCharWidth));
        const estimatedLines = Math.max(1, Math.ceil(lineText.length / estimatedCharsPerLine));
        
        fontSize = (lineHeight / estimatedLines) * 0.85;
        fontSize = Math.max(8, Math.min(24, fontSize));
        
        console.log(`🔧 Fixed last line fontSize: "${lineText.substring(0, 40)}" - avgWordSize: ${avgWordFontSize.toFixed(1)}px, lineHeight: ${lineHeight.toFixed(1)}, estimatedLines: ${estimatedLines}, final: ${fontSize.toFixed(1)}px`);
      } else {
        fontSize = Math.max(8, Math.min(24, avgWordFontSize));
      }
      
      lines.push({
        text: lineText,
        bbox: {
          x0: minX,
          y0: minY,
          x1: maxX,
          y1: maxY,
        },
        fontSize: fontSize,
        fontFamily: currentLine[0].fontFamily || 'Arial, sans-serif'
      });
    }

    // Remove overlapping lines (keep the one with more text or better position)
    const deduplicatedLines = [];
    lines.forEach((line) => {
      const overlap = deduplicatedLines.find(existing => {
        const xOverlap = !(line.bbox.x1 < existing.bbox.x0 || line.bbox.x0 > existing.bbox.x1);
        const yOverlap = !(line.bbox.y1 < existing.bbox.y0 || line.bbox.y0 > existing.bbox.y1);
        return xOverlap && yOverlap;
      });
      
      if (!overlap) {
        deduplicatedLines.push(line);
      } else {
        // If overlapping, keep the one with more text or better position
        if (line.text.length > overlap.text.length || 
            (line.text.length === overlap.text.length && line.bbox.y0 < overlap.bbox.y0)) {
          const index = deduplicatedLines.indexOf(overlap);
          deduplicatedLines[index] = line;
        }
      }
    });

    console.log(`✅ Converted ${words.length} words into ${deduplicatedLines.length} lines (removed ${lines.length - deduplicatedLines.length} overlapping)`);

    return {
      text: fullText.trim(),
      words: uniqueWords,
      lines: deduplicatedLines,
      confidence: 95 // Adobe doesn't provide per-word confidence
    };
  }
}

module.exports = new AdobeOcrService();
