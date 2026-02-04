-- Migration: 004_create_notifications_table.sql
-- Description: Create notifications table for tracking scheduled and delivered push notifications

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('food_item', 'document')),
  item_id INTEGER NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_message TEXT NOT NULL,
  delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN (
    'pending', 'sent', 'failed'
  )),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_scheduled_time ON notifications(scheduled_time);
CREATE INDEX idx_notifications_delivery_status ON notifications(delivery_status);
CREATE INDEX idx_notifications_item ON notifications(item_type, item_id);

-- Add comment
COMMENT ON TABLE notifications IS 'Scheduled and delivered push notifications for items and documents';
