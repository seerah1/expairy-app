/**
 * Validation utility functions for backend
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Must be at least 8 characters with uppercase, lowercase, and number
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  return {
    isValid: true,
    message: 'Password is valid',
  };
};

/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim();
};

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} True if file size is within limit
 */
const isValidFileSize = (fileSize, maxSize = 10 * 1024 * 1024) => {
  return fileSize <= maxSize;
};

/**
 * Validate MIME type
 * @param {string} mimeType - MIME type to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if MIME type is allowed
 */
const isValidMimeType = (mimeType, allowedTypes) => {
  return allowedTypes.includes(mimeType);
};

module.exports = {
  isValidEmail,
  validatePassword,
  sanitizeString,
  isValidFileSize,
  isValidMimeType,
};
