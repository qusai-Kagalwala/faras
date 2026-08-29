-- server/db/migrations/017_add_users_name.sql
-- users table had no name field — fine for teacher rows (name lives in
-- teachers.name), but super_admin/department roles have no equivalent
-- identity table, so there was nowhere to store their name at all.

ALTER TABLE users ADD COLUMN name TEXT; 