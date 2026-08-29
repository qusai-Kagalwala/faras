-- Confirmed pattern from Talabat sheet / student_subject_schedule.csv:
-- class names like "1 A F" = darajah (1-11) + section + gender.
-- Synthetic serial PK is correct here — a class has no natural external ID
-- (unlike a person's ITS Number).

CREATE TABLE classes (
  id            SERIAL PRIMARY KEY,
  darajah       INTEGER NOT NULL CHECK (darajah BETWEEN 1 AND 11),
  section       CHAR(1) NOT NULL,
  gender        CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  display_name  TEXT NOT NULL, -- e.g. "1 A F", matches source data exactly
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT classes_unique_combo UNIQUE (darajah, section, gender)
);

CREATE TRIGGER trg_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();