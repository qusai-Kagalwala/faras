-- Confirmed from statements_final.xlsx: Focus Area, statement text, Type
-- (Scale Answer / Open Ended), and an optional reworded version for even
-- weeks (FR-SUR-04).

CREATE TABLE statement_bank (
  id                    SERIAL PRIMARY KEY,
  focus_area            TEXT NOT NULL,
  statement             TEXT NOT NULL,
  type                  TEXT NOT NULL CHECK (type IN ('likert', 'free_text')),
  needs_reworded        BOOLEAN NOT NULL DEFAULT FALSE,
  reworded_statement    TEXT, -- null unless needs_reworded = true
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT statement_bank_reworded_consistency
    CHECK (needs_reworded = FALSE OR reworded_statement IS NOT NULL)
);

CREATE TRIGGER trg_statement_bank_updated_at
  BEFORE UPDATE ON statement_bank
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();