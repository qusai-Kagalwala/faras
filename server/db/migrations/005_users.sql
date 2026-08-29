-- Staff login accounts: Super Admin, Department/Reviewer, and Teacher
-- (FR-AUTH-01). Teacher rows here share the same ITS Number as the
-- corresponding `teachers` row (identity/metadata lives there), but we
-- don't add a hard FK to `teachers` because super_admin/department rows
-- have no `teachers` row at all — that link is validated at the
-- application layer, not the database layer, for this table.

CREATE TABLE users (
  its_number             CHAR(8) PRIMARY KEY CHECK (its_number ~ '^[0-9]{8}$'),
  role                   TEXT NOT NULL CHECK (role IN ('super_admin', 'department', 'teacher')),
  email                  TEXT,
  encrypted_password     TEXT NOT NULL, -- NFR-S-06
  must_change_password   BOOLEAN NOT NULL DEFAULT TRUE, -- FR-AUTH-02
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();