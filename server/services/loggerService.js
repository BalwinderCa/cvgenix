const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development - simplified
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Only show essential info in development
    if (level === 'info' && Object.keys(meta).length > 0) {
      // Skip verbose info logs with metadata in development
      return '';
    }
    let msg = `${timestamp} [${level}]: ${message}`;
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'resume-builder-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test'
    }),
    
    // Error log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // Combined log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    }),
    
    // Access log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Add custom log levels
logger.add(new winston.transports.Console({
  level: 'http',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
}));

// Custom logging methods
class LoggerService {
  constructor() {
    this.logger = logger;
  }

  // Standard logging methods
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // HTTP request logging
  http(message, meta = {}) {
    this.logger.http(message, meta);
  }

  // Security events
  security(event, meta = {}) {
    this.logger.warn(`SECURITY: ${event}`, {
      ...meta,
      type: 'security',
      timestamp: new Date().toISOString()
    });
  }

  // Performance logging
  performance(operation, duration, meta = {}) {
    this.logger.info(`PERFORMANCE: ${operation}`, {
      ...meta,
      type: 'performance',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }

  // Database operations
  database(operation, meta = {}) {
    this.logger.debug(`DATABASE: ${operation}`, {
      ...meta,
      type: 'database',
      timestamp: new Date().toISOString()
    });
  }

  // API operations
  api(method, endpoint, statusCode, duration, meta = {}) {
    const level = statusCode >= 400 ? 'error' : 'info';
    this.logger[level](`API: ${method} ${endpoint}`, {
      ...meta,
      type: 'api',
      method,
      endpoint,
      statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }

  // User actions
  userAction(userId, action, meta = {}) {
    this.logger.info(`USER_ACTION: ${action}`, {
      ...meta,
      type: 'user_action',
      userId,
      action,
      timestamp: new Date().toISOString()
    });
  }

  // Business logic events
  business(event, meta = {}) {
    this.logger.info(`BUSINESS: ${event}`, {
      ...meta,
      type: 'business',
      timestamp: new Date().toISOString()
    });
  }

  // Error with context
  errorWithContext(error, context = {}) {
    this.logger.error(error.message, {
      ...context,
      type: 'error',
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.http('Request received', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        
        // Log response
        logger.http('Response sent', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userId: req.user?.id
        });

        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  // Get log statistics
  getStats() {
    return {
      level: this.logger.level,
      transports: this.logger.transports.length,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

// Create singleton instance
const loggerService = new LoggerService();

module.exports = loggerService;
