/**
 * Script to update existing payment records with our own invoice URLs
 * 
 * Usage: node server/scripts/updateInvoiceUrls.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me';
const API_URL = process.env.API_URL || process.env.FRONTEND_URL || 'http://localhost:3001';

async function updateInvoiceUrls() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all payments
    const payments = await Payment.find({});

    console.log(`\n📋 Found ${payments.length} payments to update`);

    let updated = 0;
    let skipped = 0;

    for (const payment of payments) {
      try {
        // Skip if already has our invoice URL
        if (payment.invoiceUrl && payment.invoiceUrl.includes('/api/invoices/')) {
          skipped++;
          continue;
        }

        // Set our invoice URL
        payment.invoiceUrl = `${API_URL}/api/invoices/${payment._id}`;
        await payment.save();
        updated++;
        console.log(`  ✅ Updated payment ${payment.stripePaymentId}`);
      } catch (error) {
        console.error(`  ✗ Error updating payment ${payment.stripePaymentId}:`, error.message);
      }
    }

    console.log(`\n✅ Update complete:`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Skipped: ${skipped}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

updateInvoiceUrls();

