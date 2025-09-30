const mongoose = require('mongoose')
const Template = require('../models/Template')
require('dotenv').config()

const fixTemplatePositions = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to database')

    // Get all templates
    const templates = await Template.find({})
    console.log(`📊 Found ${templates.length} templates to fix`)

    for (const template of templates) {
      console.log(`🔧 Fixing template: ${template.name}`)
      
      if (template.renderEngine === 'canvas' && template.canvasData && template.canvasData.objects) {
        let updated = false
        
        // Fix each text object
        template.canvasData.objects.forEach(obj => {
          if (obj.type === 'text') {
            // Ensure text stays within canvas bounds (800x1000)
            const maxWidth = 700 // Leave 50px margin on each side
            const maxHeight = 950 // Leave 50px margin at bottom
            
            // Fix horizontal positioning
            if (obj.left + (obj.width || 200) > 750) {
              obj.left = Math.min(obj.left, 750 - (obj.width || 200))
              updated = true
            }
            
            // Fix vertical positioning
            if (obj.top + (obj.height || 20) > maxHeight) {
              obj.top = Math.min(obj.top, maxHeight - (obj.height || 20))
              updated = true
            }
            
            // Ensure minimum margins
            if (obj.left < 20) {
              obj.left = 20
              updated = true
            }
            if (obj.top < 20) {
              obj.top = 20
              updated = true
            }
            
            // Fix width to prevent overflow
            if (obj.width && obj.width > maxWidth) {
              obj.width = maxWidth
              updated = true
            }
            
            // For two-column layout, ensure right column doesn't go too far right
            if (template.metadata?.layout === 'two-column' && obj.left > 250) {
              if (obj.left + (obj.width || 200) > 750) {
                obj.width = Math.min(obj.width || 200, 750 - obj.left)
                updated = true
              }
            }
          }
        })
        
        if (updated) {
          await template.save()
          console.log(`✅ Fixed positioning for: ${template.name}`)
        } else {
          console.log(`ℹ️  No fixes needed for: ${template.name}`)
        }
      }
    }

    console.log('✅ All templates fixed successfully!')

  } catch (error) {
    console.error('❌ Error fixing templates:', error.message)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the script
fixTemplatePositions()