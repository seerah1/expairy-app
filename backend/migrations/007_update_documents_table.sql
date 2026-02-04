-- Migration: 007_update_documents_table.sql
-- Description: Update documents table to match Phase 6 implementation requirements
-- Adds missing columns and updates document type constraints

-- Add missing columns
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS issue_date DATE,
ADD COLUMN IF NOT EXISTS issuing_authority VARCHAR(200),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

-- Drop old type constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;

-- Add updated type constraint with correct document types
ALTER TABLE documents
ADD CONSTRAINT documents_type_check CHECK (type IN (
  'Passport',
  'Driver License',
  'ID Card',
  'Visa',
  'Insurance',
  'Vehicle Registration',
  'Health Card',
  'Professional License',
  'Membership Card',
  'Other'
));

-- Add comment
COMMENT ON COLUMN documents.issue_date IS 'Date when the document was issued';
COMMENT ON COLUMN documents.issuing_authority IS 'Authority that issued the document';
COMMENT ON COLUMN documents.notes IS 'Additional notes about the document';
COMMENT ON COLUMN documents.file_name IS 'Original filename of uploaded document';
