-- server/db/migrations/020_ai_reports_admin_nullable_teacher.sql
--
-- FR-ADM-02/03: the admin track is department-wide (macro action pointers,
-- faculty-level trends) — it was never meant to be scoped to one teacher,
-- but the original schema made teacher_its NOT NULL on every row. Fixed:
-- teacher-track rows still require a real teacher_its; admin-track rows
-- may now be NULL.

ALTER TABLE ai_reports ALTER COLUMN teacher_its DROP NOT NULL;

ALTER TABLE ai_reports ADD CONSTRAINT ai_reports_teacher_required_for_teacher_track
  CHECK (track = 'admin' OR teacher_its IS NOT NULL);