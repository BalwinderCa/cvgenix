const mongoose = require('mongoose')

// MongoDB Configuration
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me')
    console.log(`📦 Database connected`)
    return conn
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

// Initialize database
const initializeDatabases = async () => {
  await connectMongoDB()
  // Database initialization complete
}

module.exports = {
  mongoose,
  connectMongoDB,
  initializeDatabases
}
