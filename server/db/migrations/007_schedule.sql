-- Confirmed from student_subject_schedule.csv (15,202 real rows, matching
-- FR-SCH-04 exactly): rotation happens in 2-week blocks across 22 weeks.
-- teacher_its is deliberately NULLABLE — confirmed 1,430 real rows with a
-- blank teacher (e.g. some Lab sessions have no assigned teacher).

CREATE TABLE schedule (
  id             SERIAL PRIMARY KEY,
  week_number    INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 22),
  class_id       INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  subject_id     INTEGER NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  teacher_its    CHAR(8) REFERENCES teachers(its_number) ON DELETE SET NULL, -- nullable, confirmed
  student_its    CHAR(8) NOT NULL REFERENCES students(its_number) ON DELETE CASCADE,
  group_number   INTEGER, -- cohort group within the class, per source data
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT schedule_unique_assignment UNIQUE (week_number, student_its, subject_id)
);

CREATE INDEX idx_schedule_week_class ON schedule (week_number, class_id);
CREATE INDEX idx_schedule_teacher ON schedule (teacher_its);

CREATE TRIGGER trg_schedule_updated_at
  BEFORE UPDATE ON schedule
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();