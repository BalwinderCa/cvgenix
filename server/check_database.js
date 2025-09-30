const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb';

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    const db = mongoose.connection.db;
    
    // Get all collections
    console.log('📋 Database Collections:');
    console.log('='.repeat(50));
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      console.log(`📁 Collection: ${collection.name}`);
      console.log(`   Type: ${collection.type}`);
      console.log(`   Options: ${JSON.stringify(collection.options, null, 2)}`);
      console.log('');
    }

    // Check each collection for documents and structure
    for (const collection of collections) {
      const collectionName = collection.name;
      const collectionObj = db.collection(collectionName);
      
      console.log(`🔍 Analyzing Collection: ${collectionName}`);
      console.log('-'.repeat(40));
      
      // Get document count
      const count = await collectionObj.countDocuments();
      console.log(`📊 Total Documents: ${count}`);
      
      if (count > 0) {
        // Get a sample document to understand structure
        const sampleDoc = await collectionObj.findOne();
        console.log(`📄 Sample Document Structure:`);
        console.log(JSON.stringify(sampleDoc, null, 2));
        
        // Get field statistics
        const pipeline = [
          { $project: { fields: { $objectToArray: "$$ROOT" } } },
          { $unwind: "$fields" },
          { $group: { _id: "$fields.k", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ];
        
        const fieldStats = await collectionObj.aggregate(pipeline).toArray();
        console.log(`\n📈 Field Statistics:`);
        fieldStats.slice(0, 10).forEach(field => {
          console.log(`   ${field._id}: ${field.count} occurrences`);
        });
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }

    // Check indexes
    console.log('🔍 Database Indexes:');
    console.log('='.repeat(50));
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      console.log(`📁 ${collection.name}:`);
      indexes.forEach(index => {
        console.log(`   ${index.name}: ${JSON.stringify(index.key)}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkDatabase();
