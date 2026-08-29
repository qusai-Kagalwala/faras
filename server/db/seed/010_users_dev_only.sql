-- server/db/seed/010_users_dev_only.sql
--
-- ⚠️ DEV/TESTING ONLY marker in the name field. Replace/remove before any
-- AJSM production import — this uses a real ITS number for local dev
-- convenience, but the "DEV" label makes clear it's not a real assigned
-- Super Admin account until formally confirmed by AJSM.

INSERT INTO users (its_number, role, name, email, encrypted_password, must_change_password) VALUES
  ('30328701', 'super_admin', 'Qusai Kagalwala DEV', NULL, 'PLACEHOLDER_NOT_REAL', TRUE)
ON CONFLICT (its_number) DO NOTHING;