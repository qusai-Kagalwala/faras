-- Raw student responses per week, pre-mapping (FR-MAP-01 maps these to
-- teachers later, at report time). FR-MAP-03: many cells are legitimately
-- null because questions rotate weekly — that's expected, not an error.

CREATE TABLE survey_responses (
  id             SERIAL PRIMARY KEY,
  schedule_id    INTEGER NOT NULL REFERENCES schedule(id) ON DELETE CASCADE,
  statement_id   INTEGER NOT NULL REFERENCES statement_bank(id) ON DELETE RESTRICT,
  likert_value   SMALLINT CHECK (likert_value BETWEEN 1 AND 5), -- null for free_text
  free_text      TEXT,                                          -- null for likert
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT survey_responses_unique UNIQUE (schedule_id, statement_id),
  CONSTRAINT survey_responses_exactly_one_value
    CHECK (
      (likert_value IS NOT NULL AND free_text IS NULL) OR
      (likert_value IS NULL AND free_text IS NOT NULL)
    )
);

CREATE INDEX idx_survey_responses_schedule ON survey_responses (schedule_id);

CREATE TRIGGER trg_survey_responses_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();