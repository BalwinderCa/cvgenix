require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') })
const mongoose = require('mongoose')
const Template = require('../models/Template')

async function countTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Count all templates
    const totalCount = await Template.countDocuments({})
    
    // Count active templates
    const activeCount = await Template.countDocuments({ isActive: true })
    
    // Count inactive templates
    const inactiveCount = await Template.countDocuments({ isActive: false })
    
    // Count by category
    const categoryCounts = await Template.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])
    
    // Count premium templates
    const premiumCount = await Template.countDocuments({ isPremium: true })
    
    // Count popular templates
    const popularCount = await Template.countDocuments({ isPopular: true })

    console.log('\n📊 Template Statistics:')
    console.log('='.repeat(50))
    console.log(`Total Templates: ${totalCount}`)
    console.log(`  - Active: ${activeCount}`)
    console.log(`  - Inactive: ${inactiveCount}`)
    console.log(`  - Premium: ${premiumCount}`)
    console.log(`  - Popular: ${popularCount}`)
    console.log('\n📁 Templates by Category:')
    categoryCounts.forEach(item => {
      console.log(`  - ${item._id || 'No Category'}: ${item.count}`)
    })
    console.log('='.repeat(50))

    // Get sample template names
    const sampleTemplates = await Template.find({})
      .select('name category isActive isPremium')
      .limit(10)
      .sort({ createdAt: -1 })

    if (sampleTemplates.length > 0) {
      console.log('\n📝 Sample Templates (latest 10):')
      sampleTemplates.forEach(template => {
        const status = template.isActive ? '✓' : '✗'
        const premium = template.isPremium ? '⭐' : ''
        console.log(`  ${status} ${premium} ${template.name} (${template.category})`)
      })
    }

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

countTemplates()

