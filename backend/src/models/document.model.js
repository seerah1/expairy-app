/**
 * Document Model
 * Database queries for document operations
 */

const { query, transaction } = require('../config/database');

/**
 * Find all documents for a user
 * @param {number} userId - User ID
 * @param {object} filters - Filter options (status, type)
 * @param {object} pagination - Pagination options (page, limit, sort)
 * @returns {Promise<object>} Documents and pagination info
 */
const findByUserId = async (userId, filters = {}, pagination = {}) => {
  const { status, type, search } = filters;
  const { page = 1, limit = 50, sort = 'expiry_asc' } = pagination;

  let whereClause = 'WHERE user_id = $1';
  const params = [userId];
  let paramIndex = 2;

  if (status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (type) {
    whereClause += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (type ILIKE $${paramIndex} OR number ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Determine sort order
  let orderBy = 'ORDER BY expiry_date ASC';
  switch (sort) {
    case 'expiry_desc':
      orderBy = 'ORDER BY expiry_date DESC';
      break;
    case 'type_asc':
      orderBy = 'ORDER BY type ASC';
      break;
    case 'type_desc':
      orderBy = 'ORDER BY type DESC';
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
    `SELECT COUNT(*) as count FROM documents ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get paginated documents
  const offset = (page - 1) * limit;
  const documentsResult = await query(
    `SELECT id, user_id, type, number, expiry_date, issue_date, issuing_authority,
            notes, file_path, file_name, file_size, status, remaining_days, created_at, updated_at
     FROM documents
     ${whereClause}
     ${orderBy}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    documents: documentsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Find document by ID
 * @param {number} id - Document ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<object|null>} Document or null
 */
const findById = async (id, userId) => {
  const result = await query(
    `SELECT id, user_id, type, number, expiry_date, issue_date, issuing_authority,
            notes, file_path, file_name, file_size, status, remaining_days, created_at, updated_at
     FROM documents
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
};

/**
 * Create new document
 * @param {object} documentData - Document data
 * @returns {Promise<object>} Created document
 */
const create = async (documentData) => {
  const {
    userId,
    type,
    number,
    expiryDate,
    issueDate,
    issuingAuthority,
    notes,
    filePath,
    fileName,
    fileSize,
  } = documentData;

  const result = await query(
    `INSERT INTO documents (user_id, type, number, expiry_date, issue_date, issuing_authority,
                           notes, file_path, file_name, file_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, user_id, type, number, expiry_date, issue_date, issuing_authority,
               notes, file_path, file_name, file_size, status, remaining_days, created_at, updated_at`,
    [
      userId,
      type,
      number,
      expiryDate,
      issueDate,
      issuingAuthority,
      notes,
      filePath,
      fileName,
      fileSize,
    ]
  );

  return result.rows[0];
};

/**
 * Update document
 * @param {number} id - Document ID
 * @param {number} userId - User ID (for authorization)
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated document
 */
const update = async (id, userId, updates) => {
  const {
    type,
    number,
    expiryDate,
    issueDate,
    issuingAuthority,
    notes,
    filePath,
    fileName,
    fileSize,
  } = updates;

  const result = await query(
    `UPDATE documents
     SET type = COALESCE($1, type),
         number = COALESCE($2, number),
         expiry_date = COALESCE($3, expiry_date),
         issue_date = COALESCE($4, issue_date),
         issuing_authority = COALESCE($5, issuing_authority),
         notes = COALESCE($6, notes),
         file_path = COALESCE($7, file_path),
         file_name = COALESCE($8, file_name),
         file_size = COALESCE($9, file_size),
         updated_at = NOW()
     WHERE id = $10 AND user_id = $11
     RETURNING id, user_id, type, number, expiry_date, issue_date, issuing_authority,
               notes, file_path, file_name, file_size, status, remaining_days, created_at, updated_at`,
    [
      type,
      number,
      expiryDate,
      issueDate,
      issuingAuthority,
      notes,
      filePath,
      fileName,
      fileSize,
      id,
      userId,
    ]
  );

  return result.rows[0];
};

/**
 * Delete document
 * @param {number} id - Document ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<boolean>} True if deleted
 */
const deleteById = async (id, userId) => {
  const result = await query('DELETE FROM documents WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount > 0;
};

/**
 * Get documents expiring soon (within 30 days)
 * @param {number} userId - User ID
 * @returns {Promise<array>} Documents expiring soon
 */
const getExpiringSoon = async (userId) => {
  const result = await query(
    `SELECT id, user_id, type, number, expiry_date, issue_date, issuing_authority,
            notes, file_path, file_name, file_size, status, remaining_days, created_at, updated_at
     FROM documents
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
