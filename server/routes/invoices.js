const express = require('express');
const auth = require('../middleware/auth');
const invoiceService = require('../services/invoiceService');
const Payment = require('../models/Payment');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/invoices/:paymentId
// @desc    Get invoice HTML view
// @access  Private
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this invoice'
      });
    }

    const html = await invoiceService.generateInvoiceHTMLView(paymentId);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error generating invoice HTML:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice'
    });
  }
});

// @route   GET /api/invoices/:paymentId/pdf
// @desc    Download invoice as PDF
// @access  Private
router.get('/:paymentId/pdf', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this invoice'
      });
    }

    console.log(`📄 Generating PDF for payment ${paymentId}`);
    console.log(`💰 Payment data:`, {
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description
    });

    const result = await invoiceService.generateInvoicePDF(paymentId);

    if (!result.success) {
      console.error(`❌ PDF generation failed:`, result.error);
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate invoice PDF',
        details: result.error
      });
    }

    // Validate PDF buffer before sending
    if (!result.pdfBuffer || !Buffer.isBuffer(result.pdfBuffer)) {
      console.error('❌ Invalid PDF buffer:', typeof result.pdfBuffer);
      return res.status(500).json({
        success: false,
        message: 'Invalid PDF buffer generated'
      });
    }

    if (result.pdfBuffer.length === 0) {
      console.error('❌ Empty PDF buffer');
      return res.status(500).json({
        success: false,
        message: 'PDF buffer is empty'
      });
    }

    const invoiceNumber = result.invoiceNumber;
    const filename = `${invoiceNumber}.pdf`;

    console.log(`📤 Sending PDF: ${filename}, size: ${result.pdfBuffer.length} bytes`);

    // Set headers before sending
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', result.pdfBuffer.length);
    
    // Send the PDF buffer
    res.send(result.pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice PDF'
    });
  }
});

module.exports = router;


