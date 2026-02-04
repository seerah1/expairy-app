/**
 * Food Items Controller
 * Handles HTTP requests for food item operations
 */

const foodItemModel = require('../models/food-item.model');
const notificationService = require('../services/notification.service');

/**
 * Get all food items for authenticated user
 * GET /api/food-items
 */
const listFoodItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      status: req.query.status,
      category: req.query.category,
      storageType: req.query.storageType,
      search: req.query.search,
    };
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      sort: req.query.sort || 'expiry_asc',
    };

    const result = await foodItemModel.findByUserId(userId, filters, pagination);

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new food item
 * POST /api/food-items
 */
const createFoodItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, category, expiryDate, quantity, storageType } = req.body;

    // Create food item
    const foodItem = await foodItemModel.create({
      userId,
      name,
      category,
      expiryDate,
      quantity,
      storageType,
    });

    // Schedule notifications for the new item
    await notificationService.scheduleNotifications(foodItem, 'food_item');

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: foodItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single food item by ID
 * GET /api/food-items/:id
 */
const getFoodItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id);

    const foodItem = await foodItemModel.findById(itemId, userId);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    res.json({
      success: true,
      data: foodItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update food item
 * PUT /api/food-items/:id
 */
const updateFoodItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id);
    const { name, category, expiryDate, quantity, storageType } = req.body;

    // Check if item exists
    const existingItem = await foodItemModel.findById(itemId, userId);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    // Update food item
    const updatedItem = await foodItemModel.update(itemId, userId, {
      name,
      category,
      expiryDate,
      quantity,
      storageType,
    });

    // If expiry date changed, reschedule notifications
    if (expiryDate && expiryDate !== existingItem.expiry_date) {
      await notificationService.rescheduleNotifications(updatedItem, 'food_item');
    }

    res.json({
      success: true,
      message: 'Food item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete food item
 * DELETE /api/food-items/:id
 */
const deleteFoodItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id);

    // Check if item exists
    const existingItem = await foodItemModel.findById(itemId, userId);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    // Cancel all notifications for this item
    await notificationService.cancelNotifications('food_item', itemId);

    // Delete food item
    await foodItemModel.deleteById(itemId, userId);

    res.json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listFoodItems,
  createFoodItem,
  getFoodItem,
  updateFoodItem,
  deleteFoodItem,
};
