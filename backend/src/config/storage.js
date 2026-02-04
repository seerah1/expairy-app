require('dotenv').config();

const storageConfig = {
  provider: process.env.STORAGE_PROVIDER || 's3',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET,
  },
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ],
};

// Validate storage configuration in production
if (process.env.NODE_ENV === 'production' && storageConfig.provider === 's3') {
  if (!storageConfig.aws.accessKeyId || !storageConfig.aws.secretAccessKey || !storageConfig.aws.bucket) {
    console.error('✗ CRITICAL: AWS credentials and bucket must be configured for file storage in production');
    process.exit(1);
  }
}

module.exports = storageConfig;
