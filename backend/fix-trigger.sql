-- Fix trigger function for status calculation
-- The EXTRACT function was incorrectly used on an integer result

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
