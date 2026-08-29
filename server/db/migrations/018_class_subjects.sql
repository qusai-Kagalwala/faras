-- server/db/migrations/018_class_subjects.sql
-- Maps which subjects are offered to which class — independent of the
-- schedule table, so the scheduling generator can determine "what subjects
-- does this class need to rotate through" without requiring pre-existing
-- schedule data (which is exactly backwards for a *generator*).

CREATE TABLE class_subjects (
  class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id  INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_its CHAR(8) REFERENCES teachers(its_number) ON DELETE SET NULL,
  PRIMARY KEY (class_id, subject_id)
);