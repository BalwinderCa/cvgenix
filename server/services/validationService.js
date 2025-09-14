const { ValidationError } = require('./errorService');
const loggerService = require('./loggerService');

class ValidationService {
  constructor() {
    this.logger = loggerService;
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new ValidationError('Please provide a valid email address');
    }
    return true;
  }

  // Validate password strength
  validatePassword(password) {
    if (!password) {
      throw new ValidationError('Password is required');
    }
    
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }
    
    if (password.length > 128) {
      throw new ValidationError('Password must be less than 128 characters');
    }
    
    // Optional: Add more password strength requirements
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumbers = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return true;
  }

  // Validate name fields
  validateName(name, fieldName = 'Name') {
    if (!name || typeof name !== 'string') {
      throw new ValidationError(`${fieldName} is required`);
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      throw new ValidationError(`${fieldName} must be at least 2 characters long`);
    }
    
    if (trimmedName.length > 50) {
      throw new ValidationError(`${fieldName} must be less than 50 characters`);
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmedName)) {
      throw new ValidationError(`${fieldName} contains invalid characters`);
    }
    
    return true;
  }

  // Validate MongoDB ObjectId
  validateObjectId(id, fieldName = 'ID') {
    if (!id) {
      throw new ValidationError(`${fieldName} is required`);
    }
    
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
      throw new ValidationError(`Invalid ${fieldName} format`);
    }
    
    return true;
  }

  // Validate file upload
  validateFileUpload(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      required = false
    } = options;

    if (required && !file) {
      throw new ValidationError('File is required');
    }

    if (file) {
      // Check file size
      if (file.size > maxSize) {
        throw new ValidationError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      }

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        throw new ValidationError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }

      // Check file extension
      const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        throw new ValidationError(`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
      }
    }

    return true;
  }

  // Validate pagination parameters
  validatePagination(page, limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    if (pageNum < 1) {
      throw new ValidationError('Page number must be greater than 0');
    }

    if (limitNum < 1 || limitNum > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    return { page: pageNum, limit: limitNum };
  }

  // Validate sort parameters
  validateSort(sortBy, allowedFields = []) {
    if (!sortBy) {
      return { sortBy: 'createdAt', sortOrder: -1 };
    }

    const [field, order] = sortBy.split(':');
    const sortOrder = order === 'asc' ? 1 : -1;

    if (allowedFields.length > 0 && !allowedFields.includes(field)) {
      throw new ValidationError(`Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`);
    }

    return { sortBy: field, sortOrder };
  }

  // Validate search query
  validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
      return '';
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 100) {
      throw new ValidationError('Search query must be less than 100 characters');
    }

    // Remove potentially dangerous characters
    const sanitizedQuery = trimmedQuery.replace(/[<>]/g, '');
    
    return sanitizedQuery;
  }

  // Validate URL
  validateUrl(url, fieldName = 'URL') {
    if (!url) {
      throw new ValidationError(`${fieldName} is required`);
    }

    try {
      new URL(url);
      return true;
    } catch (error) {
      throw new ValidationError(`Invalid ${fieldName} format`);
    }
  }

  // Validate phone number
  validatePhoneNumber(phone) {
    if (!phone) {
      return true; // Phone is optional
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      throw new ValidationError('Invalid phone number format');
    }

    return true;
  }

  // Validate date
  validateDate(date, fieldName = 'Date') {
    if (!date) {
      throw new ValidationError(`${fieldName} is required`);
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new ValidationError(`Invalid ${fieldName} format`);
    }

    return dateObj;
  }

  // Validate date range
  validateDateRange(startDate, endDate) {
    const start = this.validateDate(startDate, 'Start date');
    const end = this.validateDate(endDate, 'End date');

    if (start >= end) {
      throw new ValidationError('Start date must be before end date');
    }

    return { startDate: start, endDate: end };
  }

  // Validate array
  validateArray(array, fieldName = 'Array', options = {}) {
    const { minLength = 0, maxLength = 1000, required = false } = options;

    if (required && (!array || !Array.isArray(array))) {
      throw new ValidationError(`${fieldName} is required and must be an array`);
    }

    if (array && Array.isArray(array)) {
      if (array.length < minLength) {
        throw new ValidationError(`${fieldName} must have at least ${minLength} items`);
      }

      if (array.length > maxLength) {
        throw new ValidationError(`${fieldName} must have at most ${maxLength} items`);
      }
    }

    return true;
  }

  // Validate object
  validateObject(obj, fieldName = 'Object', required = false) {
    if (required && (!obj || typeof obj !== 'object' || Array.isArray(obj))) {
      throw new ValidationError(`${fieldName} is required and must be an object`);
    }

    if (obj && (typeof obj !== 'object' || Array.isArray(obj))) {
      throw new ValidationError(`${fieldName} must be an object`);
    }

    return true;
  }

  // Validate string length
  validateStringLength(str, fieldName = 'String', options = {}) {
    const { minLength = 0, maxLength = 1000, required = false } = options;

    if (required && (!str || typeof str !== 'string')) {
      throw new ValidationError(`${fieldName} is required`);
    }

    if (str && typeof str === 'string') {
      const trimmedStr = str.trim();
      if (trimmedStr.length < minLength) {
        throw new ValidationError(`${fieldName} must be at least ${minLength} characters long`);
      }

      if (trimmedStr.length > maxLength) {
        throw new ValidationError(`${fieldName} must be less than ${maxLength} characters`);
      }
    }

    return true;
  }

  // Validate numeric range
  validateNumericRange(num, fieldName = 'Number', options = {}) {
    const { min = 0, max = 1000000, required = false } = options;

    if (required && (num === undefined || num === null)) {
      throw new ValidationError(`${fieldName} is required`);
    }

    if (num !== undefined && num !== null) {
      const numValue = Number(num);
      if (isNaN(numValue)) {
        throw new ValidationError(`${fieldName} must be a valid number`);
      }

      if (numValue < min) {
        throw new ValidationError(`${fieldName} must be at least ${min}`);
      }

      if (numValue > max) {
        throw new ValidationError(`${fieldName} must be at most ${max}`);
      }
    }

    return true;
  }

  // Sanitize input
  sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }
    return input;
  }

  // Validate and sanitize request body
  validateRequestBody(body, schema) {
    const errors = [];
    const sanitizedBody = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      
      try {
        // Apply validation rules
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push({ field, message: `${rules.label || field} is required` });
          continue;
        }

        if (value !== undefined && value !== null && value !== '') {
          // Sanitize string values
          if (typeof value === 'string') {
            sanitizedBody[field] = this.sanitizeInput(value);
          } else {
            sanitizedBody[field] = value;
          }

          // Apply specific validations
          if (rules.type === 'email') {
            this.validateEmail(sanitizedBody[field]);
          } else if (rules.type === 'password') {
            this.validatePassword(sanitizedBody[field]);
          } else if (rules.type === 'name') {
            this.validateName(sanitizedBody[field], rules.label || field);
          } else if (rules.type === 'objectId') {
            this.validateObjectId(sanitizedBody[field], rules.label || field);
          } else if (rules.type === 'url') {
            this.validateUrl(sanitizedBody[field], rules.label || field);
          } else if (rules.type === 'phone') {
            this.validatePhoneNumber(sanitizedBody[field]);
          } else if (rules.type === 'date') {
            sanitizedBody[field] = this.validateDate(sanitizedBody[field], rules.label || field);
          } else if (rules.type === 'array') {
            this.validateArray(sanitizedBody[field], rules.label || field, rules.options);
          } else if (rules.type === 'object') {
            this.validateObject(sanitizedBody[field], rules.label || field, rules.required);
          } else if (rules.type === 'string') {
            this.validateStringLength(sanitizedBody[field], rules.label || field, rules.options);
          } else if (rules.type === 'number') {
            this.validateNumericRange(sanitizedBody[field], rules.label || field, rules.options);
          }
        }
      } catch (error) {
        errors.push({ field, message: error.message });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    return sanitizedBody;
  }
}

// Create singleton instance
const validationService = new ValidationService();

module.exports = validationService;
