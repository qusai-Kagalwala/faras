-- server/db/migrations/024_students_is_active.sql
-- FR-AUTH-08 (extended to students): Super Admin can deactivate a
-- student's account (e.g. the student has left the school). Matches the
-- same pattern as users.is_active (migration 021) — a soft flag, not a
-- delete, so the student's real survey history stays intact.

ALTER TABLE students ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;