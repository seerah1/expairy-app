-- Migration: 003_create_documents_table.sql
-- Description: Create documents table for tracking important documents with expiry dates

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'Passport', 'Driver License', 'ID Card', 'Insurance Policy',
    'Medical Record', 'Visa', 'Vehicle Registration',
    'Professional License', 'Other'
  )),
  number VARCHAR(100) NOT NULL,
  expiry_date DATE NOT NULL,
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'Safe' CHECK (status IN (
    'Expired', 'Expiring Soon', 'Safe'
  )),
  remaining_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_user_expiry ON documents(user_id, expiry_date);
CREATE INDEX idx_documents_type ON documents(type);

-- Add comment
COMMENT ON TABLE documents IS 'Important documents with expiry dates and optional file attachments';
