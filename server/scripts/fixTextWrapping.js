const mongoose = require('mongoose')
const Template = require('../models/Template')
require('dotenv').config()

const fixTextWrapping = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to database')

    // Update Real Estate Agent Template
    const realEstateTemplate = await Template.findOne({ name: "Real Estate Agent Template" })
    if (realEstateTemplate) {
      console.log('🔧 Fixing text wrapping in Real Estate Agent Template...')
      
      // Update the profile text to use proper text wrapping
      const profileTextObj = realEstateTemplate.canvasData.objects.find(obj => obj.id === 'profile_text')
      if (profileTextObj) {
        profileTextObj.type = "textbox" // Use textbox instead of text for wrapping
        profileTextObj.width = 700
        profileTextObj.height = 80
        profileTextObj.splitByGrapheme = true // Enable proper text wrapping
        profileTextObj.textAlign = "left"
        profileTextObj.fontSize = 12
        profileTextObj.lineHeight = 1.2
      }
      
      await realEstateTemplate.save()
      console.log('✅ Real Estate Agent Template text wrapping fixed')
    }

    // Update Mechanical Engineer Template
    const mechanicalTemplate = await Template.findOne({ name: "Mechanical Engineer Template" })
    if (mechanicalTemplate) {
      console.log('🔧 Fixing text wrapping in Mechanical Engineer Template...')
      
      // Update all text objects to use textbox for proper wrapping
      mechanicalTemplate.canvasData.objects.forEach(obj => {
        if (obj.type === "text") {
          obj.type = "textbox" // Change to textbox for wrapping
          obj.splitByGrapheme = true // Enable proper text wrapping
          obj.textAlign = obj.textAlign || "left"
          
          // Adjust width for better wrapping
          if (obj.left > 250) { // Right column content
            obj.width = Math.min(obj.width || 200, 450)
          } else { // Left column headers
            obj.width = Math.min(obj.width || 200, 200)
          }
        }
      })
      
      await mechanicalTemplate.save()
      console.log('✅ Mechanical Engineer Template text wrapping fixed')
    }

    console.log('✅ All templates text wrapping fixed successfully!')

  } catch (error) {
    console.error('❌ Error fixing text wrapping:', error.message)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the script
fixTextWrapping()
