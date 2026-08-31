-- server/db/migrations/019_user_roles.sql
--
-- MULTI-ROLE SUPPORT: a single AJSM staff person can genuinely hold
-- multiple roles simultaneously (e.g. a department head who is also a
-- teacher and a super admin). This was NOT in the original SRS (which
-- specified one role per person) — added after explicit confirmation that
-- this real situation exists at AJSM.
--
-- Scoped to STAFF only (users table) — students never hold multiple roles.
-- users.role is KEPT as-is for backward compatibility and as a fallback,
-- but the authoritative set of assigned roles now lives here. Every
-- existing user is backfilled with their current single role below.

CREATE TABLE user_roles (
  its_number  CHAR(8) NOT NULL REFERENCES users(its_number) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('super_admin', 'department', 'teacher')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (its_number, role)
);

INSERT INTO user_roles (its_number, role)
SELECT its_number, role FROM users
ON CONFLICT (its_number, role) DO NOTHING;