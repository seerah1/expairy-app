require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256',
};

// Validate JWT configuration
if (process.env.NODE_ENV === 'production' && jwtConfig.secret === 'your-super-secret-jwt-key-change-this-in-production') {
  console.error('✗ CRITICAL: JWT_SECRET must be set in production environment');
  process.exit(1);
}

module.exports = jwtConfig;
