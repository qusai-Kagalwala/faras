-- server/db/migrations/028_ai_reports_subject.sql
--
-- N-07: the Report Queue previously showed only a raw teacher ITS
-- number with no indication of which subject the report is about — a
-- real usability gap once teachers can teach (or be reviewed for)
-- multiple subjects. Nullable because a teacher could theoretically
-- teach more than one subject, making it genuinely ambiguous at
-- generation time — populated only when unambiguous.

ALTER TABLE ai_reports ADD COLUMN subject_id INTEGER REFERENCES subjects(id);