-- Staging table — mirrors student_subject_schedule.csv's columns exactly,
-- as plain text. We load the raw CSV here first, then transform/validate
-- into the real `schedule` table via SQL joins (008).

CREATE TABLE schedule_staging (
  week              TEXT,
  class             TEXT,
  darajah           TEXT,
  group_number      TEXT,
  student_tr_no     TEXT,
  student_name      TEXT,
  student_email     TEXT,
  student_gender    TEXT,
  subject           TEXT,
  teacher           TEXT,
  two_week_period   TEXT
);