const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const helmet = require('helmet');
const loggerService = require('../services/loggerService');
const { errorService } = require('../services/errorService');

class SecurityMiddleware {
  constructor() {
    this.logger = loggerService;
    this.errorService = errorService;
  }

  // Enhanced rate limiting
  createRateLimit(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000 / 60) // minutes
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      handler: (req, res) => {
        this.logger.security('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.url,
          method: req.method
        });
        
        res.status(429).json({
          success: false,
          message: 'Too many requests from this IP, please try again later.',
          retryAfter: Math.ceil(options.windowMs / 1000 / 60)
        });
      }
    };

    return rateLimit({ ...defaultOptions, ...options });
  }

  // Strict rate limiting for sensitive endpoints
  createStrictRateLimit() {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // limit each IP to 50 requests per windowMs (increased for development)
      message: {
        success: false,
        message: 'Too many attempts, please try again later.',
        retryAfter: 15
      }
    });
  }

  // Speed limiting (slow down requests)
  createSpeedLimit(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 50, // allow 50 requests per 15 minutes, then...
      delayMs: () => 500, // begin adding 500ms of delay per request above 50
      maxDelayMs: 20000, // max delay of 20 seconds
      skipSuccessfulRequests: true, // don't count successful requests
      skipFailedRequests: false // count failed requests
    };

    return slowDown({ ...defaultOptions, ...options });
  }

  // MongoDB injection protection
  mongoSanitize() {
    return mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        this.logger.security('MongoDB injection attempt blocked', {
          ip: req.ip,
          key,
          url: req.url,
          method: req.method
        });
      }
    });
  }

  // XSS protection
  xssProtection() {
    return xss({
      onSanitize: (req, key, value) => {
        this.logger.security('XSS attempt blocked', {
          ip: req.ip,
          key,
          value: value.substring(0, 100), // Log first 100 chars
          url: req.url,
          method: req.method
        });
      }
    });
  }

  // HTTP Parameter Pollution protection
  hppProtection() {
    return hpp({
      whitelist: ['sort', 'order', 'page', 'limit', 'search'] // Allow these parameters
    });
  }

  // Enhanced Helmet configuration
  helmetConfig() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["'self'", "blob:"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  // Request size limiting
  requestSizeLimit() {
    return (req, res, next) => {
      const contentLength = parseInt(req.get('content-length') || '0');
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (contentLength > maxSize) {
        this.logger.security('Request size limit exceeded', {
          ip: req.ip,
          contentLength,
          maxSize,
          url: req.url,
          method: req.method
        });

        return res.status(413).json({
          success: false,
          message: 'Request entity too large'
        });
      }

      next();
    };
  }

  // IP whitelist/blacklist
  ipFilter(whitelist = [], blacklist = []) {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Check blacklist first
      if (blacklist.length > 0 && blacklist.includes(clientIP)) {
        this.logger.security('Blocked IP access attempt', {
          ip: clientIP,
          reason: 'blacklisted',
          url: req.url,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check whitelist if provided
      if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
        this.logger.security('Non-whitelisted IP access attempt', {
          ip: clientIP,
          reason: 'not_whitelisted',
          url: req.url,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      next();
    };
  }

  // Request validation middleware
  validateRequest(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        this.logger.security('Request validation failed', {
          ip: req.ip,
          errors,
          url: req.url,
          method: req.method
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      req.body = value;
      next();
    };
  }

  // File upload security
  fileUploadSecurity() {
    return (req, res, next) => {
      if (req.files) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of req.files) {
          // Check file type
          if (!allowedTypes.includes(file.mimetype)) {
            this.logger.security('Invalid file type upload attempt', {
              ip: req.ip,
              mimetype: file.mimetype,
              originalname: file.originalname,
              url: req.url
            });

            return res.status(400).json({
              success: false,
              message: 'Invalid file type'
            });
          }

          // Check file size
          if (file.size > maxSize) {
            this.logger.security('File size limit exceeded', {
              ip: req.ip,
              size: file.size,
              maxSize,
              originalname: file.originalname,
              url: req.url
            });

            return res.status(400).json({
              success: false,
              message: 'File too large'
            });
          }

          // Check for suspicious file names
          const suspiciousPatterns = [
            /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i,
            /\.(php|asp|jsp|py|rb|pl|sh)$/i,
            /\.(sql|db|sqlite)$/i
          ];

          if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
            this.logger.security('Suspicious file upload attempt', {
              ip: req.ip,
              originalname: file.originalname,
              mimetype: file.mimetype,
              url: req.url
            });

            return res.status(400).json({
              success: false,
              message: 'File type not allowed'
            });
          }
        }
      }

      next();
    };
  }

  // CORS security
  corsSecurity() {
    return (req, res, next) => {
      const origin = req.get('Origin');
      const allowedOrigins = [
        'http://localhost:3000',
        'https://localhost:3000',
        process.env.FRONTEND_URL
      ].filter(Boolean);

      if (origin && !allowedOrigins.includes(origin)) {
        this.logger.security('CORS violation attempt', {
          ip: req.ip,
          origin,
          url: req.url,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'CORS policy violation'
        });
      }

      next();
    };
  }

  // Security headers middleware
  securityHeaders() {
    return (req, res, next) => {
      // Remove server header
      res.removeHeader('X-Powered-By');
      
      // Add custom security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      next();
    };
  }

  // Request logging for security monitoring
  securityLogging() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log suspicious patterns
      const suspiciousPatterns = [
        /\.\./, // Directory traversal
        /<script/i, // XSS attempts
        /union.*select/i, // SQL injection
        /javascript:/i, // JavaScript injection
        /onload=/i, // Event handler injection
        /eval\(/i, // Code injection
        /document\.cookie/i, // Cookie access attempts
        /window\.location/i // Redirect attempts
      ];

      const url = req.url.toLowerCase();
      const userAgent = req.get('User-Agent') || '';
      const body = JSON.stringify(req.body || {}).toLowerCase();

      const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(url) || pattern.test(userAgent) || pattern.test(body)
      );

      if (isSuspicious) {
        this.logger.security('Suspicious request detected', {
          ip: req.ip,
          url: req.url,
          method: req.method,
          userAgent,
          body: body.substring(0, 500), // Log first 500 chars
          timestamp: new Date().toISOString()
        });
      }

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        
        // Log high response times
        if (duration > 5000) { // 5 seconds
          loggerService.warn('Slow response detected', {
            ip: req.ip,
            url: req.url,
            method: req.method,
            duration: `${duration}ms`,
            statusCode: res.statusCode
          });
        }

        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  // Initialize all security middleware
  initialize() {
    // Removed verbose initialization log
    return {
      rateLimit: this.createRateLimit(),
      strictRateLimit: this.createStrictRateLimit(),
      speedLimit: this.createSpeedLimit(),
      mongoSanitize: this.mongoSanitize(),
      xssProtection: this.xssProtection(),
      hppProtection: this.hppProtection(),
      helmetConfig: this.helmetConfig(),
      requestSizeLimit: this.requestSizeLimit(),
      fileUploadSecurity: this.fileUploadSecurity(),
      corsSecurity: this.corsSecurity(),
      securityHeaders: this.securityHeaders(),
      securityLogging: this.securityLogging()
    };
  }
}

// Create singleton instance
const securityMiddleware = new SecurityMiddleware();

module.exports = securityMiddleware;
