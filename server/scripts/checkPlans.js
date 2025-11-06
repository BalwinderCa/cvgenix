require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

async function checkPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const plans = await Plan.find({});
    console.log(`\n📊 Found ${plans.length} plans in database:`);
    
    if (plans.length === 0) {
      console.log('⚠️  No plans found in database!');
      console.log('\nPlans collection is empty. You need to add plans to the database.');
    } else {
      plans.forEach((plan, index) => {
        console.log(`\n${index + 1}. Plan ID: ${plan._id}`);
        console.log(`   Title: ${plan.title}`);
        console.log(`   Price: $${plan.price}`);
        console.log(`   Credits: ${plan.credits}`);
        console.log(`   Status: ${plan.status}`);
        console.log(`   Popular: ${plan.popular || false}`);
        if (plan.description) console.log(`   Description: ${plan.description}`);
        if (plan.features && plan.features.length > 0) {
          console.log(`   Features: ${plan.features.join(', ')}`);
        }
      });
      
      const activePlans = await Plan.find({ status: 'active' });
      console.log(`\n✅ Active plans: ${activePlans.length}`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPlans();


