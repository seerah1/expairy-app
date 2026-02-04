/**
 * Notification Model
 * Database queries for notification tracking
 */

const { query } = require('../config/database');

/**
 * Create notification record
 * @param {object} notificationData - Notification data
 * @returns {Promise<object>} Created notification
 */
const create = async (notificationData) => {
  const { userId, itemType, itemId, scheduledTime, message } = notificationData;

  const result = await query(
    `INSERT INTO notifications (user_id, item_type, item_id, scheduled_time, notification_message, delivery_status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING id, user_id, item_type, item_id, scheduled_time, notification_message, delivery_status, created_at`,
    [userId, itemType, itemId, scheduledTime, message]
  );

  return result.rows[0];
};

/**
 * Find notifications for an item
 * @param {string} itemType - Item type ('food_item' or 'document')
 * @param {number} itemId - Item ID
 * @returns {Promise<array>} Notifications for the item
 */
const findByItem = async (itemType, itemId) => {
  const result = await query(
    `SELECT id, user_id, item_type, item_id, scheduled_time, notification_message, delivery_status, delivered_at, created_at
     FROM notifications
     WHERE item_type = $1 AND item_id = $2
     ORDER BY scheduled_time ASC`,
    [itemType, itemId]
  );
  return result.rows;
};

/**
 * Delete notifications for an item
 * @param {string} itemType - Item type ('food_item' or 'document')
 * @param {number} itemId - Item ID
 * @returns {Promise<number>} Number of deleted notifications
 */
const deleteByItem = async (itemType, itemId) => {
  const result = await query(
    'DELETE FROM notifications WHERE item_type = $1 AND item_id = $2',
    [itemType, itemId]
  );
  return result.rowCount;
};

/**
 * Update notification delivery status
 * @param {number} id - Notification ID
 * @param {string} status - Delivery status ('sent' or 'failed')
 * @returns {Promise<object>} Updated notification
 */
const updateDeliveryStatus = async (id, status) => {
  const result = await query(
    `UPDATE notifications
     SET delivery_status = $1, delivered_at = NOW()
     WHERE id = $2
     RETURNING id, user_id, item_type, item_id, scheduled_time, notification_message, delivery_status, delivered_at, created_at`,
    [status, id]
  );
  return result.rows[0];
};

/**
 * Get notification history for user
 * @param {number} userId - User ID
 * @param {number} limit - Number of notifications to retrieve
 * @returns {Promise<array>} Recent notifications
 */
const getHistory = async (userId, limit = 50) => {
  const result = await query(
    `SELECT id, user_id, item_type, item_id, scheduled_time, notification_message, delivery_status, delivered_at, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

module.exports = {
  create,
  findByItem,
  deleteByItem,
  updateDeliveryStatus,
  getHistory,
};
