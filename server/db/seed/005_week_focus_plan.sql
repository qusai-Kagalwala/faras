-- Seed: week_focus_plan
-- Source: week_survey_plan.xlsx
-- 24 week-to-focus-area mappings.

INSERT INTO week_focus_plan (week_number, focus_area) VALUES
  (3, 'Asking Questions When I Don''t Understand'),
  (7, 'Asking Questions When I Don''t Understand'),
  (1, 'Building My Comfort and Confidence in Class'),
  (9, 'Building My Comfort and Confidence in Class'),
  (5, 'Doing Homework That Helps Me Learn'),
  (8, 'Feeling Encouraged and Supported Emotionally'),
  (3, 'Feeling Ready for Tests and Exams'),
  (8, 'Feeling Ready for Tests and Exams'),
  (11, 'Feeling Ready for Tests and Exams'),
  (7, 'Keeping Up with the Pace of Lessons'),
  (6, 'Learning at My Own Level and Speed'),
  (4, 'Learning in Ways That Work for Me'),
  (2, 'Overall English Usage'),
  (6, 'Overall English Usage'),
  (10, 'Participating and Knowing How I Am Doing'),
  (9, 'Staying Connected to Values in What I Learn'),
  (2, 'Staying Focused and Respectful in Class'),
  (10, 'Staying Focused and Respectful in Class'),
  (1, 'Subject-Specific questions'),
  (5, 'Subject-Specific questions'),
  (4, 'Understanding What is Taught'),
  (11, 'Understanding What is Taught'),
  (2, 'Usage of learning aids'),
  (6, 'Usage of learning aids')
ON CONFLICT (week_number, focus_area) DO NOTHING;