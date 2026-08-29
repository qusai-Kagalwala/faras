-- FR-SUR-03: subject-specific focus areas inject only questions tagged for
-- the student's current subject. A statement with zero rows here applies
-- to all subjects (confirmed pattern: statements_final.xlsx has both
-- general focus areas like "Understanding What is Taught" and
-- subject-specific ones like "Subject-Specific questions English").

CREATE TABLE statement_subject_tags (
  statement_id  INTEGER NOT NULL REFERENCES statement_bank(id) ON DELETE CASCADE,
  subject_id    INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (statement_id, subject_id)
);