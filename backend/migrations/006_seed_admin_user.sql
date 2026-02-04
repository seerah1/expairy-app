-- Migration: 006_seed_admin_user.sql
-- Description: Seed initial admin user for system management

-- Insert default admin user
-- Email: admin@expirytracker.com
-- Password: Admin123! (hashed with bcrypt, 12 rounds)
-- Note: Change this password immediately after first login in production
INSERT INTO users (email, password_hash, role, status)
VALUES (
  'admin@expirytracker.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Add comment
COMMENT ON TABLE users IS 'Default admin user created with email: admin@expirytracker.com, password: Admin123!';
