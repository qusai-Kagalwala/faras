-- Key action history across the system. user_its is intentionally not a
-- hard FK to any single table, since the actor could be a student, teacher,
-- or staff user — validated at the application layer instead.

CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  user_its    CHAR(8) NOT NULL,
  action      TEXT NOT NULL,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_its ON audit_logs (user_its);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);