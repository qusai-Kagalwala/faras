-- server/db/seed/011_class_subjects_backfill.sql
-- Backfills class_subjects from the real schedule data already imported,
-- using each class's most recent real teacher assignment per subject.

INSERT INTO class_subjects (class_id, subject_id, teacher_its)
SELECT DISTINCT ON (class_id, subject_id) class_id, subject_id, teacher_its
FROM schedule
ORDER BY class_id, subject_id, week_number DESC
ON CONFLICT (class_id, subject_id) DO NOTHING;