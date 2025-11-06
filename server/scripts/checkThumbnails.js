require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') })
const mongoose = require('mongoose')
const Template = require('../models/Template')

async function checkThumbnails() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const templates = await Template.find({}).select('name thumbnail preview')
    
    console.log('📸 Detailed Thumbnail Analysis:')
    console.log('='.repeat(80))
    
    templates.forEach((template, index) => {
      console.log(`\n${index + 1}. ${template.name}:`)
      console.log(`   Thumbnail: ${template.thumbnail || 'NULL/EMPTY'}`)
      console.log(`   Preview: ${template.preview || 'NULL/EMPTY'}`)
      
      if (template.thumbnail) {
        const isBase64 = template.thumbnail.startsWith('data:image')
        const isURL = template.thumbnail.startsWith('http')
        const isEmpty = template.thumbnail.trim().length === 0
        
        console.log(`   - Type: ${isBase64 ? 'Base64' : isURL ? 'URL' : isEmpty ? 'Empty String' : 'Other'}`)
        console.log(`   - Length: ${template.thumbnail.length} characters`)
        
        if (isURL) {
          console.log(`   - URL Domain: ${new URL(template.thumbnail).hostname}`)
        }
      } else {
        console.log(`   - Status: MISSING (null or undefined)`)
      }
    })

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkThumbnails()

