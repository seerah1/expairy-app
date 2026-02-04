/**
 * Document Validators
 * Request validation rules for document endpoints
 */

const { body, param, query } = require('express-validator');

const VALID_DOCUMENT_TYPES = [
  'Passport',
  'Driver License',
  'ID Card',
  'Visa',
  'Insurance',
  'Vehicle Registration',
  'Health Card',
  'Professional License',
  'Membership Card',
  'Other',
];

const VALID_STATUSES = ['Expired', 'Expiring Soon', 'Safe'];

/**
 * Validation rules for creating document
 */
const createDocumentValidation = [
  body('type')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(VALID_DOCUMENT_TYPES)
    .withMessage(`Document type must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`),

  body('number')
    .trim()
    .notEmpty()
    .withMessage('Document number is required')
    .isLength({ max: 100 })
    .withMessage('Document number must be less than 100 characters'),

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

  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('Issue date must be in ISO format (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.body.expiryDate) {
        const issueDate = new Date(value);
        const expiryDate = new Date(req.body.expiryDate);
        if (issueDate >= expiryDate) {
          throw new Error('Issue date must be before expiry date');
        }
      }
      return true;
    }),

  body('issuingAuthority')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Issuing authority must be less than 255 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

/**
 * Validation rules for updating document
 */
const updateDocumentValidation = [
  param('id').isInt().withMessage('Invalid document ID'),

  body('type')
    .optional()
    .isIn(VALID_DOCUMENT_TYPES)
    .withMessage(`Document type must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`),

  body('number')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Document number cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Document number must be less than 100 characters'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be in ISO format (YYYY-MM-DD)'),

  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('Issue date must be in ISO format (YYYY-MM-DD)'),

  body('issuingAuthority')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Issuing authority must be less than 255 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

/**
 * Validation rules for document ID parameter
 */
const documentIdValidation = [param('id').isInt().withMessage('Invalid document ID')];

/**
 * Validation rules for list query parameters
 */
const listQueryValidation = [
  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  query('type')
    .optional()
    .isIn(VALID_DOCUMENT_TYPES)
    .withMessage(`Type must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['expiry_asc', 'expiry_desc', 'type_asc', 'type_desc', 'created_asc', 'created_desc'])
    .withMessage('Invalid sort option'),
];

module.exports = {
  createDocumentValidation,
  updateDocumentValidation,
  documentIdValidation,
  listQueryValidation,
  VALID_DOCUMENT_TYPES,
};
