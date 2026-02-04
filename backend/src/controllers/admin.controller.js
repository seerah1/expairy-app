/**
 * Admin Controller
 * Handles administrative operations for user and system management
 */

const userModel = require('../models/user.model');
const foodItemModel = require('../models/food-item.model');
const documentModel = require('../models/document.model');

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
const listUsers = async (req, res, next) => {
  try {
    const { search, status, role, page = 1, limit = 50, sort = 'created_desc' } = req.query;

    // Build query
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND email ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    // Determine sort order
    let orderBy = 'ORDER BY created_at DESC';
    switch (sort) {
      case 'created_asc':
        orderBy = 'ORDER BY created_at ASC';
        break;
      case 'email_asc':
        orderBy = 'ORDER BY email ASC';
        break;
      case 'email_desc':
        orderBy = 'ORDER BY email DESC';
        break;
      case 'last_login_desc':
        orderBy = 'ORDER BY last_login_at DESC NULLS LAST';
        break;
    }

    // Get total count
    const { query } = require('../config/database');
    const countResult = await query(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated users
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const usersResult = await query(
      `SELECT id, email, role, status, created_at, updated_at, last_login_at
       FROM users
       ${whereClause}
       ${orderBy}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: usersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user details with their items
 * GET /api/admin/users/:id
 */
const getUserDetails = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // Get user info
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's food items
    const foodResult = await foodItemModel.findByUserId(userId, {}, { limit: 1000 });
    const foodItems = foodResult.items;

    // Get user's documents
    const docResult = await documentModel.findByUserId(userId, {}, { limit: 1000 });
    const documents = docResult.documents;

    // Calculate statistics
    const statistics = {
      totalFoodItems: foodItems.length,
      totalDocuments: documents.length,
      expiredFoodItems: foodItems.filter((item) => item.status === 'Expired').length,
      expiredDocuments: documents.filter((doc) => doc.status === 'Expired').length,
      expiringSoonFoodItems: foodItems.filter((item) => item.status === 'Expiring Soon').length,
      expiringSoonDocuments: documents.filter((doc) => doc.status === 'Expiring Soon').length,
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLoginAt: user.last_login_at,
        },
        statistics,
        recentFoodItems: foodItems.slice(0, 5),
        recentDocuments: documents.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (activate/deactivate)
 * PUT /api/admin/users/:id/status
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "active" or "inactive"',
      });
    }

    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user.id && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    // Update user status
    const { query } = require('../config/database');
    const result = await query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role, status, updated_at',
      [status, userId]
    );

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system-wide statistics
 * GET /api/admin/statistics
 */
const getSystemStatistics = async (req, res, next) => {
  try {
    const { query } = require('../config/database');

    // Get user statistics
    const userStats = await query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
        COUNT(*) FILTER (WHERE role = 'user') as regular_users,
        COUNT(*) FILTER (WHERE status = 'active') as active_users,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_users,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_week,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month
      FROM users
    `);

    // Get food items statistics
    const foodStats = await query(`
      SELECT
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE status = 'Expired') as expired_items,
        COUNT(*) FILTER (WHERE status = 'Expiring Soon') as expiring_soon_items,
        COUNT(*) FILTER (WHERE status = 'Safe') as safe_items,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_items_week,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_items_month
      FROM food_items
    `);

    // Get documents statistics
    const docStats = await query(`
      SELECT
        COUNT(*) as total_documents,
        COUNT(*) FILTER (WHERE status = 'Expired') as expired_documents,
        COUNT(*) FILTER (WHERE status = 'Expiring Soon') as expiring_soon_documents,
        COUNT(*) FILTER (WHERE status = 'Safe') as safe_documents,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_documents_week,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_documents_month
      FROM documents
    `);

    // Get most active users (by item count)
    const activeUsers = await query(`
      SELECT
        u.id,
        u.email,
        u.role,
        COUNT(DISTINCT fi.id) as food_items_count,
        COUNT(DISTINCT d.id) as documents_count,
        COUNT(DISTINCT fi.id) + COUNT(DISTINCT d.id) as total_items
      FROM users u
      LEFT JOIN food_items fi ON u.id = fi.user_id
      LEFT JOIN documents d ON u.id = d.user_id
      GROUP BY u.id, u.email, u.role
      ORDER BY total_items DESC
      LIMIT 10
    `);

    // Get category distribution
    const categoryDist = await query(`
      SELECT category, COUNT(*) as count
      FROM food_items
      GROUP BY category
      ORDER BY count DESC
    `);

    // Get document type distribution
    const docTypeDist = await query(`
      SELECT type, COUNT(*) as count
      FROM documents
      GROUP BY type
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        users: userStats.rows[0],
        foodItems: foodStats.rows[0],
        documents: docStats.rows[0],
        mostActiveUsers: activeUsers.rows,
        categoryDistribution: categoryDist.rows,
        documentTypeDistribution: docTypeDist.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  getUserDetails,
  updateUserStatus,
  getSystemStatistics,
};
