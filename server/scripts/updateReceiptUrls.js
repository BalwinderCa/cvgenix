/**
 * Script to update existing payment records with proper receipt URLs
 * This fixes payments that have dashboard URLs instead of actual receipt URLs
 * 
 * Usage: node server/scripts/updateReceiptUrls.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me';

async function updateReceiptUrls() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find payments with dashboard URLs or null receipt URLs
    const payments = await Payment.find({
      $or: [
        { receiptUrl: { $regex: /dashboard\.stripe\.com/ } },
        { receiptUrl: null }
      ]
    });

    console.log(`\n📋 Found ${payments.length} payments to update`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const payment of payments) {
      try {
        // Skip if no payment intent
        if (!payment.stripePaymentId || payment.stripePaymentId.startsWith('cs_')) {
          skipped++;
          continue;
        }

        // Try to get receipt URL from payment intent
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentId);
          
          if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
            const receiptUrl = paymentIntent.charges.data[0].receipt_url;
            
            if (receiptUrl) {
              payment.receiptUrl = receiptUrl;
              await payment.save();
              updated++;
              console.log(`  ✅ Updated payment ${payment.stripePaymentId}`);
            } else {
              skipped++;
            }
          } else {
            skipped++;
          }
        } catch (error) {
          // Try to get from charge if payment intent fails
          if (payment.stripeChargeId) {
            try {
              const charge = await stripe.charges.retrieve(payment.stripeChargeId);
              if (charge.receipt_url) {
                payment.receiptUrl = charge.receipt_url;
                await payment.save();
                updated++;
                console.log(`  ✅ Updated payment ${payment.stripePaymentId} from charge`);
              } else {
                skipped++;
              }
            } catch (chargeError) {
              console.error(`  ✗ Error updating ${payment.stripePaymentId}:`, error.message);
              errors++;
            }
          } else {
            console.error(`  ✗ Error updating ${payment.stripePaymentId}:`, error.message);
            errors++;
          }
        }
      } catch (error) {
        console.error(`  ✗ Error processing payment ${payment.stripePaymentId}:`, error.message);
        errors++;
      }
    }

    console.log(`\n✅ Update complete:`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Errors: ${errors}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

updateReceiptUrls();




