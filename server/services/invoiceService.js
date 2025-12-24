const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const User = require('../models/User');

class InvoiceService {
  constructor() {
    this.tempPath = path.join(__dirname, '../temp');
    this.ensureTempDir();
    this.registerHandlebarsHelpers();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempPath)) {
      fs.mkdirSync(this.tempPath, { recursive: true });
    }
  }

  registerHandlebarsHelpers() {
    // Helper for formatting dates
    handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    });

    // Helper for formatting currency
    handlebars.registerHelper('formatCurrency', function(amount, currency) {
      if (amount === null || amount === undefined || amount === '') {
        console.warn('⚠️ formatCurrency received invalid amount:', amount);
        return '$0.00';
      }
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        console.warn('⚠️ formatCurrency could not parse amount:', amount);
        return '$0.00';
      }
      const currencySymbol = currency === 'USD' ? '$' : currency;
      return `${currencySymbol}${numAmount.toFixed(2)}`;
    });

    // Helper for invoice number
    handlebars.registerHelper('formatInvoiceNumber', function(paymentId) {
      if (!paymentId) return 'N/A';
      // Use last 8 characters of payment ID for invoice number
      return `INV-${paymentId.slice(-8).toUpperCase()}`;
    });
  }

  // Generate invoice HTML
  generateInvoiceHTML(payment, user) {
    // Convert payment to plain object first
    const paymentObj = payment.toObject ? payment.toObject() : payment;
    
    // Generate invoice number from payment ID (use _id if stripePaymentId is missing)
    const paymentIdForInvoice = paymentObj.stripePaymentId || paymentObj._id?.toString() || 'UNKNOWN';
    const invoiceNumber = paymentIdForInvoice.length >= 8 
      ? `INV-${paymentIdForInvoice.slice(-8).toUpperCase().replace(/[^A-Z0-9]/g, '')}`
      : `INV-${paymentIdForInvoice.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
    
    const paymentDate = new Date(paymentObj.paymentDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Log payment data for debugging
    console.log('📄 Generating invoice HTML:', {
      paymentId: paymentObj._id,
      stripePaymentId: paymentObj.stripePaymentId,
      amount: paymentObj.amount,
      amountType: typeof paymentObj.amount,
      currency: paymentObj.currency,
      description: paymentObj.description,
      credits: paymentObj.credits
    });

    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice {{invoiceNumber}}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 40px 20px;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .invoice-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .invoice-header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .invoice-header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .invoice-body {
      padding: 40px;
    }
    
    .invoice-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    
    .info-section h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 15px;
      letter-spacing: 1px;
    }
    
    .info-section p {
      margin: 5px 0;
      color: #333;
    }
    
    .invoice-number {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      margin: 10px 0;
    }
    
    .invoice-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      border-bottom: 1px solid #e9ecef;
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    
    .detail-value {
      color: #333;
      font-weight: 500;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table thead {
      background: #f8f9fa;
    }
    
    .items-table th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 1px;
    }
    
    .items-table td {
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .total-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      text-align: right;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      font-size: 16px;
    }
    
    .total-amount {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
      margin-top: 10px;
    }
    
    .invoice-footer {
      padding: 30px 40px;
      background: #f8f9fa;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-paid {
      background: #d4edda;
      color: #155724;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      
      .invoice-container {
        box-shadow: none;
        border-radius: 0;
        max-width: 100%;
      }
      
      .invoice-header {
        padding: 25px 20px;
      }
      
      .invoice-header h1 {
        font-size: 30px;
        margin-bottom: 8px;
      }
      
      .invoice-header p {
        font-size: 13px;
      }
      
      .invoice-body {
        padding: 25px 20px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .invoice-info {
        gap: 25px;
        margin-bottom: 25px;
      }
      
      .info-section h3 {
        font-size: 13px;
        margin-bottom: 12px;
      }
      
      .info-section p {
        font-size: 14px;
        margin: 4px 0;
      }
      
      .invoice-number {
        font-size: 22px;
        margin: 8px 0;
      }
      
      .invoice-details {
        padding: 18px;
        margin-bottom: 20px;
      }
      
      .detail-row {
        padding: 12px 0;
        font-size: 14px;
      }
      
      .items-table {
        margin-bottom: 20px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .items-table th,
      .items-table td {
        padding: 12px;
      }
      
      .items-table th {
        font-size: 12px;
      }
      
      .items-table td {
        font-size: 14px;
      }
      
      .total-section {
        padding: 18px;
        margin-bottom: 20px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .total-row {
        margin: 8px 0;
        font-size: 15px;
      }
      
      .total-amount {
        font-size: 24px;
        margin-top: 8px;
      }
      
      .invoice-footer {
        padding: 18px;
        font-size: 12px;
        page-break-inside: avoid;
        break-inside: avoid;
        margin-top: 0;
      }
      
      .invoice-footer p {
        margin: 6px 0;
      }
      
      /* Ensure everything fits on one page */
      .invoice-container {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <h1>INVOICE</h1>
      <p>CVGenix - Professional Resume Builder</p>
    </div>
    
    <div class="invoice-body">
      <div class="invoice-info">
        <div class="info-section">
          <h3>Bill To</h3>
          <p><strong>{{user.firstName}} {{user.lastName}}</strong></p>
          <p>{{user.email}}</p>
        </div>
        
        <div class="info-section">
          <h3>Invoice Details</h3>
          <p class="invoice-number">{{invoiceNumber}}</p>
          <p><strong>Date:</strong> {{paymentDate}}</p>
          <p><strong>Status:</strong> <span class="status-badge status-paid">Paid</span></p>
        </div>
      </div>
      
      <div class="invoice-details">
        {{#if payment.stripePaymentId}}
        <div class="detail-row">
          <span class="detail-label">Payment ID:</span>
          <span class="detail-value">{{payment.stripePaymentId}}</span>
        </div>
        {{/if}}
        {{#if payment.credits}}
        <div class="detail-row">
          <span class="detail-label">Credits Purchased:</span>
          <span class="detail-value">{{payment.credits}} Credits</span>
        </div>
        {{/if}}
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">Credit Card (via Stripe)</span>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>{{#if payment.description}}{{payment.description}}{{else}}Credit Purchase{{/if}}</strong>
              {{#if payment.planId}}
              <br><small style="color: #666;">Plan: {{payment.planId}}</small>
              {{/if}}
            </td>
            <td style="text-align: right;">
              <strong>{{formatCurrency payment.amount payment.currency}}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>{{formatCurrency payment.amount payment.currency}}</span>
        </div>
        <div class="total-row">
          <span>Tax:</span>
          <span>$0.00</span>
        </div>
        <div class="total-row total-amount">
          <span>Total:</span>
          <span>{{formatCurrency payment.amount payment.currency}}</span>
        </div>
      </div>
    </div>
    
    <div class="invoice-footer">
      <p>Thank you for your business!</p>
      <p>This is an official invoice for your records.</p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        CVGenix - Professional Resume Builder Platform<br>
        For support, please contact us at support@cvgenix.com
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Ensure payment object has all required fields with defaults
    // paymentObj is already converted above
    const paymentData = {
      stripePaymentId: paymentObj.stripePaymentId || paymentObj._id?.toString() || 'N/A',
      amount: Number(paymentObj.amount) || 0, // Explicitly convert to number
      currency: paymentObj.currency || 'USD',
      description: paymentObj.description || 'Credit Purchase',
      credits: Number(paymentObj.credits) || 0,
      planId: paymentObj.planId || null,
      status: paymentObj.status || 'paid'
    };
    
    // Debug log
    console.log('📄 Payment data for invoice:', {
      rawAmount: paymentObj.amount,
      rawAmountType: typeof paymentObj.amount,
      processedAmount: paymentData.amount,
      processedAmountType: typeof paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description
    });

    const compiled = handlebars.compile(template);
    return compiled({
      invoiceNumber,
      paymentDate,
      payment: paymentData,
      user: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }
    });
  }

  // Generate invoice PDF
  async generateInvoicePDF(paymentId) {
    let browser = null;
    
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const user = await User.findById(payment.user);
      if (!user) {
        throw new Error('User not found');
      }

      console.log(`📄 Generating invoice PDF for payment ${paymentId}`);
      console.log(`💰 Payment amount: $${payment.amount}, currency: ${payment.currency}`);

      // Generate HTML
      const html = this.generateInvoiceHTML(payment, user);
      
      if (!html || html.length < 100) {
        throw new Error('Generated HTML is empty or too short');
      }
      
      console.log(`📝 Generated HTML: ${html.length} characters`);

      // Ensure temp directory exists
      if (!fs.existsSync(this.tempPath)) {
        fs.mkdirSync(this.tempPath, { recursive: true });
      }

      // Save HTML to temp file
      const tempHtmlPath = path.join(this.tempPath, `invoice-${uuidv4()}.html`);
      fs.writeFileSync(tempHtmlPath, html, 'utf8');
      console.log(`💾 Saved HTML to: ${tempHtmlPath}`);

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
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      });

      // Load HTML - use setContent instead of file:// for better compatibility
      console.log(`📄 Setting HTML content (${html.length} characters)...`);
      
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for page to be fully rendered
      try {
        await page.waitForSelector('.invoice-container', { timeout: 10000 });
        console.log('✅ Invoice container found');
      } catch (selectorError) {
        console.warn('⚠️ Invoice container selector not found, continuing anyway...');
        // Try waiting for body instead
        try {
          await page.waitForSelector('body', { timeout: 5000 });
        } catch (bodyError) {
          console.warn('⚠️ Body selector also not found');
        }
      }
      
      // Wait for fonts to load
      try {
        await page.evaluateHandle('document.fonts.ready');
      } catch (fontError) {
        console.warn('⚠️ Font loading check failed, continuing anyway...');
      }
      
      // Wait for any animations or dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify page content is loaded
      const pageContent = await page.content();
      if (!pageContent || pageContent.length < 100) {
        throw new Error('Page content is empty or too short');
      }

      console.log(`📄 Page loaded, content length: ${pageContent.length} characters`);

      // Generate PDF with better options
      console.log('🖨️ Generating PDF...');
      let pdfBuffer;
      try {
        pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0.2in',
            right: '0.2in',
            bottom: '0.2in',
            left: '0.2in'
          },
          preferCSSPageSize: false,
          displayHeaderFooter: false
        });
        console.log(`📦 PDF buffer generated: ${pdfBuffer ? pdfBuffer.length : 0} bytes`);
      } catch (pdfError) {
        console.error('❌ Error during PDF generation:', pdfError);
        throw new Error(`PDF generation failed: ${pdfError.message}`);
      }

      // Validate PDF buffer
      if (!pdfBuffer) {
        throw new Error('PDF buffer is null or undefined');
      }

      // Ensure it's a Buffer
      if (!Buffer.isBuffer(pdfBuffer)) {
        console.error('❌ PDF buffer is not a Buffer:', typeof pdfBuffer);
        console.error('❌ PDF buffer value:', pdfBuffer);
        
        // If it's a string, it might be an error message
        if (typeof pdfBuffer === 'string') {
          console.error('❌ PDF buffer is a string (likely an error):', pdfBuffer.substring(0, 200));
          throw new Error(`PDF generation returned an error: ${pdfBuffer.substring(0, 200)}`);
        }
        
        // Try to convert to buffer
        try {
          pdfBuffer = Buffer.from(pdfBuffer);
        } catch (convertError) {
          throw new Error(`PDF buffer is not a valid Buffer: ${convertError.message}`);
        }
      }

      if (pdfBuffer.length === 0) {
        throw new Error('PDF buffer is empty');
      }

      // Check if it's a valid PDF (should start with %PDF)
      const pdfHeader = pdfBuffer.slice(0, 4).toString('ascii');
      const pdfHeaderHex = pdfBuffer.slice(0, 4).toString('hex');
      console.log(`📋 PDF header: "${pdfHeader}" (hex: ${pdfHeaderHex})`);
      console.log(`📋 PDF buffer length: ${pdfBuffer.length} bytes`);
      console.log(`📋 First 100 bytes (hex): ${pdfBuffer.slice(0, 100).toString('hex')}`);
      
      if (pdfHeader !== '%PDF') {
        // Check if it's an HTML error page
        const bufferStart = pdfBuffer.slice(0, 100).toString('utf8');
        if (bufferStart.includes('<html') || bufferStart.includes('<!DOCTYPE')) {
          console.error('❌ PDF buffer contains HTML (error page):', bufferStart.substring(0, 200));
          throw new Error('PDF generation returned an HTML error page instead of PDF');
        }
        
        // Sometimes PDFs can have BOM or other prefixes, check a bit further
        const pdfHeaderExtended = pdfBuffer.slice(0, 20).toString('ascii');
        if (pdfHeaderExtended.includes('%PDF')) {
          console.log('⚠️ PDF header found at offset, adjusting...');
          // Find the actual PDF start
          const pdfStart = pdfBuffer.indexOf('%PDF');
          if (pdfStart > 0 && pdfStart < 100) {
            pdfBuffer = pdfBuffer.slice(pdfStart);
            console.log(`✅ Adjusted PDF buffer, new length: ${pdfBuffer.length} bytes`);
          }
        } else {
          // Log more details for debugging
          console.error('❌ Invalid PDF header:', pdfHeader);
          console.error('❌ First 200 bytes (ascii):', pdfBuffer.slice(0, 200).toString('ascii'));
          console.error('❌ First 200 bytes (utf8):', pdfBuffer.slice(0, 200).toString('utf8'));
          throw new Error(`Generated file is not a valid PDF. Header: "${pdfHeader}"`);
        }
      }
      
      // Final validation - ensure it still starts with %PDF after any adjustments
      const finalHeader = pdfBuffer.slice(0, 4).toString('ascii');
      if (finalHeader !== '%PDF') {
        throw new Error(`PDF validation failed. Final header: "${finalHeader}"`);
      }
      
      console.log(`✅ PDF validation passed: ${pdfBuffer.length} bytes`);

      // Clean up temp file
      try {
        fs.unlinkSync(tempHtmlPath);
      } catch (unlinkError) {
        console.warn('Could not delete temp file:', unlinkError);
      }

      console.log(`✅ Invoice PDF generated successfully: ${pdfBuffer.length} bytes`);

      // Generate invoice number (same as in HTML generation)
      const paymentObj = payment.toObject ? payment.toObject() : payment;
      const paymentIdForInvoice = paymentObj.stripePaymentId || paymentObj._id?.toString() || 'UNKNOWN';
      const invoiceNumber = paymentIdForInvoice.length >= 8 
        ? `INV-${paymentIdForInvoice.slice(-8).toUpperCase().replace(/[^A-Z0-9]/g, '')}`
        : `INV-${paymentIdForInvoice.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

      return {
        success: true,
        pdfBuffer,
        invoiceNumber
      };
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      console.error('Error stack:', error.stack);
      return {
        success: false,
        error: error.message || 'Failed to generate invoice PDF'
      };
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.warn('Error closing browser:', closeError);
        }
      }
    }
  }

  // Generate invoice HTML (for web view)
  async generateInvoiceHTMLView(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const user = await User.findById(payment.user);
      if (!user) {
        throw new Error('User not found');
      }

      // Log the payment data before generating invoice
      const paymentObj = payment.toObject ? payment.toObject() : payment;
      console.log('📋 Payment data retrieved from DB:', {
        _id: paymentObj._id,
        amount: paymentObj.amount,
        amountType: typeof paymentObj.amount,
        currency: paymentObj.currency,
        description: paymentObj.description,
        stripePaymentId: paymentObj.stripePaymentId
      });

      return this.generateInvoiceHTML(payment, user);
    } catch (error) {
      console.error('Error generating invoice HTML:', error);
      throw error;
    }
  }
}

module.exports = new InvoiceService();

