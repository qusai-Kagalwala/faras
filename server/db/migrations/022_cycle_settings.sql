-- server/db/migrations/022_cycle_settings.sql
CREATE TABLE cycle_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_week  INTEGER NOT NULL DEFAULT 1 CHECK (current_week BETWEEN 1 AND 22),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO cycle_settings (id, current_week) VALUES (1, 1);