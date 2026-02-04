/**
 * Notification Service
 * Business logic for notification scheduling and management
 */

const notificationModel = require('../models/notification.model');
const expiryService = require('./expiry.service');

/**
 * Schedule notifications for an item
 * Creates notification records for 30, 15, 7, and 1 days before expiry
 * @param {object} item - Item object (food item or document)
 * @param {string} itemType - Item type ('food_item' or 'document')
 * @returns {Promise<array>} Created notification records
 */
const scheduleNotifications = async (item, itemType) => {
  const schedule = expiryService.getNotificationSchedule(item.expiry_date || item.expiryDate);
  const notifications = [];

  for (const { days, scheduledTime } of schedule) {
    const message = expiryService.generateNotificationMessage(
      item.name || `${item.type} - ${item.number}`,
      days,
      itemType
    );

    const notification = await notificationModel.create({
      userId: item.user_id || item.userId,
      itemType,
      itemId: item.id,
      scheduledTime,
      message,
    });

    notifications.push(notification);
  }

  return notifications;
};

/**
 * Cancel all notifications for an item
 * @param {string} itemType - Item type ('food_item' or 'document')
 * @param {number} itemId - Item ID
 * @returns {Promise<number>} Number of cancelled notifications
 */
const cancelNotifications = async (itemType, itemId) => {
  return notificationModel.deleteByItem(itemType, itemId);
};

/**
 * Reschedule notifications for an item
 * Cancels existing notifications and creates new ones
 * @param {object} item - Updated item object
 * @param {string} itemType - Item type ('food_item' or 'document')
 * @returns {Promise<array>} New notification records
 */
const rescheduleNotifications = async (item, itemType) => {
  // Cancel existing notifications
  await cancelNotifications(itemType, item.id);

  // Schedule new notifications
  return scheduleNotifications(item, itemType);
};

/**
 * Mark notification as delivered
 * @param {number} notificationId - Notification ID
 * @param {string} status - Delivery status ('sent' or 'failed')
 * @returns {Promise<object>} Updated notification
 */
const markAsDelivered = async (notificationId, status = 'sent') => {
  return notificationModel.updateDeliveryStatus(notificationId, status);
};

/**
 * Get notification history for user
 * @param {number} userId - User ID
 * @param {number} limit - Number of notifications to retrieve
 * @returns {Promise<array>} Recent notifications
 */
const getHistory = async (userId, limit = 50) => {
  return notificationModel.getHistory(userId, limit);
};

module.exports = {
  scheduleNotifications,
  cancelNotifications,
  rescheduleNotifications,
  markAsDelivered,
  getHistory,
};
