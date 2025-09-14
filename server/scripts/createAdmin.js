const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') })

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume4me')
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@cvgenix.com' })
    if (existingAdmin) {
      console.log('Admin user already exists')
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@cvgenix.com',
      password: hashedPassword,
      role: 'super_admin',
      subscription: {
        plan: 'pro',
        status: 'active'
      },
      isActive: true
    })

    await adminUser.save()
    console.log('Admin user created successfully!')
    console.log('Email: admin@cvgenix.com')
    console.log('Password: admin123')
    console.log('Role: super_admin')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

createAdminUser()
