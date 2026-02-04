/**
 * Food Items Routes
 * API routes for food item operations
 */

const express = require('express');
const router = express.Router();
const foodItemsController = require('../controllers/food-items.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  createFoodItemValidation,
  updateFoodItemValidation,
  foodItemIdValidation,
  listQueryValidation,
} = require('../validators/food-item.validator');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/food-items
 * @desc    Get all food items for authenticated user
 * @access  Private
 */
router.get('/', listQueryValidation, validate, foodItemsController.listFoodItems);

/**
 * @route   POST /api/food-items
 * @desc    Create new food item
 * @access  Private
 */
router.post('/', createFoodItemValidation, validate, foodItemsController.createFoodItem);

/**
 * @route   GET /api/food-items/:id
 * @desc    Get single food item by ID
 * @access  Private
 */
router.get('/:id', foodItemIdValidation, validate, foodItemsController.getFoodItem);

/**
 * @route   PUT /api/food-items/:id
 * @desc    Update food item
 * @access  Private
 */
router.put('/:id', updateFoodItemValidation, validate, foodItemsController.updateFoodItem);

/**
 * @route   DELETE /api/food-items/:id
 * @desc    Delete food item
 * @access  Private
 */
router.delete('/:id', foodItemIdValidation, validate, foodItemsController.deleteFoodItem);

module.exports = router;
