console.log('Starting connection test...');

const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoUri = 'mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test a simple operation
    const Template = require('../models/Template');
    const count = await Template.countDocuments();
    console.log(`📊 Current templates count: ${count}`);
    
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

testConnection();
