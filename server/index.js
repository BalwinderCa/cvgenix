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

// Import Swagger documentation
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require('./config/swagger')

// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-12345'
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://resume4me:resume4me123@cluster0.vrkl6u1.mongodb.net/resume4me?retryWrites=true&w=majority'
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
const adminRoutes = require('./routes/admin')
const simpleATSRoutes = require('./routes/simpleATS')
const atsRoutes = require('./routes/ats')
const fileRoutes = require('./routes/files')
const emailRoutes = require('./routes/emails')
const dashboardRoutes = require('./routes/dashboard')
const coverLetterRoutes = require('./routes/coverLetters')
const resumeSharingRoutes = require('./routes/resumeSharing')

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

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Custom request logging
app.use(loggerService.requestLogger())

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))

// API documentation JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

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
app.use('/api/admin', adminRoutes)
app.use('/api/simple-ats', simpleATSRoutes)
app.use('/api/ats', atsRoutes)
app.use('/api/progress', require('./routes/progress')) // Simple progress tracking
app.use('/api/ai', require('./routes/ai')) // AI services routes
app.use('/api/files', security.fileUploadSecurity, require('./routes/files')) // File upload security
app.use('/api/emails', require('./routes/emails')) // Original email routes
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/cover-letters', coverLetterRoutes)
app.use('/api/resume-sharing', resumeSharingRoutes)
app.use('/api/analytics', require('./routes/analytics'))
app.use('/api/jobs', require('./routes/jobMatching'))
app.use('/api/resume-scoring', require('./routes/resumeScoring'))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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
