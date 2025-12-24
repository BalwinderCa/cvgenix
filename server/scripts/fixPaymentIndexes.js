/**
 * Script to fix payment collection indexes
 * Removes old transactionId index if it exists
 * 
 * Usage: node server/scripts/fixPaymentIndexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me';

async function fixIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('payments');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop transactionId index if it exists
    try {
      const transactionIdIndex = indexes.find(idx => 
        idx.name === 'transactionId_1' || 
        Object.keys(idx.key).includes('transactionId')
      );

      if (transactionIdIndex) {
        console.log(`\n🗑️  Dropping old transactionId index: ${transactionIdIndex.name}`);
        await collection.dropIndex(transactionIdIndex.name);
        console.log('✅ Index dropped successfully');
      } else {
        console.log('\n✅ No transactionId index found');
      }
    } catch (error) {
      if (error.code === 27) {
        console.log('✅ Index already dropped or does not exist');
      } else {
        throw error;
      }
    }

    // Recreate indexes from schema
    console.log('\n🔄 Recreating indexes from schema...');
    const Payment = require('../models/Payment');
    await Payment.createIndexes();
    console.log('✅ Indexes recreated');

    // Show final indexes
    const finalIndexes = await collection.indexes();
    console.log('\n📋 Final indexes:');
    finalIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndexes();

