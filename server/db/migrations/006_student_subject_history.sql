-- FR-SCH-03: tracks every subject a student has already completed, so the
-- scheduling engine never re-assigns a subject until the full cycle completes.

CREATE TABLE student_subject_history (
  id            SERIAL PRIMARY KEY,
  student_its   CHAR(8) NOT NULL REFERENCES students(its_number) ON DELETE CASCADE,
  subject_id    INTEGER NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT student_subject_history_unique UNIQUE (student_its, subject_id)
);

CREATE TRIGGER trg_student_subject_history_updated_at
  BEFORE UPDATE ON student_subject_history
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();