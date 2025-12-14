// Quick test script to manually add credits
// Run with: node test-webhook.js

const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config();

async function addCredits() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix');
    console.log('✅ Connected to MongoDB');

    // Get user email from command line
    const userEmail = process.argv[2];
    const credits = parseInt(process.argv[3]) || 15;

    if (!userEmail) {
      console.log('Usage: node test-webhook.js <user-email> <credits>');
      console.log('Example: node test-webhook.js user@example.com 15');
      process.exit(1);
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.error('❌ User not found:', userEmail);
      process.exit(1);
    }

    const oldCredits = user.credits || 0;
    user.credits = oldCredits + credits;
    await user.save();

    console.log(`✅ Added ${credits} credits to ${user.email}`);
    console.log(`💰 Credits: ${oldCredits} → ${user.credits}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCredits();

