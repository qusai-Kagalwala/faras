-- Shared trigger function: auto-updates `updated_at` on every UPDATE so we
-- never have to remember to set it manually in application code.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;