require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') })
const mongoose = require('mongoose')
const Template = require('../models/Template')

async function activateTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Activate all templates
    const result = await Template.updateMany(
      { isActive: false },
      { $set: { isActive: true } }
    )

    console.log(`\n✅ Activated ${result.modifiedCount} templates`)

    // Get all templates to check thumbnails
    const templates = await Template.find({}).select('name thumbnail isActive')
    
    console.log('\n📸 Thumbnail Status:')
    console.log('='.repeat(70))
    templates.forEach(template => {
      const hasThumbnail = template.thumbnail && template.thumbnail.trim().length > 0
      const thumbnailType = template.thumbnail ? 
        (template.thumbnail.startsWith('data:image') ? 'Base64' : 
         template.thumbnail.startsWith('http') ? 'URL' : 
         template.thumbnail.length > 0 ? 'Other' : 'Empty') : 'Missing'
      
      console.log(`${template.name}:`)
      console.log(`  - Active: ${template.isActive ? '✓' : '✗'}`)
      console.log(`  - Thumbnail: ${hasThumbnail ? '✓' : '✗'} (${thumbnailType})`)
      if (template.thumbnail) {
        const preview = template.thumbnail.substring(0, 50)
        console.log(`  - Preview: ${preview}${template.thumbnail.length > 50 ? '...' : ''}`)
      }
      console.log('')
    })

    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

activateTemplates()

