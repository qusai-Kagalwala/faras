# FARAS — Deployment Checklist

Companion to `FARAS_IIS_Deployment_Guide.md`, tailored to the actual current
codebase (server routes, real env vars, real migration list). This has
**not** been run against a real Windows Server/IIS instance — nothing in
this repo's sandbox can do that — so treat every step below as prepared
and verified against the code, but still needing a real first run on the
actual deployment server.

## 1. Folder naming — read this first

Vite's `npm run build` (run inside `client/`) outputs to `client/dist/`,
**not** `client/` itself. The deployment guide's folder diagram expects a
deployed folder literally named `client/` containing the *built* output.
That means on the server:

```
C:\inetpub\wwwroot\faras\
  ├── client\          ← the CONTENTS of this repo's client/dist/, not the source client/ folder
  ├── server\          ← this repo's server/ folder (source, not built — Node runs it directly)
  └── web.config       ← this file, from the repo root
```

Copying the whole source `client/` folder (with `src/`, `node_modules/`,
etc.) instead of just `dist/`'s contents is the most likely first mistake —
double-check this specifically.

## 2. Run all 24 migrations, in order

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
```

`022_cycle_settings.sql` seeds one row (`current_week = 1`) — without it,
`GET /api/cycle/current-week` throws an internal error, and the student
survey can never resolve a week. Don't skip it.

## 3. Required environment variables

Matches `server/config/env.js`'s `REQUIRED_VARS` exactly — the server
refuses to boot (`process.exit(1)`) if any of these are missing:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | JWT signing |
| `PASSWORD_ENCRYPTION_KEY` | Reversible password encryption (NFR-S-06) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Forgot-password email delivery |
| `NODE_ENV` | Set to `production` |
| `PORT` | Internal port IISNode proxies to |
| `LLM_API_KEY` | AI report generation (OpenAI, confirmed) |

Set these as IIS Application Pool environment variables, or via a
`.env` file placed on the server outside version control — never commit
real values to the repo (`server/.env` is already gitignored; only
`server/.env.example` — with no real values — should ever be committed).

## 4. Build and deploy steps

1. `cd client && npm run build` — copy the **contents of `client/dist/`**
   (not the folder itself) into the server's `client/` folder.
2. Copy the `server/` folder's source as-is (no build step — Node runs it
   directly). Run `npm install --production` on the server inside
   `server/`, or ship `node_modules/` if the server has no internet access.
3. Place this repo's root `web.config` at the IIS site root.
4. In IIS Manager: create the site/application pointing at the FARAS root
   folder. Set the Application Pool to **No Managed Code**.
5. Bind the SSL certificate (443) and confirm HTTP to HTTPS redirect —
   HTTPS is a hard requirement (NFR-S-01).
6. Confirm `DATABASE_URL` resolves from the server (test with a simple
   query script before wiring up the full app).
7. Hit `GET /api/health` — expect `{"status":"ok"}`. This confirms
   IISNode is correctly proxying to the real, current `server/app.js`.
8. Smoke-test login as all 4 roles: Super Admin, Department, Teacher,
   Student — real ITS Number + starter password (= their own ITS Number),
   confirm the forced password-change flow fires (`mustChangePassword`).
9. Complete one real, full survey submission as a student end-to-end.
10. As Super Admin, set the cycle's current week (Cycle Settings card) —
    without this, every student survey request fails with "no cycle
    configured."

## 5. Known gap - scheduled jobs

The deployment guide calls for Windows Task Scheduler to handle
recurring jobs (schedule regeneration, cycle/report generation). Nothing
in this codebase currently exposes a script or endpoint specifically
designed to be called on a schedule - POST /api/scheduling/generate,
POST /api/ai-reports/teacher/:id, and POST /api/ai-reports/admin all
exist and work, but are designed for on-demand Super Admin triggering
via the UI, not unattended scheduled execution. If AJSM wants a real
recurring job (e.g. "advance the cycle week automatically every Monday"),
that's a real, separate feature - not something to assume is covered by
these endpoints existing.

## 6. Pre-launch checklist (from the deployment guide, unchanged)

- [ ] HTTPS enforced, valid certificate installed
- [ ] All secrets in environment variables, not source control
- [ ] RBAC verified for all 4 roles
- [ ] Blind-collection check: confirm no API response to a Student-role
      token includes teacher name or ITS number (already covered by
      survey.controller.js's response shape - re-verify on the real
      deployed instance, not just in dev)
- [ ] Scheduled job question resolved (see Section 5 above) - or
      explicitly decided that manual, on-demand triggering is
      acceptable for launch
- [ ] Database backups configured
- [ ] Staging smoke test completed before pointing the production
      domain at this server