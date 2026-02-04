-- Migration: 002_create_food_items_table.sql
-- Description: Create food_items table for tracking food with expiry dates

CREATE TABLE food_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'Dairy', 'Meat', 'Vegetables', 'Fruits', 'Grains',
    'Beverages', 'Condiments', 'Frozen', 'Canned', 'Other'
  )),
  expiry_date DATE NOT NULL,
  quantity VARCHAR(100),
  storage_type VARCHAR(50) NOT NULL CHECK (storage_type IN (
    'Refrigerator', 'Freezer', 'Pantry', 'Counter'
  )),
  status VARCHAR(20) NOT NULL DEFAULT 'Safe' CHECK (status IN (
    'Expired', 'Expiring Soon', 'Safe'
  )),
  remaining_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_food_items_user_id ON food_items(user_id);
CREATE INDEX idx_food_items_expiry_date ON food_items(expiry_date);
CREATE INDEX idx_food_items_status ON food_items(status);
CREATE INDEX idx_food_items_user_expiry ON food_items(user_id, expiry_date);

-- Add comment
COMMENT ON TABLE food_items IS 'Food items with expiry dates and tracking information';
