-- Confirmed via Final.xlsx "Class Teacher" sheet + Teachers.csv:
-- ITS Number is always exactly 8 digits, zero blanks across 52 real teachers.
-- ITS is used as the primary key directly — no synthetic ID.

CREATE TABLE teachers (
  its_number  CHAR(8) PRIMARY KEY CHECK (its_number ~ '^[0-9]{8}$'),
  name        TEXT NOT NULL,
  email       TEXT,
  mobile_no   TEXT,
  gender      CHAR(1) CHECK (gender IN ('M', 'F')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();