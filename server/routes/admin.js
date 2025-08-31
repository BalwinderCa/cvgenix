const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const User = require('../models/User')
const Template = require('../models/Template')
const Settings = require('../models/Settings')
const Resume = require('../models/Resume')

// Apply admin authentication to all routes
router.use(adminAuth)

// Dashboard Overview with enhanced analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic stats
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const totalTemplates = await Template.countDocuments()
    const activeTemplates = await Template.countDocuments({ isActive: true })
    const totalResumes = await Resume.countDocuments()
    
    // Get recent users with more details
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-password')
    
    // Get recent templates
    const recentTemplates = await Template.find()
      .sort({ createdAt: -1 })
      .limit(10)
    
    // Get user growth data for charts
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ])

    // Get subscription distribution
    const subscriptionStats = await User.aggregate([
      { $group: { _id: "$subscription.plan", count: { $sum: 1 } } }
    ])

    // Get template usage stats
    const templateUsage = await Template.aggregate([
      { $match: { usageCount: { $gt: 0 } } },
      { $sort: { usageCount: -1 } },
      { $limit: 10 }
    ])

    // Get revenue metrics (mock data for now)
    const revenueMetrics = {
      monthlyRevenue: 12500,
      monthlyGrowth: 15.5,
      totalRevenue: 89000,
      averageRevenuePerUser: 29.99
    }

    // Get system health metrics
    const systemHealth = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: 0 // Would need to implement connection tracking
    }

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalTemplates,
        activeTemplates,
        totalResumes,
        conversionRate: ((activeUsers / totalUsers) * 100).toFixed(2)
      },
      recentUsers,
      recentTemplates,
      userGrowth,
      subscriptionStats,
      templateUsage,
      revenueMetrics,
      systemHealth
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ message: 'Failed to fetch dashboard data' })
  }
})

// Enhanced User Management with better filtering and pagination
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      role = '', 
      status = '', 
      subscription = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query
    
    const query = {}
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Filters
    if (role) query.role = role
    if (status) query.isActive = status === 'active'
    if (subscription) query['subscription.plan'] = subscription

    // Sorting
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    // Get additional stats for the filtered results
    const stats = await User.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          premiumUsers: { $sum: { $cond: [{ $eq: ['$subscription.plan', 'pro'] }, 1, 0] } },
          standardUsers: { $sum: { $cond: [{ $eq: ['$subscription.plan', 'standard'] }, 1, 0] } },
          freeUsers: { $sum: { $cond: [{ $eq: ['$subscription.plan', 'free'] }, 1, 0] } }
        }
      }
    ])

    res.json({
      users,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      },
      stats: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0,
        standardUsers: 0,
        freeUsers: 0
      }
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// Enhanced user update with validation
router.put('/users/:id', async (req, res) => {
  try {
    const { role, isActive, subscription, firstName, lastName, email } = req.body
    
    // Validate role
    if (role && !['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    // Validate subscription plan
    if (subscription?.plan && !['free', 'standard', 'pro'].includes(subscription.plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' })
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } })
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' })
      }
    }

    const updateData = {}
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    if (subscription) updateData.subscription = subscription
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (email) updateData.email = email

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    res.json({
      message: 'User updated successfully',
      user
    })
  } catch (error) {
    console.error('User update error:', error)
    res.status(500).json({ message: 'Failed to update user' })
  }
})

// Enhanced user deletion with cascade protection
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Prevent deletion of super_admin users
    if (user.role === 'super_admin') {
      return res.status(403).json({ message: 'Cannot delete super admin users' })
    }

    // Delete associated resumes
    await Resume.deleteMany({ user: req.params.id })
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id)
    
    res.json({ message: 'User and associated data deleted successfully' })
  } catch (error) {
    console.error('User deletion error:', error)
    res.status(500).json({ message: 'Failed to delete user' })
  }
})

// Enhanced Template Management
router.get('/templates', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category = '', 
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query
    
    const query = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    if (category) query.category = category
    if (status) query.isActive = status === 'active'

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const templates = await Template.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Template.countDocuments(query)

    // Get template statistics
    const stats = await Template.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalTemplates: { $sum: 1 },
          activeTemplates: { $sum: { $cond: ['$isActive', 1, 0] } },
          premiumTemplates: { $sum: { $cond: ['$isPremium', 1, 0] } },
          totalUsage: { $sum: '$usageCount' },
          averageRating: { $avg: '$rating.average' }
        }
      }
    ])

    res.json({
      templates,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      },
      stats: stats[0] || {
        totalTemplates: 0,
        activeTemplates: 0,
        premiumTemplates: 0,
        totalUsage: 0,
        averageRating: 0
      }
    })
  } catch (error) {
    console.error('Templates fetch error:', error)
    res.status(500).json({ message: 'Failed to fetch templates' })
  }
})

// Enhanced template creation
router.post('/templates', async (req, res) => {
  try {
    const template = new Template(req.body)
    await template.save()
    
    res.status(201).json({
      message: 'Template created successfully',
      template
    })
  } catch (error) {
    console.error('Template creation error:', error)
    res.status(500).json({ message: 'Failed to create template' })
  }
})

// Enhanced template update
router.put('/templates/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }
    
    res.json({
      message: 'Template updated successfully',
      template
    })
  } catch (error) {
    console.error('Template update error:', error)
    res.status(500).json({ message: 'Failed to update template' })
  }
})

// Enhanced template deletion
router.delete('/templates/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Check if template is being used
    const resumeCount = await Resume.countDocuments({ template: req.params.id })
    if (resumeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete template. It is being used by ${resumeCount} resumes.` 
      })
    }

    await Template.findByIdAndDelete(req.params.id)
    res.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Template deletion error:', error)
    res.status(500).json({ message: 'Failed to delete template' })
  }
})

// Enhanced Settings Management
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne()
    if (!settings) {
      settings = new Settings()
      await settings.save()
    }
    res.json(settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    res.status(500).json({ message: 'Failed to fetch settings' })
  }
})

router.put('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne()
    if (!settings) {
      settings = new Settings()
    }
    
    Object.assign(settings, req.body)
    await settings.save()
    
    res.json({
      message: 'Settings updated successfully',
      settings
    })
  } catch (error) {
    console.error('Settings update error:', error)
    res.status(500).json({ message: 'Failed to update settings' })
  }
})

// Enhanced Analytics with more detailed metrics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query
    
    let dateFilter = {}
    const now = new Date()
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        break
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        break
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
        break
      case '1y':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) }
        break
    }

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Template usage statistics
    const templateUsage = await Template.aggregate([
      { $match: { usageCount: { $gt: 0 } } },
      { $sort: { usageCount: -1 } },
      { $limit: 20 }
    ])

    // Subscription distribution
    const subscriptionStats = await User.aggregate([
      { $group: { _id: "$subscription.plan", count: { $sum: 1 } } }
    ])

    // User activity by role
    const userActivityByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ])

    // Template categories distribution
    const templateCategories = await Template.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ])

    // Revenue metrics (mock data - would integrate with payment processor)
    const revenueMetrics = {
      monthlyRevenue: 12500,
      monthlyGrowth: 15.5,
      totalRevenue: 89000,
      averageRevenuePerUser: 29.99,
      churnRate: 2.3,
      customerLifetimeValue: 450
    }

    // System performance metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: 0
    }

    res.json({
      userRegistrations,
      templateUsage,
      subscriptionStats,
      userActivityByRole,
      templateCategories,
      revenueMetrics,
      systemMetrics
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ message: 'Failed to fetch analytics' })
  }
})

// New endpoint for system health monitoring
router.get('/system/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    }

    // Check database connection
    try {
      await User.findOne().limit(1)
      health.database = 'connected'
    } catch (error) {
      health.database = 'disconnected'
      health.status = 'degraded'
    }

    res.json(health)
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

// New endpoint for bulk operations
router.post('/users/bulk', async (req, res) => {
  try {
    const { action, userIds, data } = req.body

    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Invalid request parameters' })
    }

    let result
    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: true }
        )
        break
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: false }
        )
        break
      case 'delete':
        result = await User.deleteMany({ _id: { $in: userIds } })
        break
      default:
        return res.status(400).json({ message: 'Invalid action' })
    }

    res.json({
      message: `Bulk operation '${action}' completed successfully`,
      affectedCount: result.modifiedCount || result.deletedCount
    })
  } catch (error) {
    console.error('Bulk operation error:', error)
    res.status(500).json({ message: 'Failed to perform bulk operation' })
  }
})

module.exports = router
