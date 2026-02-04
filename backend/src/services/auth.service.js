/**
 * Authentication Service
 * Business logic for authentication operations
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const userModel = require('../models/user.model');

/**
 * Generate JWT token for user
 * @param {object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: jwtConfig.algorithm,
  });
};

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User and token
 */
const register = async (email, password) => {
  // Check if email already exists
  const exists = await userModel.emailExists(email);
  if (exists) {
    const error = new Error('This email is already registered. Please log in or use a different email.');
    error.statusCode = 409;
    throw error;
  }

  // Create user
  const user = await userModel.create({ email, password });

  // Generate token
  const token = generateToken(user);

  // Update last login
  await userModel.updateLastLogin(user.id);

  return { user, token };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User and token
 */
const login = async (email, password) => {
  // Find user by email
  const user = await userModel.findByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if account is deactivated
  if (user.status === 'deactivated') {
    const error = new Error('Account has been deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  // Verify password
  const isValidPassword = await userModel.verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Remove password_hash from user object
  delete user.password_hash;

  // Generate token
  const token = generateToken(user);

  // Update last login
  await userModel.updateLastLogin(user.id);

  return { user, token };
};

/**
 * Get user profile
 * @param {number} userId - User ID
 * @returns {Promise<object>} User object
 */
const getProfile = async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  generateToken,
  register,
  login,
  getProfile,
};
