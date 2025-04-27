import dotenv from 'dotenv';

dotenv.config();

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Get current log level from environment or default to INFO
const getCurrentLogLevel = () => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return LOG_LEVELS[envLevel];
  }
  // Default to WARN in production, INFO in development
  return process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;
};

const currentLogLevel = getCurrentLogLevel();

// Utility to check if we should log at a given level
const shouldLog = (level) => {
  return level <= currentLogLevel;
};

// Sanitize sensitive data from objects before logging
const sanitizeData = (data) => {
  if (!data) return data;

  // If it's not an object, return as is
  if (typeof data !== 'object') return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  // Clone the object to avoid modifying the original
  const sanitized = { ...data };

  // List of sensitive fields to mask
  const sensitiveFields = [
    'password', 'token', 'secret', 'jwt', 'auth', 'key', 'apiKey',
    'credential', 'pass', 'pwd', 'email_password', 'EMAIL_PASSWORD'
  ];

  // Mask sensitive fields
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();

    // Check if this is a sensitive field
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '****';
    }
    // Recursively sanitize nested objects
    else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
};

// Main logger functions
const logger = {
  error: (message, ...args) => {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(`[ERROR] ${message}`, ...args.map(arg => sanitizeData(arg)));
    }
  },

  warn: (message, ...args) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(`[WARN] ${message}`, ...args.map(arg => sanitizeData(arg)));
    }
  },

  info: (message, ...args) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(`[INFO] ${message}`, ...args.map(arg => sanitizeData(arg)));
    }
  },

  debug: (message, ...args) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(`[DEBUG] ${message}`, ...args.map(arg => sanitizeData(arg)));
    }
  },

  // Special method for request logging - only log path, not full URL
  request: (req) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      // Extract just the path part without query parameters for privacy
      const path = req.path || req.url.split('?')[0];
      console.log(`[REQUEST] ${req.method} ${path}`);
    }
  }
};

export default logger;
