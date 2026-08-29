-- Confirmed from Final.xlsx "Talabat" sheet across 730 real students:
-- ITS Number always exactly 8 digits (zero blanks) — used as primary key.
-- TRNO always exactly 5 digits (zero blanks) — internal only, NEVER used
-- for login (FR-AUTH-05). Kept as a separate unique column, not the PK.

CREATE TABLE students (
  its_number             CHAR(8) PRIMARY KEY CHECK (its_number ~ '^[0-9]{8}$'),
  trno                   CHAR(5) NOT NULL UNIQUE CHECK (trno ~ '^[0-9]{5}$'),
  name                   TEXT NOT NULL,
  email                  TEXT,
  gender                 CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  class_id               INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  encrypted_password     TEXT NOT NULL, -- NFR-S-06: reversible, not hashed
  must_change_password   BOOLEAN NOT NULL DEFAULT TRUE, -- FR-AUTH-02
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();