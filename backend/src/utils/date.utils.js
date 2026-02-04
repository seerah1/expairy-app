/**
 * Date utility functions for backend
 */

/**
 * Calculate remaining days until expiry
 * @param {string} expiryDate - Expiry date in ISO format (YYYY-MM-DD)
 * @returns {number} Number of days remaining (negative if expired)
 */
const calculateRemainingDays = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Calculate status based on remaining days
 * @param {number} remainingDays - Number of days remaining
 * @returns {string} Status: 'Expired', 'Expiring Soon', or 'Safe'
 */
const calculateStatus = (remainingDays) => {
  if (remainingDays < 0) {
    return 'Expired';
  } else if (remainingDays <= 7) {
    return 'Expiring Soon';
  } else {
    return 'Safe';
  }
};

/**
 * Format date to ISO format (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} ISO formatted date string
 */
const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Validate date string format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidDateString = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Check if date is in the past
 * @param {string} dateString - Date string in ISO format
 * @returns {boolean} True if date is in the past
 */
const isDateInPast = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  return date < today;
};

module.exports = {
  calculateRemainingDays,
  calculateStatus,
  formatDateToISO,
  isValidDateString,
  isDateInPast,
};
