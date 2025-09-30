const mongoose = require('mongoose')
const Template = require('../models/Template')
require('dotenv').config()

const fixSamiraBounds = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to database')

    // Update Samira Alcaraz Template to fix bounds
    const samiraTemplate = await Template.findOne({ name: "Samira Alcaraz Template" })
    if (samiraTemplate) {
      console.log('🔧 Fixing bounds in Samira Alcaraz Template...')
      
      // Update the last few objects to stay within bounds
      samiraTemplate.canvasData.objects.forEach(obj => {
        // Ensure all objects stay within 800x1000 canvas
        if (obj.left + (obj.width || 200) > 800) {
          obj.width = Math.min(obj.width || 200, 800 - obj.left);
        }
        if (obj.top + (obj.height || 20) > 1000) {
          obj.top = Math.min(obj.top, 1000 - (obj.height || 20));
        }
      })
      
      // Specifically fix the last few certificate objects
      const cert4Title = samiraTemplate.canvasData.objects.find(obj => obj.id === 'cert4_title');
      if (cert4Title) {
        cert4Title.top = 1090;
      }
      
      const cert4Issuer = samiraTemplate.canvasData.objects.find(obj => obj.id === 'cert4_issuer');
      if (cert4Issuer) {
        cert4Issuer.top = 1120;
      }
      
      await samiraTemplate.save()
      console.log('✅ Samira Alcaraz Template bounds fixed')
    }

    console.log('✅ All bounds fixed successfully!')

  } catch (error) {
    console.error('❌ Error fixing bounds:', error.message)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the script
fixSamiraBounds()
