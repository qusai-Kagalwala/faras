-- server/db/migrations/026_review_groups.sql
--
-- G-02: schema for the Group/Review-Cycle feature. A Group assigns a
-- subject to a Department Head; its class+kitab scope is derived
-- automatically from that subject (via class_subjects.kitab_id, migration
-- 025), never manually picked. review_cycle_proposals is the staging
-- table the algorithm writes to (G-03) BEFORE anything is committed to
-- `schedule` — the Department Head reviews/adjusts the proposal, then
-- "starts" the cycle, which is what actually inserts into `schedule`.

CREATE TABLE review_groups (
  id                    SERIAL PRIMARY KEY,
  name                  TEXT NOT NULL,
  subject_id            INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  department_head_its   CHAR(8) NOT NULL REFERENCES users(its_number) ON DELETE CASCADE,
  deadline              DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_groups_department_head ON review_groups (department_head_its);
CREATE INDEX idx_review_groups_subject ON review_groups (subject_id);

CREATE TABLE review_cycle_proposals (
  id                SERIAL PRIMARY KEY,
  review_group_id   INTEGER NOT NULL REFERENCES review_groups(id) ON DELETE CASCADE,
  week_number       INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 22),
  student_its       CHAR(8) NOT NULL REFERENCES students(its_number) ON DELETE CASCADE,
  subject_id        INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id          INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  source            TEXT NOT NULL CHECK (source IN ('algorithm', 'repeat')),
  included          BOOLEAN NOT NULL,
  status            TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'started')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A student can only have one proposal per group per week — the
  -- Department Head toggles `included`, never creates duplicates.
  UNIQUE (review_group_id, week_number, student_its)
);

CREATE INDEX idx_review_cycle_proposals_group_week
  ON review_cycle_proposals (review_group_id, week_number);