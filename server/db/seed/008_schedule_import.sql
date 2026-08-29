-- server/db/seed/008_schedule_import.sql
--
-- Two data-quality issues found and resolved during import, both confirmed
-- against Final.xlsx "Talabat" (the master roster):
--
-- 1. 308 rows in the schedule CSV label a class as "6 B F", but all 14
--    real students in those rows are actually enrolled in "6 A F" per
--    Talabat — a section-labeling inconsistency between the two source
--    files, not a missing class. Corrected via CASE below.
--
-- 2. 66 rows reference 3 student TRNOs (27179, 27529, 27556) that do not
--    exist anywhere in Talabat at all — a genuine roster gap, not fixable
--    from available data. These rows are excluded from this import and
--    must be re-imported once AJSM supplies those 3 students' records.

INSERT INTO schedule (week_number, class_id, subject_id, teacher_its, student_its, group_number)
SELECT
  s.week::integer,
  c.id,
  sub.id,
  t.its_number,
  st.its_number,
  NULLIF(s.group_number, '')::integer
FROM schedule_staging s
JOIN classes c
  ON c.darajah = s.darajah::integer
  AND c.section = CASE
        WHEN s.darajah = '6' AND split_part(s.class, ' ', 2) = 'B' AND s.student_gender = 'F'
          THEN 'A'  -- corrects the "6 B F" -> "6 A F" mislabel, confirmed above
        ELSE split_part(s.class, ' ', 2)
      END
  AND c.gender = s.student_gender
JOIN subjects sub ON sub.name = s.subject
JOIN students st ON st.trno = s.student_tr_no  -- naturally excludes the 3 missing TRNOs
LEFT JOIN teachers t ON t.its_number = NULLIF(TRIM(s.teacher), '')
ON CONFLICT (week_number, student_its, subject_id) DO NOTHING;