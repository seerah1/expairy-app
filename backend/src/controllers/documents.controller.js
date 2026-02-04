/**
 * Documents Controller
 * Handles HTTP requests for document operations
 */

const documentModel = require('../models/document.model');
const fileService = require('../services/file.service');
const notificationService = require('../services/notification.service');

/**
 * Get all documents for authenticated user
 * GET /api/documents
 */
const listDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      status: req.query.status,
      type: req.query.type,
      search: req.query.search,
    };
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      sort: req.query.sort || 'expiry_asc',
    };

    const result = await documentModel.findByUserId(userId, filters, pagination);

    res.json({
      success: true,
      data: result.documents,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new document
 * POST /api/documents
 */
const createDocument = async (req, res, next) => {
  try {
    console.log('Create document request body:', req.body);
    console.log('Create document file:', req.file);

    const userId = req.user.id;
    const { type, number, expiryDate, issueDate, issuingAuthority, notes } = req.body;

    // Handle file upload if present
    let fileData = {};
    if (req.file) {
      const savedFile = await fileService.saveFile(req.file, userId);
      fileData = {
        filePath: savedFile.filePath,
        fileName: savedFile.fileName,
        fileSize: savedFile.fileSize,
      };
    }

    // Create document
    const document = await documentModel.create({
      userId,
      type,
      number,
      expiryDate,
      issueDate,
      issuingAuthority,
      notes,
      ...fileData,
    });

    // Schedule notifications for the new document
    await notificationService.scheduleNotifications(document, 'document');

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document,
    });
  } catch (error) {
    // Clean up uploaded file if document creation fails
    if (req.file) {
      try {
        await fileService.deleteFile(req.file.filename);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    next(error);
  }
};

/**
 * Get single document by ID
 * GET /api/documents/:id
 */
const getDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documentId = parseInt(req.params.id);

    const document = await documentModel.findById(documentId, userId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update document
 * PUT /api/documents/:id
 */
const updateDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documentId = parseInt(req.params.id);
    const { type, number, expiryDate, issueDate, issuingAuthority, notes } = req.body;

    // Check if document exists
    const existingDocument = await documentModel.findById(documentId, userId);
    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Handle file replacement if new file uploaded
    let fileData = {};
    if (req.file) {
      // Delete old file if exists
      if (existingDocument.file_path) {
        await fileService.deleteFile(existingDocument.file_path);
      }

      // Save new file
      const savedFile = await fileService.saveFile(req.file, userId);
      fileData = {
        filePath: savedFile.filePath,
        fileName: savedFile.fileName,
        fileSize: savedFile.fileSize,
      };
    }

    // Update document
    const updatedDocument = await documentModel.update(documentId, userId, {
      type,
      number,
      expiryDate,
      issueDate,
      issuingAuthority,
      notes,
      ...fileData,
    });

    // If expiry date changed, reschedule notifications
    if (expiryDate && expiryDate !== existingDocument.expiry_date) {
      await notificationService.rescheduleNotifications(updatedDocument, 'document');
    }

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDocument,
    });
  } catch (error) {
    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        await fileService.deleteFile(req.file.filename);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    next(error);
  }
};

/**
 * Delete document
 * DELETE /api/documents/:id
 */
const deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documentId = parseInt(req.params.id);

    // Check if document exists
    const existingDocument = await documentModel.findById(documentId, userId);
    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete associated file if exists
    if (existingDocument.file_path) {
      await fileService.deleteFile(existingDocument.file_path);
    }

    // Cancel all notifications for this document
    await notificationService.cancelNotifications('document', documentId);

    // Delete document
    await documentModel.deleteById(documentId, userId);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download document file
 * GET /api/documents/:id/download
 */
const downloadFile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documentId = parseInt(req.params.id);

    // Check if document exists and belongs to user
    const document = await documentModel.findById(documentId, userId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check if document has a file
    if (!document.file_path) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this document',
      });
    }

    // Check if file exists
    const fileExists = await fileService.fileExists(document.file_path);
    if (!fileExists) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Get file path and send file
    const filePath = fileService.getFilePath(document.file_path);
    res.download(filePath, document.file_name, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file',
          });
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  downloadFile,
};
