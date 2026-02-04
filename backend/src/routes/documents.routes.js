/**
 * Documents Routes
 * API routes for document operations
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  createDocumentValidation,
  updateDocumentValidation,
  documentIdValidation,
  listQueryValidation,
} = require('../validators/document.validator');

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and DOC files are allowed.'));
    }
  },
});

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/documents
 * @desc    Get all documents for authenticated user
 * @access  Private
 */
router.get('/', listQueryValidation, validate, documentsController.listDocuments);

/**
 * @route   POST /api/documents
 * @desc    Create new document with optional file upload
 * @access  Private
 */
router.post(
  '/',
  upload.single('file'),
  createDocumentValidation,
  validate,
  documentsController.createDocument
);

/**
 * @route   GET /api/documents/:id
 * @desc    Get single document by ID
 * @access  Private
 */
router.get('/:id', documentIdValidation, validate, documentsController.getDocument);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document with optional file replacement
 * @access  Private
 */
router.put(
  '/:id',
  upload.single('file'),
  updateDocumentValidation,
  validate,
  documentsController.updateDocument
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document and associated file
 * @access  Private
 */
router.delete('/:id', documentIdValidation, validate, documentsController.deleteDocument);

/**
 * @route   GET /api/documents/:id/download
 * @desc    Download document file
 * @access  Private
 */
router.get('/:id/download', documentIdValidation, validate, documentsController.downloadFile);

module.exports = router;
