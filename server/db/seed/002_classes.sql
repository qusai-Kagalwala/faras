-- Seed: classes
-- Source: Final.xlsx 'Talabat' sheet — distinct darajah/section/gender
-- combinations actually used by real students. 37 distinct classes.
-- NOTE: run migration 015 (widen classes.section) before this file —
-- one real section value is 'DARS', not a single letter.

INSERT INTO classes (darajah, section, gender, display_name) VALUES
  (1, 'A', 'F', '1 A F'),
  (1, 'A', 'M', '1 A M'),
  (1, 'B', 'F', '1 B F'),
  (1, 'B', 'M', '1 B M'),
  (1, 'DARS', 'F', '1 DARS F'),
  (2, 'A', 'F', '2 A F'),
  (2, 'A', 'M', '2 A M'),
  (2, 'B', 'F', '2 B F'),
  (2, 'B', 'M', '2 B M'),
  (2, 'DARS', 'F', '2 DARS F'),
  (3, 'A', 'F', '3 A F'),
  (3, 'A', 'M', '3 A M'),
  (3, 'B', 'F', '3 B F'),
  (3, 'B', 'M', '3 B M'),
  (3, 'C', 'F', '3 C F'),
  (3, 'DARS', 'F', '3 DARS F'),
  (4, 'A', 'F', '4 A F'),
  (4, 'A', 'M', '4 A M'),
  (4, 'B', 'F', '4 B F'),
  (4, 'B', 'M', '4 B M'),
  (4, 'C', 'F', '4 C F'),
  (5, 'A', 'F', '5 A F'),
  (5, 'A', 'M', '5 A M'),
  (5, 'B', 'F', '5 B F'),
  (5, 'B', 'M', '5 B M'),
  (6, 'A', 'F', '6 A F'),
  (6, 'A', 'M', '6 A M'),
  (6, 'B', 'M', '6 B M'),
  (7, 'A', 'F', '7 A F'),
  (7, 'A', 'M', '7 A M'),
  (8, 'A', 'M', '8 A M'),
  (9, 'A', 'F', '9 A F'),
  (9, 'A', 'M', '9 A M'),
  (10, 'A', 'F', '10 A F'),
  (10, 'A', 'M', '10 A M'),
  (11, 'A', 'F', '11 A F'),
  (11, 'A', 'M', '11 A M')
ON CONFLICT (darajah, section, gender) DO NOTHING;