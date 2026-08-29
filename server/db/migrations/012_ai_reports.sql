-- FR-AI-04: LLM returns structured JSON conforming to a fixed schema;
-- FARAS renders it, not the model. `track` keeps the two report tracks
-- (teacher-filtered vs admin-unfiltered) structurally separate at the
-- database level too, matching the non-negotiable "never merge tracks" rule
-- — enforced further by application-layer RBAC (NFR-S-04), not just this
-- column.

CREATE TABLE ai_reports (
  id            SERIAL PRIMARY KEY,
  teacher_its   CHAR(8) NOT NULL REFERENCES teachers(its_number) ON DELETE CASCADE,
  cycle_id      TEXT NOT NULL,
  track         TEXT NOT NULL CHECK (track IN ('teacher', 'admin')),
  report_json   JSONB NOT NULL, -- shape validated in app layer via shared/schemas
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_reports_unique UNIQUE (teacher_its, cycle_id, track)
);

CREATE TRIGGER trg_ai_reports_updated_at
  BEFORE UPDATE ON ai_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();