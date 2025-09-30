const mongoose = require('mongoose')
const Template = require('../models/Template')
require('dotenv').config()

const fixTextWrappingComprehensive = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to database')

    // Update Real Estate Agent Template
    const realEstateTemplate = await Template.findOne({ name: "Real Estate Agent Template" })
    if (realEstateTemplate) {
      console.log('🔧 Fixing text wrapping in Real Estate Agent Template...')
      
      // Update all text objects to use textbox for proper wrapping
      realEstateTemplate.canvasData.objects.forEach(obj => {
        if (obj.type === "text") {
          obj.type = "textbox" // Change to textbox for wrapping
          obj.splitByGrapheme = true // Enable proper text wrapping
          obj.textAlign = obj.textAlign || "left"
          obj.lineHeight = 1.2 // Set line height for better readability
          
          // Set proper width constraints
          if (obj.width && obj.width > 700) {
            obj.width = 700
          }
          
          // Set minimum height for text wrapping
          if (obj.height && obj.height < 20) {
            obj.height = 20
          }
        }
      })
      
      // Specifically fix the profile text
      const profileTextObj = realEstateTemplate.canvasData.objects.find(obj => obj.id === 'profile_text')
      if (profileTextObj) {
        profileTextObj.type = "textbox"
        profileTextObj.width = 700
        profileTextObj.height = 80
        profileTextObj.splitByGrapheme = true
        profileTextObj.textAlign = "left"
        profileTextObj.lineHeight = 1.3
        profileTextObj.fontSize = 12
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
          obj.lineHeight = 1.2 // Set line height for better readability
          
          // Set proper width constraints based on column
          if (obj.left > 250) { // Right column content
            obj.width = Math.min(obj.width || 200, 450)
          } else { // Left column headers
            obj.width = Math.min(obj.width || 200, 200)
          }
          
          // Set minimum height for text wrapping
          if (obj.height && obj.height < 20) {
            obj.height = 20
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
fixTextWrappingComprehensive()
