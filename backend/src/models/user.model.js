/**
 * User Model
 * Database queries for user operations
 */

const { query, transaction } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<object|null>} User object or null
 */
const findByEmail = async (email) => {
  const result = await query(
    'SELECT id, email, password_hash, role, status, created_at, updated_at, last_login_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<object|null>} User object or null
 */
const findById = async (id) => {
  const result = await query(
    'SELECT id, email, role, status, created_at, updated_at, last_login_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Create new user
 * @param {object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} userData.password - Plain text password
 * @returns {Promise<object>} Created user object
 */
const create = async ({ email, password }) => {
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
  const passwordHash = await bcrypt.hash(password, bcryptRounds);

  const result = await query(
    `INSERT INTO users (email, password_hash, role, status)
     VALUES ($1, $2, 'user', 'active')
     RETURNING id, email, role, status, created_at, updated_at`,
    [email, passwordHash]
  );

  return result.rows[0];
};

/**
 * Update user's last login timestamp
 * @param {number} id - User ID
 * @returns {Promise<void>}
 */
const updateLastLogin = async (id) => {
  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [id]
  );
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Check if email exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists
 */
const emailExists = async (email) => {
  const result = await query(
    'SELECT COUNT(*) as count FROM users WHERE email = $1',
    [email]
  );
  return parseInt(result.rows[0].count, 10) > 0;
};

/**
 * Update user status
 * @param {number} id - User ID
 * @param {string} status - New status ('active' or 'deactivated')
 * @returns {Promise<object>} Updated user object
 */
const updateStatus = async (id, status) => {
  const result = await query(
    `UPDATE users SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, role, status, created_at, updated_at, last_login_at`,
    [status, id]
  );
  return result.rows[0];
};

module.exports = {
  findByEmail,
  findById,
  create,
  updateLastLogin,
  verifyPassword,
  emailExists,
  updateStatus,
};
