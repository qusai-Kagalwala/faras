-- server/db/seed/012_known_gaps.sql
-- Documents a real gap discovered in AJSM's source data (not introduced by
-- our import): 42 real students exist in students (seeded from Final.xlsx
-- "Talabat") but have ZERO rows in the schedule table, because they never
-- appeared at all in student_subject_schedule.csv. This is separate from
-- the earlier-documented 66-row gap (3 students in the schedule but absent
-- from Talabat) — this is the reverse direction: students who exist, but
-- were never scheduled for anything.
--
-- Action needed: flag to AJSM that these 42 students may need a schedule
-- generated for them (via scheduleService.js, once each has a proper
-- class_subjects mapping), or confirm with AJSM why they were excluded
-- from the original rotation (e.g. new admissions after the schedule was
-- generated, withdrawn students, etc.) before assuming they need one.

CREATE TABLE IF NOT EXISTS known_data_gaps (
  id           SERIAL PRIMARY KEY,
  description  TEXT NOT NULL,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO known_data_gaps (description) VALUES
  ('42 students in students table have zero rows in schedule (never appeared in original student_subject_schedule.csv). Needs AJSM confirmation: new admissions, withdrawals, or genuine oversight?');