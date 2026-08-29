-- Seed: subjects
-- Source: student_subject_schedule.csv — the subject set that actually
-- goes through FARAS's feedback rotation (a subset of the full school
-- curriculum, not the full Final.xlsx 'Subjects' roster — confirmed by
-- comparing both lists directly). 22 distinct subjects.

INSERT INTO subjects (name) VALUES
  ('Architecture'),
  ('Biology'),
  ('Business Studies'),
  ('Chemistry'),
  ('Dawat Litigation'),
  ('Economics'),
  ('English'),
  ('Geography'),
  ('HCIW'),
  ('History'),
  ('History-Civics'),
  ('Lab'),
  ('Linguistics'),
  ('Literature'),
  ('Management'),
  ('Maths'),
  ('Physics'),
  ('Political Science'),
  ('Psychology'),
  ('Religions of the World'),
  ('Science'),
  ('Sociology')
ON CONFLICT DO NOTHING;