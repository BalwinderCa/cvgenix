const mongoose = require('mongoose')

// MongoDB Configuration
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

// Initialize database
const initializeDatabases = async () => {
  await connectMongoDB()
  console.log('✅ Database connected successfully')
}

module.exports = {
  mongoose,
  connectMongoDB,
  initializeDatabases
}
