/**
 * Expiry Service
 * Business logic for expiry calculation and status determination
 */

const { calculateRemainingDays, calculateStatus } = require('../utils/date.utils');

/**
 * Calculate expiry information for an item
 * @param {string} expiryDate - Expiry date in ISO format (YYYY-MM-DD)
 * @returns {object} Expiry information (remainingDays, status)
 */
const calculateExpiryInfo = (expiryDate) => {
  const remainingDays = calculateRemainingDays(expiryDate);
  const status = calculateStatus(remainingDays);

  return {
    remainingDays,
    status,
  };
};

/**
 * Get notification schedule times for an item
 * Returns array of dates when notifications should be sent (30, 15, 7, 1 days before expiry)
 * @param {string} expiryDate - Expiry date in ISO format (YYYY-MM-DD)
 * @returns {array} Array of notification times
 */
const getNotificationSchedule = (expiryDate) => {
  const expiry = new Date(expiryDate);
  expiry.setHours(9, 0, 0, 0); // Schedule notifications for 9 AM

  const notificationDays = [30, 15, 7, 1]; // Days before expiry
  const schedule = [];

  notificationDays.forEach((days) => {
    const notificationDate = new Date(expiry);
    notificationDate.setDate(notificationDate.getDate() - days);

    // Only schedule if notification date is in the future
    if (notificationDate > new Date()) {
      schedule.push({
        days,
        scheduledTime: notificationDate,
      });
    }
  });

  return schedule;
};

/**
 * Generate notification message for an item
 * @param {string} itemName - Item name
 * @param {number} daysUntilExpiry - Days until expiry
 * @param {string} itemType - Item type ('food_item' or 'document')
 * @returns {string} Notification message
 */
const generateNotificationMessage = (itemName, daysUntilExpiry, itemType = 'food_item') => {
  if (daysUntilExpiry === 1) {
    return `${itemName} expires tomorrow!`;
  } else if (daysUntilExpiry === 0) {
    return `${itemName} expires today!`;
  } else {
    return `${itemName} expires in ${daysUntilExpiry} days`;
  }
};

/**
 * Check if item should trigger immediate notification
 * @param {number} remainingDays - Days remaining until expiry
 * @returns {boolean} True if should notify immediately
 */
const shouldNotifyImmediately = (remainingDays) => {
  // Notify immediately if expiring today or tomorrow
  return remainingDays >= 0 && remainingDays <= 1;
};

module.exports = {
  calculateExpiryInfo,
  getNotificationSchedule,
  generateNotificationMessage,
  shouldNotifyImmediately,
};
