const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')
const http = require('http')
require('dotenv').config()

// Import database configuration
const { initializeDatabases } = require('./config/database')

// Import enhanced services
const RealtimeService = require('./services/realtimeService')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3001

// Initialize real-time service
const realtimeService = new RealtimeService(server)

// Import routes
const authRoutes = require('./routes/auth')
const resumeRoutes = require('./routes/resumes')
const templateRoutes = require('./routes/templates')
const userRoutes = require('./routes/users')
const adminRoutes = require('./routes/admin')
const simpleATSRoutes = require('./routes/simpleATS')

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/simple-ats', simpleATSRoutes) // Simple AI-powered ATS routes

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'))
  })
} else {
  // In development, handle React Router routes (but not API routes)
  app.get('/admin', (req, res) => {
    res.redirect('http://localhost:3000/admin')
  })
  
  app.get('/admin/login', (req, res) => {
    res.redirect('http://localhost:3000/admin/login')
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    })
  }
  
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  })
})

// Start server
const startServer = async () => {
  await initializeDatabases()
  
  server.listen(PORT, () => {
    console.log(`🚀 World-class server running on port ${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
    console.log(`🔌 WebSocket enabled for real-time updates`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`✨ Enhanced ATS system ready!`)
  })
}

startServer()

module.exports = app
