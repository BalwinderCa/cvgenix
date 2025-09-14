const paymentService = require('../services/paymentService');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const testPaymentService = async () => {
  try {
    console.log('🧪 Testing Payment Service...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me');
    console.log('📦 Connected to MongoDB');

    // Test 1: Get available plans
    console.log('\n📋 Testing: Get available plans');
    const plans = paymentService.getPlans();
    console.log('Available plans:');
    Object.keys(plans).forEach(planId => {
      const plan = plans[planId];
      console.log(`  - ${plan.name}: $${plan.price}/${plan.interval || 'one-time'}`);
    });

    // Test 2: Check feature access
    console.log('\n🔒 Testing: Feature access check');
    const testUser = await User.findOne();
    if (testUser) {
      console.log(`Testing with user: ${testUser.email}`);
      
      const resumeAccess = await paymentService.checkFeatureAccess(testUser._id, 'resumes');
      console.log('Resume access:', resumeAccess);
      
      const atsAccess = await paymentService.checkFeatureAccess(testUser._id, 'atsAnalysis');
      console.log('ATS analysis access:', atsAccess);
    } else {
      console.log('No users found in database');
    }

    // Test 3: Get user plan
    console.log('\n👤 Testing: Get user plan');
    if (testUser) {
      const userPlan = await paymentService.getUserPlan(testUser._id);
      console.log('User plan:', userPlan);
    }

    console.log('\n✅ Payment service tests completed successfully!');

  } catch (error) {
    console.error('❌ Payment service test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  }
};

testPaymentService();
