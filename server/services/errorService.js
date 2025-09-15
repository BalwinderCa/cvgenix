const loggerService = require('./loggerService');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
    this.type = 'validation';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.type = 'authentication';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.type = 'authorization';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.type = 'not_found';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.type = 'conflict';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.type = 'rate_limit';
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
    this.type = 'database';
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service error') {
    super(`${service}: ${message}`, 502);
    this.type = 'external_service';
    this.service = service;
  }
}

// Error handling service
class ErrorService {
  constructor() {
    this.logger = loggerService;
  }

  // Handle different types of errors
  handleError(error, req = null) {
    // Log error with context
    this.logError(error, req);
    
    // Return appropriate response
    return this.formatErrorResponse(error);
  }

  // Log error with context
  logError(error, req = null) {
    const context = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode || 500
      }
    };

    if (req) {
      context.request = {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id,
        body: req.body,
        query: req.query,
        params: req.params
      };
    }

    if (error.isOperational) {
      this.logger.warn('Operational error occurred', context);
    } else {
      this.logger.error('Unexpected error occurred', context);
    }
  }

  // Format error response for client
  formatErrorResponse(error) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Default error response
    let response = {
      success: false,
      message: error.message || 'Something went wrong',
      type: error.type || 'error'
    };

    // Add additional fields for specific error types
    if (error instanceof ValidationError && error.errors) {
      response.errors = error.errors;
    }

    // Add stack trace in development
    if (isDevelopment && error.stack) {
      response.stack = error.stack;
    }

    // Add error code for client handling
    if (error.statusCode) {
      response.statusCode = error.statusCode;
    }

    return {
      statusCode: error.statusCode || 500,
      response
    };
  }

  // Handle Mongoose validation errors
  handleMongooseValidationError(error) {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));

    return new ValidationError('Validation failed', errors);
  }

  // Handle Mongoose duplicate key errors
  handleMongooseDuplicateKeyError(error) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return new ConflictError(`${field} '${value}' already exists`);
  }

  // Handle Mongoose cast errors
  handleMongooseCastError(error) {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`);
  }

  // Handle JWT errors
  handleJWTError() {
    return new AuthenticationError('Invalid token');
  }

  handleJWTExpiredError() {
    return new AuthenticationError('Token expired');
  }

  // Handle file upload errors
  handleFileUploadError(error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new ValidationError('File too large');
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return new ValidationError('Too many files');
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return new ValidationError('Unexpected file field');
    }
    return new AppError('File upload failed', 400);
  }

  // Handle rate limit errors
  handleRateLimitError() {
    return new RateLimitError('Too many requests, please try again later');
  }

  // Handle database connection errors
  handleDatabaseError(error) {
    this.logger.error('Database error', { error: error.message });
    return new DatabaseError('Database operation failed');
  }

  // Handle external API errors
  handleExternalAPIError(service, error) {
    this.logger.error(`External API error: ${service}`, { 
      error: error.message,
      service 
    });
    return new ExternalServiceError(service, error.message);
  }

  // Async error wrapper
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Global error handler middleware
  globalErrorHandler() {
    return (error, req, res, next) => {
      let err = error;

      // Handle specific error types
      if (error.name === 'ValidationError') {
        err = this.handleMongooseValidationError(error);
      } else if (error.code === 11000) {
        err = this.handleMongooseDuplicateKeyError(error);
      } else if (error.name === 'CastError') {
        err = this.handleMongooseCastError(error);
      } else if (error.name === 'JsonWebTokenError') {
        err = this.handleJWTError();
      } else if (error.name === 'TokenExpiredError') {
        err = this.handleJWTExpiredError();
      } else if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT') {
        err = this.handleFileUploadError(error);
      } else if (error.statusCode === 429) {
        err = this.handleRateLimitError();
      } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
        err = this.handleDatabaseError(error);
      } else if (!error.isOperational) {
        // Unknown error - don't leak error details
        err = new AppError('Something went wrong', 500);
      }

      // Handle the error
      const { statusCode, response } = this.handleError(err, req);
      
      // Check if response has already been sent
      if (!res.headersSent) {
        res.status(statusCode).json(response);
      }
    };
  }

  // 404 handler
  notFoundHandler() {
    return (req, res, next) => {
      const error = new NotFoundError(`Route ${req.originalUrl} not found`);
      next(error);
    };
  }

  // Unhandled promise rejection handler
  handleUnhandledRejection() {
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Promise Rejection', {
        reason: reason.message || reason,
        stack: reason.stack,
        promise: promise.toString()
      });
      
      // Close server gracefully
      process.exit(1);
    });
  }

  // Uncaught exception handler
  handleUncaughtException() {
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
      
      // Close server gracefully
      process.exit(1);
    });
  }

  // Initialize error handlers
  initialize() {
    this.handleUnhandledRejection();
    this.handleUncaughtException();
    // Removed verbose initialization log
  }
}

// Create singleton instance
const errorService = new ErrorService();

module.exports = {
  errorService,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError
};
