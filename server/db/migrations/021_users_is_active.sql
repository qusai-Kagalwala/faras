-- server/db/migrations/021_users_is_active.sql
-- FR-AUTH-08: Super Admin can deactivate a staff account. A deactivated
-- account must not be able to log in, but its history (roles, past
-- reports, approvals) should remain intact — so this is a soft flag, not
-- a delete.

ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;