const mongoose = require('mongoose');
const Template = require('../models/Template');

async function deleteAllTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Delete all templates
    const result = await Template.deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} templates from database`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error deleting templates:', error);
    process.exit(1);
  }
}

// Run the script
deleteAllTemplates();