const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')
const http = require('http')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

// Import error handling and logging
require('express-async-errors')
const { errorService } = require('./services/errorService')
const loggerService = require('./services/loggerService')
const securityMiddleware = require('./middleware/security')

// Swagger removed - not needed

// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-12345'
// MongoDB Atlas cloud database - no local fallback
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required. Please set it in your .env file.')
  process.exit(1)
}
process.env.PORT = process.env.PORT || 3001
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// Import database configuration
const { initializeDatabases } = require('./config/database')

// Import enhanced services
const RealtimeService = require('./services/realtimeService')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3001

// Initialize error handling and logging
errorService.initialize()

// Initialize real-time service
const realtimeService = new RealtimeService(server)

// Import routes
const authRoutes = require('./routes/auth')
const resumeRoutes = require('./routes/resumes')
const enhancedTemplateRoutes = require('./routes/enhancedTemplates')
const userRoutes = require('./routes/users')
const atsRoutes = require('./routes/ats')
const resumeSharingRoutes = require('./routes/resumeSharing')
const companySettingsRoutes = require('./routes/companySettings')

// Initialize security middleware
const security = securityMiddleware.initialize()

// Security middleware (order matters!)
app.use(security.helmetConfig) // Helmet security headers
app.use(security.securityHeaders) // Custom security headers
app.use(security.requestSizeLimit) // Request size limiting
app.use(security.mongoSanitize) // MongoDB injection protection
app.use(security.xssProtection) // XSS protection
app.use(security.hppProtection) // HTTP Parameter Pollution protection
app.use(security.securityLogging) // Security monitoring

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://cvgenix.com',
    'https://www.cvgenix.com'
  ],
  credentials: true,
}))

// Rate limiting
app.use('/api/', security.rateLimit) // General rate limiting
app.use('/api/auth/login', security.strictRateLimit) // Strict rate limiting for login
app.use('/api/auth/signup', security.strictRateLimit) // Strict rate limiting for signup
app.use('/api/auth/forgot-password', security.strictRateLimit) // Strict rate limiting for password reset

// Speed limiting
app.use(security.speedLimit)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
app.use(compression())

// Logging middleware (disabled for cleaner console output)
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'))
// } else {
//   app.use(morgan('combined'))
// }

// Custom request logging (disabled for cleaner console output)
// app.use(loggerService.requestLogger())

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
app.use('/api/templates', enhancedTemplateRoutes) // Enhanced templates routes (includes basic templates)
app.use('/api/users', userRoutes)
app.use('/api/ats', atsRoutes)
app.use('/api/progress', require('./routes/progress')) // Simple progress tracking
app.use('/api/payments', require('./routes/payments'))
app.use('/api/faqs', require('./routes/faqs')) // FAQ routes
app.use('/api/resumes/sharing', resumeSharingRoutes) // Resume sharing routes
app.use('/api/company-settings', companySettingsRoutes) // Company settings routes
app.use('/api/support', require('./routes/support')) // Support/Contact form routes

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, '../frontend/public/favicon.ico')
  const fs = require('fs')
  if (fs.existsSync(faviconPath)) {
    res.sendFile(faviconPath)
  } else {
    res.status(204).end() // No Content
  }
})

// Handle API docs route (Swagger was removed)
app.get('/api-docs', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API documentation endpoint has been removed. Please refer to the API routes directly.',
    availableEndpoints: {
      health: '/api/health',
      auth: '/api/auth',
      resumes: '/api/resumes',
      templates: '/api/templates',
      users: '/api/users',
      ats: '/api/ats',
      payments: '/api/payments'
    }
  })
})

// Handle root route
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, this should be handled by static file serving
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'))
  } else {
    // In development, provide API info
    res.json({
      message: 'CVGenix API Server',
      status: 'running',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        resumes: '/api/resumes',
        templates: '/api/templates',
        users: '/api/users',
        ats: '/api/ats',
        payments: '/api/payments'
      },
      note: 'Frontend is running separately. Visit http://localhost:3000 for the web application.'
    })
  }
})

// Suppress automated requests (Chrome DevTools, etc.)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end() // No Content
})

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

// 404 handler (must be before error handler)
app.use(errorService.notFoundHandler())

// Global error handler (must be last)
app.use(errorService.globalErrorHandler())

// Start server
const startServer = async () => {
  await initializeDatabases()
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

startServer()

module.exports = app
