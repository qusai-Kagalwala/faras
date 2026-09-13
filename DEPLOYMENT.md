# FARAS — Deployment Checklist

Companion to `FARAS_IIS_Deployment_Guide.md`, refreshed against the actual
current codebase (29 migrations, all backend modules through the
Group/Review-Cycle feature and notifications). This has **not** been run
against a real Windows Server/IIS instance — nothing in this repo's
sandbox can do that — so treat every step below as prepared and verified
against the code, but still needing a real first run on the actual
deployment server.

## 1. Folder naming — read this first

Vite's `npm run build` (run inside `client/`) outputs to `client/dist/`,
**not** `client/` itself. The deployment guide's folder diagram expects a
deployed folder literally named `client/` containing the *built* output.

```
C:\inetpub\wwwroot\faras\
  ├── client\          ← the CONTENTS of this repo's client/dist/, not the source client/ folder
  ├── server\          ← this repo's server/ folder (source, not built — Node runs it directly)
  └── web.config       ← from the repo root
```

Copying the whole source `client/` folder (with `src/`, `node_modules/`,
etc.) instead of just `dist/`'s contents is the most likely first mistake.

## 2. Run all 29 migrations, in order

```
000_extensions_and_functions.sql
001_teachers.sql
002_classes.sql
003_subjects.sql
004_students.sql
005_users.sql
006_student_subject_history.sql
007_schedule.sql
008_statement_bank.sql
009_statement_subject_tags.sql
010_week_focus_plan.sql
011_survey_responses.sql
012_ai_reports.sql
013_report_approvals.sql
014_audit_logs.sql
015_fix_classes_section_width.sql
016_fix_subjects_name_unique.sql
017_add_users_name.sql
018_class_subjects.sql
019_user_roles.sql
020_ai_reports_admin_nullable_teacher.sql
021_users_is_active.sql
022_cycle_settings.sql
023_cycle_settings_academic_year.sql
024_students_is_active.sql
025_kitabs.sql
026_review_groups.sql
027_notifications.sql
028_ai_reports_subject.sql
```

Two worth flagging specifically:
- **`022_cycle_settings.sql`** seeds one row (`current_week = 1`) —
  without it, `GET /api/cycle/current-week` throws, and the student
  survey can never resolve a week.
- **`025_kitabs.sql`** contains real seed data (61 kitabs) and 187
  `UPDATE` statements backfilling `class_subjects.kitab_id` from the real
  `Teachers.csv` import — this is a genuinely large migration file, not
  just schema. Confirm it completes without truncation/timeout on the
  real server before moving on.

## 3. Required environment variables

Matches `server/config/env.js`'s `REQUIRED_VARS` exactly — unchanged
since the feature work landed, still just these 10:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | JWT signing |
| `PASSWORD_ENCRYPTION_KEY` | Reversible password encryption (NFR-S-06) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Forgot-password email delivery |
| `NODE_ENV` | Set to `production` |
| `PORT` | Internal port IISNode proxies to |
| `LLM_API_KEY` | AI report generation (OpenAI, confirmed working live) |

Set these as IIS Application Pool environment variables, or a `.env` file
outside version control. Never commit real values — only
`server/.env.example` (no real values) should ever be in the repo.

## 4. Build and deploy steps

1. `cd client && npm run build` — copy the **contents of `client/dist/`**
   into the server's `client/` folder.
2. Copy `server/`'s source as-is. Run `npm install --production` inside
   `server/` on the target machine (needs internet access, or ship
   `node_modules/` directly) — note the newer dependencies added this
   session: `openai`, `leo-profanity`.
3. Place this repo's root `web.config` at the IIS site root.
4. IIS Manager: create the site/application, Application Pool set to
   **No Managed Code**.
5. Bind SSL (443), confirm HTTP to HTTPS redirect (NFR-S-01, hard
   requirement).
6. Confirm `DATABASE_URL` resolves from the server before wiring up the
   full app.
7. Hit `GET /api/health` — expect `{"status":"ok"}`.
8. Smoke-test login as all 4 roles, confirm forced password-change fires
   on first login.
9. Complete one real, full survey submission as a student.
10. As Super Admin, set the cycle's current week (Cycle Settings page) —
    without this, every student survey request fails.
11. New this session — smoke-test the Group/Review-Cycle feature
    specifically, since it's the newest and most complex piece:
    - Create a Review Group (Review Groups page)
    - As that Department Head, propose and start a cycle (Review
      Cycles page, "Start New Cycle" tab)
    - Confirm a real student sees the resulting survey
    - Confirm "View Existing Cycle" correctly shows the per-class
      breakdown once started
12. Confirm the notification bell (top-right on every staff page, and in
    the student header) shows real notifications — trigger one by
    assigning/removing a role on a test account and logging in as that
    account.
13. Confirm the mobile hamburger menu appears and works on a narrow
    viewport for Super Admin and Department (Teacher/Student are
    single-page, no menu expected).

## 5. Known gap — scheduled jobs

Nothing in this codebase is built for unattended scheduled execution.
Schedule generation, review cycle proposing/starting, and AI report
generation are all deliberately on-demand, human-triggered actions (via
UI buttons now, not just curl). If AJSM wants a real recurring job (e.g.
"advance the cycle week automatically every Monday," or "auto-send
survey reminders every Thursday"), that's a genuinely separate feature —
not something to assume is covered by what exists today.

## 6. Pre-launch checklist

- [ ] HTTPS enforced, valid certificate installed
- [ ] All secrets in environment variables, not source control
- [ ] RBAC verified for all 4 roles, plus the Department-owns-their-own-Group
      check (a Department Head cannot act on a Review Group they don't head)
- [ ] Blind-collection check: confirm no API response to a Student-role
      token includes teacher name or ITS number
- [ ] Scheduled job question resolved (Section 5) — or explicitly decided
      that on-demand triggering is acceptable for launch
- [ ] Database backups configured
- [ ] Staging smoke test completed, including the full Group/Review-Cycle
      flow with real data (already verified once in a real dev
      environment this session — re-confirm on the actual production
      server)