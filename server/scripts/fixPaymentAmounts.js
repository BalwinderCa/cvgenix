/**
 * Script to fix payment amounts that are 0.00
 * Retrieves actual amounts from Stripe and updates the database
 * 
 * Usage: node server/scripts/fixPaymentAmounts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me';

async function fixPaymentAmounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find payments with amount 0
    const payments = await Payment.find({ amount: 0 });

    console.log(`\n📋 Found ${payments.length} payments with $0.00 amount`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const payment of payments) {
      try {
        let newAmount = 0;

        // Try to get amount from payment intent
        if (payment.stripePaymentId && payment.stripePaymentId.startsWith('pi_')) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentId);
            newAmount = paymentIntent.amount ? paymentIntent.amount / 100 : 0;
            console.log(`  💰 Payment ${payment.stripePaymentId}: $${newAmount} from payment intent`);
          } catch (error) {
            console.error(`  ⚠️ Could not retrieve payment intent ${payment.stripePaymentId}:`, error.message);
          }
        }

        // Try to get amount from checkout session
        if (newAmount === 0 && payment.stripeSessionId) {
          try {
            const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
            if (session.amount_total) {
              newAmount = session.amount_total / 100;
            } else if (session.amount_subtotal) {
              newAmount = session.amount_subtotal / 100;
            }
            console.log(`  💰 Payment ${payment.stripePaymentId}: $${newAmount} from checkout session`);
          } catch (error) {
            console.error(`  ⚠️ Could not retrieve session ${payment.stripeSessionId}:`, error.message);
          }
        }

        // Try to get amount from charge
        if (newAmount === 0 && payment.stripeChargeId) {
          try {
            const charge = await stripe.charges.retrieve(payment.stripeChargeId);
            newAmount = charge.amount ? charge.amount / 100 : 0;
            console.log(`  💰 Payment ${payment.stripePaymentId}: $${newAmount} from charge`);
          } catch (error) {
            console.error(`  ⚠️ Could not retrieve charge ${payment.stripeChargeId}:`, error.message);
          }
        }

        if (newAmount > 0) {
          payment.amount = newAmount;
          await payment.save();
          updated++;
          console.log(`  ✅ Updated payment ${payment.stripePaymentId} to $${newAmount}`);
        } else {
          skipped++;
          console.log(`  ⏭️  Could not determine amount for payment ${payment.stripePaymentId}`);
        }
      } catch (error) {
        errors++;
        console.error(`  ✗ Error processing payment ${payment.stripePaymentId}:`, error.message);
      }
    }

    console.log(`\n✅ Fix complete:`);
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

fixPaymentAmounts();



