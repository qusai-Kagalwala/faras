-- Confirmed from week_survey_plan.xlsx: maps a week number to which Focus
-- Area(s) are active that week (FR-SUR-02). Multiple focus areas can be
-- active in the same week (confirmed: week 1 alone had 4 in the real
-- weekly_survey_forms.json data).

CREATE TABLE week_focus_plan (
  id           SERIAL PRIMARY KEY,
  week_number  INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 22),
  focus_area   TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT week_focus_plan_unique UNIQUE (week_number, focus_area)
);

CREATE TRIGGER trg_week_focus_plan_updated_at
  BEFORE UPDATE ON week_focus_plan
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();