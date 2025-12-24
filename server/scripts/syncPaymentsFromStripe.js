/**
 * Script to sync payment history from Stripe to database
 * Run this once to backfill existing payments
 * 
 * Usage: node server/scripts/syncPaymentsFromStripe.js [userId]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Payment = require('../models/Payment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me';

async function syncPaymentsForUser(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    console.log(`\n🔄 Syncing payments for user: ${user.email} (${user._id})`);

    const payments = [];
    const processedIds = new Set();

    // Get checkout sessions
    if (user.stripeCustomerId) {
      try {
        const sessions = await stripe.checkout.sessions.list({
          customer: user.stripeCustomerId,
          limit: 100,
        });

        for (const session of sessions.data) {
          if (session.payment_status === 'paid' && !processedIds.has(session.id)) {
            processedIds.add(session.id);
            
            const amount = session.amount_total ? session.amount_total / 100 : 0;
            const credits = parseInt(session.metadata?.credits) || 0;
            const planId = session.metadata?.planId || 'unknown';
            const plan = {
              starter_credits: { name: 'Starter Pack' },
              popular_credits: { name: 'Popular Pack' },
              professional_credits: { name: 'Professional Pack' }
            }[planId] || { name: planId };

            // Get receipt URL from payment intent
            let receiptUrl = null;
            if (session.payment_intent) {
              try {
                const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
                  receiptUrl = paymentIntent.charges.data[0].receipt_url || null;
                }
              } catch (error) {
                console.error(`  ⚠️ Could not get receipt URL for ${session.payment_intent}:`, error.message);
              }
            }

            payments.push({
              user: user._id,
              stripeCustomerId: user.stripeCustomerId,
              stripePaymentId: session.payment_intent || session.id,
              stripeSessionId: session.id,
              type: session.metadata?.type === 'credit_purchase' ? 'credit_purchase' : 'payment',
              amount: amount,
              currency: session.currency?.toUpperCase() || 'USD',
              status: session.payment_status,
              description: session.metadata?.type === 'credit_purchase' 
                ? `${plan.name || planId} - ${credits} Credits`
                : (session.metadata?.description || 'Payment'),
              credits: credits,
              planId: planId,
              invoiceUrl: session.invoice ? `https://dashboard.stripe.com/invoices/${session.invoice}` : null,
              receiptUrl: receiptUrl,
              metadata: session.metadata || {},
              paymentDate: new Date(session.created * 1000)
            });
          }
        }
        console.log(`  ✓ Found ${sessions.data.length} checkout sessions`);
      } catch (error) {
        console.error('  ✗ Error fetching checkout sessions:', error.message);
      }
    }

    // Also search by email and metadata
    try {
      const allSessions = await stripe.checkout.sessions.list({ limit: 200 });
      
      for (const session of allSessions.data) {
        const matchesUser = 
          session.customer_email === user.email ||
          session.metadata?.userId === userId.toString();
        
        if (matchesUser && session.payment_status === 'paid' && !processedIds.has(session.id)) {
          processedIds.add(session.id);
          
          const amount = session.amount_total ? session.amount_total / 100 : 0;
          const credits = parseInt(session.metadata?.credits) || 0;
          const planId = session.metadata?.planId || 'unknown';
          const plan = {
            starter_credits: { name: 'Starter Pack' },
            popular_credits: { name: 'Popular Pack' },
            professional_credits: { name: 'Professional Pack' }
          }[planId] || { name: planId };

          // Get receipt URL from payment intent
          let receiptUrl = null;
          if (session.payment_intent) {
            try {
              const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
              if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
                receiptUrl = paymentIntent.charges.data[0].receipt_url || null;
              }
            } catch (error) {
              console.error(`  ⚠️ Could not get receipt URL for ${session.payment_intent}:`, error.message);
            }
          }

          payments.push({
            user: user._id,
            stripeCustomerId: session.customer || user.stripeCustomerId,
            stripePaymentId: session.payment_intent || session.id,
            stripeSessionId: session.id,
            type: session.metadata?.type === 'credit_purchase' ? 'credit_purchase' : 'payment',
            amount: amount,
            currency: session.currency?.toUpperCase() || 'USD',
            status: session.payment_status,
            description: session.metadata?.type === 'credit_purchase' 
              ? `${plan.name || planId} - ${credits} Credits`
              : (session.metadata?.description || 'Payment'),
            credits: credits,
            planId: planId,
            invoiceUrl: session.invoice ? `https://dashboard.stripe.com/invoices/${session.invoice}` : null,
            receiptUrl: receiptUrl,
            metadata: session.metadata || {},
            paymentDate: new Date(session.created * 1000)
          });
        }
      }
    } catch (error) {
      console.error('  ✗ Error searching all sessions:', error.message);
    }

    // Get invoices
    if (user.stripeCustomerId) {
      try {
        const invoices = await stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 100,
        });

        for (const invoice of invoices.data) {
          if (invoice.status === 'paid' && !processedIds.has(invoice.id)) {
            processedIds.add(invoice.id);
            
            const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
            const description = invoice.lines.data[0]?.description || 'Subscription Payment';
            const subscriptionId = invoice.subscription;

            payments.push({
              user: user._id,
              stripeCustomerId: user.stripeCustomerId,
              stripePaymentId: invoice.id,
              stripeInvoiceId: invoice.id,
              type: subscriptionId ? 'subscription' : 'invoice',
              amount: amount,
              currency: invoice.currency?.toUpperCase() || 'USD',
              status: invoice.status,
              description: description,
              invoiceUrl: invoice.hosted_invoice_url || invoice.invoice_pdf,
              receiptUrl: invoice.receipt_url,
              invoiceNumber: invoice.number,
              metadata: {},
              paymentDate: new Date(invoice.created * 1000)
            });
          }
        }
        console.log(`  ✓ Found ${invoices.data.length} invoices`);
      } catch (error) {
        console.error('  ✗ Error fetching invoices:', error.message);
      }
    }

    // Save payments to database
    let saved = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const paymentData of payments) {
      try {
        const existing = await Payment.findOne({ 
          stripePaymentId: paymentData.stripePaymentId 
        });
        
        if (existing) {
          skipped++;
          continue;
        }

        const payment = new Payment(paymentData);
        await payment.save();
        saved++;
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - might be a race condition or index issue
          const existing = await Payment.findOne({ 
            stripePaymentId: paymentData.stripePaymentId 
          });
          if (existing) {
            skipped++;
          } else {
            console.error(`  ✗ Duplicate key error for ${paymentData.stripePaymentId}:`, error.message);
            errors++;
          }
        } else {
          console.error(`  ✗ Error saving payment ${paymentData.stripePaymentId}:`, error.message);
          errors++;
        }
      }
    }

    console.log(`\n✅ Sync complete:`);
    console.log(`   - Total found: ${payments.length}`);
    console.log(`   - Saved: ${saved}`);
    console.log(`   - Skipped (already exists): ${skipped}`);
    if (errors > 0) {
      console.log(`   - Errors: ${errors}`);
    }
    
  } catch (error) {
    console.error('Error syncing payments:', error);
  }
}

async function syncAllUsers() {
  try {
    const users = await User.find({});
    console.log(`Found ${users.length} users to sync`);
    
    for (const user of users) {
      await syncPaymentsForUser(user._id);
    }
  } catch (error) {
    console.error('Error syncing all users:', error);
  }
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userId = process.argv[2];
    
    if (userId) {
      await syncPaymentsForUser(userId);
    } else {
      console.log('No userId provided, syncing all users...');
      await syncAllUsers();
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();

