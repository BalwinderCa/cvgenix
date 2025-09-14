const mongoose = require('mongoose');
const fileService = require('../services/fileService');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const cleanupFiles = async () => {
  try {
    console.log('🧹 Starting file cleanup process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me');
    console.log('📦 Connected to MongoDB');

    // Clean up old files (older than 7 days)
    const result = await fileService.cleanupOldFiles(7);
    
    if (result.success) {
      console.log('✅ File cleanup completed successfully');
      console.log('📊 Cleanup results:', result.results);
      
      // Get storage stats after cleanup
      const stats = await fileService.getStorageStats();
      if (stats.success) {
        console.log('📈 Current storage statistics:');
        console.log(JSON.stringify(stats.stats, null, 2));
      }
    } else {
      console.error('❌ File cleanup failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Cleanup process error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run cleanup
cleanupFiles();
