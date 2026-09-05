-- server/db/migrations/023_cycle_settings_academic_year.sql
ALTER TABLE cycle_settings ADD COLUMN academic_year TEXT NOT NULL DEFAULT '1447-1448';