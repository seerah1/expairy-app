-- Migration: 005_create_views_and_functions.sql
-- Description: Create database views and trigger functions for automatic status calculation

-- Create view for unified expiring items
CREATE VIEW v_expiring_items AS
SELECT
  'food_item' AS item_type,
  fi.id,
  fi.user_id,
  fi.name AS item_name,
  fi.category AS item_category,
  fi.expiry_date,
  fi.status,
  fi.remaining_days,
  fi.created_at
FROM food_items fi
UNION ALL
SELECT
  'document' AS item_type,
  d.id,
  d.user_id,
  d.type || ' - ' || d.number AS item_name,
  d.type AS item_category,
  d.expiry_date,
  d.status,
  d.remaining_days,
  d.created_at
FROM documents d;

-- Create function to automatically update status and remaining_days
CREATE OR REPLACE FUNCTION update_item_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate remaining days (DATE - DATE returns integer in PostgreSQL)
  NEW.remaining_days := (NEW.expiry_date - CURRENT_DATE);

  -- Update status based on remaining days
  IF NEW.remaining_days < 0 THEN
    NEW.status := 'Expired';
  ELSIF NEW.remaining_days <= 7 THEN
    NEW.status := 'Expiring Soon';
  ELSE
    NEW.status := 'Safe';
  END IF;

  -- Update timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for food_items
CREATE TRIGGER trigger_update_food_item_status
BEFORE INSERT OR UPDATE OF expiry_date ON food_items
FOR EACH ROW
EXECUTE FUNCTION update_item_status();

-- Create trigger for documents
CREATE TRIGGER trigger_update_document_status
BEFORE INSERT OR UPDATE OF expiry_date ON documents
FOR EACH ROW
EXECUTE FUNCTION update_item_status();

-- Add comments
COMMENT ON VIEW v_expiring_items IS 'Unified view of all expiring items (food + documents) for dashboard';
COMMENT ON FUNCTION update_item_status() IS 'Automatically calculate and update status and remaining_days when expiry_date changes';
