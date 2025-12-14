/**
 * Stripe Products Setup Script
 * 
 * This script creates the required products and prices in Stripe
 * Run: node server/scripts/setup-stripe-products.js
 * 
 * Make sure you have STRIPE_SECRET_KEY in your .env file
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const plans = [
  {
    name: 'Starter Pack',
    description: 'Perfect for getting started - 5 Credits Included',
    price: 3.99,
    interval: null, // One-time purchase
    envKey: 'STRIPE_STARTER_PRICE_ID'
  },
  {
    name: 'Popular Pack',
    description: 'Most popular choice - 15 Credits Included',
    price: 9.99,
    interval: null, // One-time purchase
    envKey: 'STRIPE_POPULAR_PRICE_ID'
  },
  {
    name: 'Professional Pack',
    description: 'For professionals - 30 Credits Included',
    price: 19.99,
    interval: null, // One-time purchase
    envKey: 'STRIPE_PROFESSIONAL_PRICE_ID'
  }
];

async function createProducts() {
  console.log('🚀 Starting Stripe products setup...\n');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY not found in environment variables');
    console.log('💡 Make sure you have a .env file with STRIPE_SECRET_KEY set');
    process.exit(1);
  }

  // Check if we're in test mode
  const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
  console.log(`📊 Mode: ${isTestMode ? 'TEST' : 'LIVE'}\n`);

  if (!isTestMode) {
    console.warn('⚠️  WARNING: You are using LIVE mode keys!');
    console.warn('⚠️  This will create real products that charge real money!\n');
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    await new Promise(resolve => {
      readline.question('Continue? (yes/no): ', answer => {
        readline.close();
        if (answer.toLowerCase() !== 'yes') {
          console.log('❌ Aborted');
          process.exit(0);
        }
        resolve();
      });
    });
  }

  const results = {};

  for (const plan of plans) {
    try {
      console.log(`📦 Creating ${plan.name}...`);

      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create price (one-time payment, not recurring)
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: 'usd',
        // No recurring field for one-time payments
      });

      console.log(`   ✅ Price created: ${price.id}`);
      console.log(`   💰 Amount: $${plan.price}/${plan.interval}\n`);

      results[plan.envKey] = price.id;

    } catch (error) {
      console.error(`   ❌ Error creating ${plan.name}:`, error.message);
      
      // If product already exists, try to find existing price
      if (error.code === 'resource_already_exists') {
        console.log(`   🔍 Product already exists, searching for existing prices...`);
        try {
          const prices = await stripe.prices.list({
            limit: 100,
          });
          
          const existingPrice = prices.data.find(
            p => !p.recurring && // One-time payment (no recurring)
                 p.unit_amount === Math.round(plan.price * 100)
          );
          
          if (existingPrice) {
            console.log(`   ✅ Found existing price: ${existingPrice.id}\n`);
            results[plan.envKey] = existingPrice.id;
          }
        } catch (searchError) {
          console.error(`   ❌ Error searching for existing prices:`, searchError.message);
        }
      }
    }
  }

  console.log('\n📋 Configuration Summary:\n');
  console.log('Add these to your .env file:\n');
  
  for (const [key, value] of Object.entries(results)) {
    if (value) {
      console.log(`${key}=${value}`);
    }
  }

  console.log('\n✅ Setup complete!');
  console.log('💡 Copy the Price IDs above to your .env file\n');
}

// Run the script
createProducts().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

