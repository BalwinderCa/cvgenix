const mongoose = require('mongoose');
const Template = require('../models/Template');
require('dotenv').config({ path: '../.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function deleteAllTemplates() {
  try {
    await connectDB();

    // Get current count before deletion
    const currentCount = await Template.countDocuments();
    console.log(`📊 Current templates in database: ${currentCount}`);

    if (currentCount === 0) {
      console.log('ℹ️ No templates found to delete');
      return;
    }

    // Confirm deletion (in a real scenario, you might want user confirmation)
    console.log('🗑️ Deleting all templates...');

    // Delete all template documents
    const result = await Template.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} templates`);

    // Verify deletion
    const remainingCount = await Template.countDocuments();
    console.log(`📊 Templates remaining in database: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('🎉 All templates have been successfully deleted!');
    } else {
      console.log('⚠️ Warning: Some templates may still remain in the database');
    }

  } catch (error) {
    console.error('❌ Error deleting templates:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

deleteAllTemplates();
