/**
 * Food Item Validators
 * Request validation rules for food item endpoints
 */

const { body, param, query } = require('express-validator');

const VALID_CATEGORIES = [
  'Dairy',
  'Meat',
  'Vegetables',
  'Fruits',
  'Grains',
  'Beverages',
  'Condiments',
  'Frozen',
  'Canned',
  'Other',
];

const VALID_STORAGE_TYPES = ['Refrigerator', 'Freezer', 'Pantry', 'Counter'];

const VALID_STATUSES = ['Expired', 'Expiring Soon', 'Safe'];

/**
 * Validation rules for creating food item
 */
const createFoodItemValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Expiry date must be in ISO format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return true;
    }),

  body('quantity')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Quantity must be less than 100 characters'),

  body('storageType')
    .notEmpty()
    .withMessage('Storage type is required')
    .isIn(VALID_STORAGE_TYPES)
    .withMessage(`Storage type must be one of: ${VALID_STORAGE_TYPES.join(', ')}`),
];

/**
 * Validation rules for updating food item
 */
const updateFoodItemValidation = [
  param('id').isInt().withMessage('Invalid food item ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),

  body('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be in ISO format (YYYY-MM-DD)'),

  body('quantity')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Quantity must be less than 100 characters'),

  body('storageType')
    .optional()
    .isIn(VALID_STORAGE_TYPES)
    .withMessage(`Storage type must be one of: ${VALID_STORAGE_TYPES.join(', ')}`),
];

/**
 * Validation rules for food item ID parameter
 */
const foodItemIdValidation = [param('id').isInt().withMessage('Invalid food item ID')];

/**
 * Validation rules for list query parameters
 */
const listQueryValidation = [
  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  query('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  query('storageType')
    .optional()
    .isIn(VALID_STORAGE_TYPES)
    .withMessage(`Storage type must be one of: ${VALID_STORAGE_TYPES.join(', ')}`),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['expiry_asc', 'expiry_desc', 'name_asc', 'name_desc', 'created_asc', 'created_desc'])
    .withMessage('Invalid sort option'),
];

module.exports = {
  createFoodItemValidation,
  updateFoodItemValidation,
  foodItemIdValidation,
  listQueryValidation,
};
