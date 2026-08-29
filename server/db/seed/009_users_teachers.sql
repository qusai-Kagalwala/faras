-- Seed: users (teacher role)
-- Populates login accounts for every existing teacher, using data already
-- in the `teachers` table — no separate source file needed, since every
-- teacher's ITS Number and identity is already confirmed real.
--
-- encrypted_password is a PLACEHOLDER here, same reasoning as
-- 006_students.sql — raw SQL can't call the AES-256-GCM encryption utility.
-- Run the companion Node script after this to set real encrypted passwords.

INSERT INTO users (its_number, role, email, encrypted_password, must_change_password)
SELECT its_number, 'teacher', email, 'PLACEHOLDER_NOT_REAL', TRUE
FROM teachers
ON CONFLICT (its_number) DO NOTHING;