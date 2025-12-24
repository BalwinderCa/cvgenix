/**
 * Script to check payment data in database
 * Shows what's actually stored for payments
 * 
 * Usage: node server/scripts/checkPaymentData.js [paymentId]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me';

async function checkPaymentData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const paymentId = process.argv[2];

    if (paymentId) {
      // Check specific payment
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        console.log(`❌ Payment ${paymentId} not found`);
        process.exit(1);
      }
      
      console.log('\n📋 Payment Data:');
      console.log(JSON.stringify(payment.toObject(), null, 2));
    } else {
      // Show all recent payments
      const payments = await Payment.find({})
        .sort({ paymentDate: -1 })
        .limit(10);
      
      console.log(`\n📋 Found ${payments.length} recent payments:\n`);
      
      payments.forEach((payment, index) => {
        console.log(`${index + 1}. Payment ID: ${payment._id}`);
        console.log(`   Stripe Payment ID: ${payment.stripePaymentId || 'N/A'}`);
        console.log(`   Amount: $${payment.amount || 0} ${payment.currency || 'USD'}`);
        console.log(`   Description: ${payment.description || 'N/A'}`);
        console.log(`   Credits: ${payment.credits || 0}`);
        console.log(`   Date: ${payment.paymentDate}`);
        console.log(`   Status: ${payment.status || 'N/A'}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

checkPaymentData();



