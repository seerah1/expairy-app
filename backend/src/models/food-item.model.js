/**
 * Food Item Model
 * Database queries for food item operations
 */

const { query, transaction } = require('../config/database');

/**
 * Find all food items for a user
 * @param {number} userId - User ID
 * @param {object} filters - Filter options (status, category, storageType)
 * @param {object} pagination - Pagination options (page, limit, sort)
 * @returns {Promise<object>} Food items and pagination info
 */
const findByUserId = async (userId, filters = {}, pagination = {}) => {
  const { status, category, storageType, search } = filters;
  const { page = 1, limit = 50, sort = 'expiry_asc' } = pagination;

  let whereClause = 'WHERE user_id = $1';
  const params = [userId];
  let paramIndex = 2;

  if (status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (category) {
    whereClause += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (storageType) {
    whereClause += ` AND storage_type = $${paramIndex}`;
    params.push(storageType);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND name ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Determine sort order
  let orderBy = 'ORDER BY expiry_date ASC';
  switch (sort) {
    case 'expiry_desc':
      orderBy = 'ORDER BY expiry_date DESC';
      break;
    case 'name_asc':
      orderBy = 'ORDER BY name ASC';
      break;
    case 'name_desc':
      orderBy = 'ORDER BY name DESC';
      break;
    case 'created_asc':
      orderBy = 'ORDER BY created_at ASC';
      break;
    case 'created_desc':
      orderBy = 'ORDER BY created_at DESC';
      break;
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as count FROM food_items ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get paginated items
  const offset = (page - 1) * limit;
  const itemsResult = await query(
    `SELECT id, user_id, name, category, expiry_date, quantity, storage_type, status, remaining_days, created_at, updated_at
     FROM food_items
     ${whereClause}
     ${orderBy}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    items: itemsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Find food item by ID
 * @param {number} id - Food item ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<object|null>} Food item or null
 */
const findById = async (id, userId) => {
  const result = await query(
    `SELECT id, user_id, name, category, expiry_date, quantity, storage_type, status, remaining_days, created_at, updated_at
     FROM food_items
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
};

/**
 * Create new food item
 * @param {object} itemData - Food item data
 * @returns {Promise<object>} Created food item
 */
const create = async (itemData) => {
  const { userId, name, category, expiryDate, quantity, storageType } = itemData;

  const result = await query(
    `INSERT INTO food_items (user_id, name, category, expiry_date, quantity, storage_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, name, category, expiry_date, quantity, storage_type, status, remaining_days, created_at, updated_at`,
    [userId, name, category, expiryDate, quantity, storageType]
  );

  return result.rows[0];
};

/**
 * Update food item
 * @param {number} id - Food item ID
 * @param {number} userId - User ID (for authorization)
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated food item
 */
const update = async (id, userId, updates) => {
  const { name, category, expiryDate, quantity, storageType } = updates;

  const result = await query(
    `UPDATE food_items
     SET name = COALESCE($1, name),
         category = COALESCE($2, category),
         expiry_date = COALESCE($3, expiry_date),
         quantity = COALESCE($4, quantity),
         storage_type = COALESCE($5, storage_type),
         updated_at = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING id, user_id, name, category, expiry_date, quantity, storage_type, status, remaining_days, created_at, updated_at`,
    [name, category, expiryDate, quantity, storageType, id, userId]
  );

  return result.rows[0];
};

/**
 * Delete food item
 * @param {number} id - Food item ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<boolean>} True if deleted
 */
const deleteById = async (id, userId) => {
  const result = await query(
    'DELETE FROM food_items WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rowCount > 0;
};

/**
 * Get food items expiring soon (within 7 days)
 * @param {number} userId - User ID
 * @returns {Promise<array>} Food items expiring soon
 */
const getExpiringSoon = async (userId) => {
  const result = await query(
    `SELECT id, user_id, name, category, expiry_date, quantity, storage_type, status, remaining_days, created_at, updated_at
     FROM food_items
     WHERE user_id = $1 AND status = 'Expiring Soon'
     ORDER BY expiry_date ASC`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  findByUserId,
  findById,
  create,
  update,
  deleteById,
  getExpiringSoon,
};
