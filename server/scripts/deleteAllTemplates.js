const mongoose = require('mongoose')
const Template = require('../models/Template')
require('dotenv').config()

const deleteAllTemplates = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to database')

    // Count templates before deletion
    const templateCount = await Template.countDocuments()
    console.log(`📊 Found ${templateCount} templates in database`)

    if (templateCount === 0) {
      console.log('ℹ️  No templates found to delete')
      return
    }

    // Delete all templates
    console.log('🗑️  Deleting all templates...')
    const result = await Template.deleteMany({})
    
    console.log(`✅ Successfully deleted ${result.deletedCount} templates`)
    
    // Verify deletion
    const remainingCount = await Template.countDocuments()
    console.log(`📊 Remaining templates: ${remainingCount}`)

  } catch (error) {
    console.error('❌ Error deleting templates:', error.message)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the script
deleteAllTemplates()
