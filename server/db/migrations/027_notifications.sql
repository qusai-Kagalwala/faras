-- server/db/migrations/027_notifications.sql
--
-- N-01: general-purpose notifications, not just review-cycle reminders.
-- Fires at the same real action points already tracked by audit_logs
-- (role assigned/removed, made a Group Head, etc.), plus cycle-specific
-- ones (survey reminders, deadline approaching). Message is stored
-- pre-rendered (plain text) rather than reconstructed from structured
-- data each time — simplest thing that actually works for a notification
-- list UI.

CREATE TABLE notifications (
  id             SERIAL PRIMARY KEY,
  recipient_its  CHAR(8) NOT NULL,
  type           TEXT NOT NULL,
  message        TEXT NOT NULL,
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications (recipient_its, is_read);
CREATE INDEX idx_notifications_created_at ON notifications (created_at);