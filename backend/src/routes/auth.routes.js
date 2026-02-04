/**
 * Authentication Routes
 * API routes for authentication endpoints
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../validators/auth.validator');
const { validate } = require('../middleware/validation.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rate-limit.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  authRateLimiter,
  registerValidation,
  validate,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter,
  loginValidation,
  validate,
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authMiddleware,
  authController.getProfile
);

module.exports = router;
