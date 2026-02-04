/**
 * File Service
 * Handles file upload, download, and storage operations
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Storage configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
  return `${timestamp}-${randomString}-${baseName}${ext}`;
};

/**
 * Validate file
 * @param {object} file - File object from multer
 * @throws {Error} If file is invalid
 */
const validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error(
      `File type ${file.mimetype} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }
};

/**
 * Save uploaded file
 * @param {object} file - File object from multer
 * @param {number} userId - User ID for organizing files
 * @returns {Promise<object>} File information
 */
const saveFile = async (file, userId) => {
  validateFile(file);
  await ensureUploadDir();

  // Create user-specific directory
  const userDir = path.join(UPLOAD_DIR, `user_${userId}`);
  try {
    await fs.access(userDir);
  } catch {
    await fs.mkdir(userDir, { recursive: true });
  }

  // Generate unique filename and save
  const uniqueFilename = generateUniqueFilename(file.originalname);
  const filePath = path.join(userDir, uniqueFilename);

  // Move file from temp location to permanent storage
  await fs.writeFile(filePath, file.buffer);

  return {
    filePath: path.relative(UPLOAD_DIR, filePath),
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  };
};

/**
 * Get file path for download
 * @param {string} relativePath - Relative file path
 * @returns {string} Absolute file path
 */
const getFilePath = (relativePath) => {
  return path.join(UPLOAD_DIR, relativePath);
};

/**
 * Check if file exists
 * @param {string} relativePath - Relative file path
 * @returns {Promise<boolean>} True if file exists
 */
const fileExists = async (relativePath) => {
  try {
    const fullPath = getFilePath(relativePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Delete file
 * @param {string} relativePath - Relative file path
 * @returns {Promise<boolean>} True if deleted
 */
const deleteFile = async (relativePath) => {
  try {
    const fullPath = getFilePath(relativePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Get file info
 * @param {string} relativePath - Relative file path
 * @returns {Promise<object>} File information
 */
const getFileInfo = async (relativePath) => {
  const fullPath = getFilePath(relativePath);
  const stats = await fs.stat(fullPath);

  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  };
};

module.exports = {
  saveFile,
  getFilePath,
  fileExists,
  deleteFile,
  getFileInfo,
  validateFile,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
};
