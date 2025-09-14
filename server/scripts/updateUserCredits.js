const mongoose = require('mongoose')
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') })

// Import User model
const User = require('../models/User')

const updateUserCredits = async () => {
  try {
    // Connect to MongoDB using the same configuration as the main app
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log('Connected to MongoDB')

    // Find all users that don't have credits field
    const usersToUpdate = await User.find({ credits: { $exists: false } })
    
    if (usersToUpdate.length === 0) {
      console.log('No users need to be updated')
      return
    }

    console.log(`Found ${usersToUpdate.length} users to update`)

    // Update all users to have 3 credits
    const result = await User.updateMany(
      { credits: { $exists: false } },
      { $set: { credits: 3 } }
    )

    console.log(`Updated ${result.modifiedCount} users with 3 credits each`)

    // Verify the update
    const updatedUsers = await User.find({ credits: { $exists: true } })
    console.log(`Total users with credits: ${updatedUsers.length}`)

    console.log('User credits update completed successfully')
  } catch (error) {
    console.error('Error updating user credits:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the script
updateUserCredits()
