-- server/db/migrations/016_fix_subjects_name_unique.sql
ALTER TABLE subjects ADD CONSTRAINT subjects_name_unique UNIQUE (name);