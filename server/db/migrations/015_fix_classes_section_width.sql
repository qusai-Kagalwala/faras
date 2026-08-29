-- server/db/migrations/015_fix_classes_section_width.sql
-- Real data (Final.xlsx "Talabat" sheet) revealed a section value "DARS",
-- not just single letters — CHAR(1) was too narrow. Widening to VARCHAR(10).

ALTER TABLE classes ALTER COLUMN section TYPE VARCHAR(10);