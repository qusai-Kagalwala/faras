-- FR-WF-01/02/03: every report stage (generated, under_review, approved,
-- dispatched) is tracked with a timestamp and the acting user. This is the
-- hard gate preventing any report from reaching a teacher without
-- department approval.

CREATE TABLE report_approvals (
  id              SERIAL PRIMARY KEY,
  ai_report_id    INTEGER NOT NULL REFERENCES ai_reports(id) ON DELETE CASCADE,
  stage           TEXT NOT NULL CHECK (stage IN ('generated', 'under_review', 'approved', 'dispatched')),
  reviewed_by_its CHAR(8) REFERENCES users(its_number) ON DELETE SET NULL, -- null at 'generated' stage
  sign_off_note   TEXT, -- FR-WF-02, only present at dispatch
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_approvals_ai_report ON report_approvals (ai_report_id);

CREATE TRIGGER trg_report_approvals_updated_at
  BEFORE UPDATE ON report_approvals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();