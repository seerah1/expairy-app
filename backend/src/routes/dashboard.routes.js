/**
 * Dashboard Routes
 * API routes for dashboard statistics and overview
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get dashboard overview with statistics and upcoming items
 * @access  Private
 */
router.get('/overview', dashboardController.getOverview);

/**
 * @route   GET /api/dashboard/statistics
 * @desc    Get detailed statistics
 * @access  Private
 */
router.get('/statistics', dashboardController.getStatistics);

module.exports = router;
