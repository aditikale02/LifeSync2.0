# LifeSync Single Error-Fix Plan (One-by-One)

Date: 2026-03-16  
Scope: Fix all currently observed execution errors in strict sequence.

## Error Analysis Summary

1. Production start fails on Windows
- Symptom: `npm start` fails with `NODE_ENV is not recognized`.
- Root cause: Unix-style env assignment in npm script.
- Source: [package.json](package.json#L9)

2. Supabase verification script fails (14 checks)
- Symptom: `node scripts/verify-supabase.mjs` exits non-zero.
- Root cause: checker targets mixed/legacy table+column shapes that do not match active schema state.
- Source: [scripts/verify-supabase.mjs](scripts/verify-supabase.mjs#L38-L56)

3. Schema truth split across layers
- Evidence A (canonical migration): tasks/water_entries/sleep_entries/study_sessions/activities.
- Source: [supabase/migrations/20260316_lifesync_persistence.sql](supabase/migrations/20260316_lifesync_persistence.sql#L1-L143)
- Evidence B (shared server schema): todos/water_logs/sleep_logs/study_logs/activity_logs.
- Source: [shared/schema.ts](shared/schema.ts#L124-L165)
- Evidence C (frontend): alias fallback supports both naming families.
- Source: [src/lib/wellness-api.ts](src/lib/wellness-api.ts#L15-L38)

4. No TypeScript/editor compile errors
- `npm run check` and diagnostics are clean.

---

## Single Ordered Plan (Fix One-by-One)

## Step 1 — Fix production start command portability
Change:
- Update `start` script to Windows-safe form using `cross-env`.
- File: [package.json](package.json#L9)

Action:
- Replace `NODE_ENV=production node dist-server/index.js` with `cross-env NODE_ENV=production node dist-server/index.js`.

Verify:
- Run `npm run build:server`.
- Run `npm start`.
- Expected: server boots without env-var command error.

Exit criteria:
- `npm start` returns successful startup logs.

---

## Step 2 — Choose and lock one canonical schema source
Decision required (must pick one):
- Option A: Canonical = migration schema family (`tasks`, `water_entries`, `sleep_entries`, `study_sessions`, `activities`).
- Option B: Canonical = current shared schema family (`todos`, `water_logs`, `sleep_logs`, `study_logs`, `activity_logs`).

Recommended:
- Use Option A because the migration explicitly defines canonical persistence and RLS policy set.

Action:
- Document canonical table family in one place (repo root test/ops doc).
- Keep alias support for backward compatibility during transition.

Verify:
- Confirm selected canonical list is used by checker and runtime read/write layers.

Exit criteria:
- No ambiguity remains about expected table names.

---

## Step 3 — Refactor verification script to schema-aware checks
Change:
- Update check matrix to support canonical + fallback aliases (same strategy as frontend).
- File: [scripts/verify-supabase.mjs](scripts/verify-supabase.mjs#L38-L56)

Action details:
- Replace hardcoded single-table checks with candidate arrays per logical domain.
- For each logical domain (todos/water/sleep/study/activity/social), attempt first candidate then fallback.
- Validate only guaranteed columns per table variant (avoid false negatives from optional drift columns).
- Downgrade “no session” to warning (already warning) and add explicit note that RLS insert checks are skipped without auth.

Verify:
- Run `node scripts/verify-supabase.mjs`.
- Expected: relation-missing errors only when both alias candidates fail.

Exit criteria:
- Script failure count reflects real missing entities, not naming drift.

---

## Step 4 — Ensure DB actually has canonical migration applied
Change:
- Apply canonical persistence migration to target Supabase project if not already applied.
- File: [supabase/migrations/20260316_lifesync_persistence.sql](supabase/migrations/20260316_lifesync_persistence.sql)

Action:
- Execute migration in Supabase SQL editor or migration runner.
- Confirm required tables exist and RLS policies are present.

Verify:
- Re-run checker (`node scripts/verify-supabase.mjs`).
- Expected: canonical tables resolvable and readable.

Exit criteria:
- Missing-table failures eliminated for selected canonical family.

---

## Step 5 — Align server schema layer with canonical decision
Change:
- Align `shared/schema.ts` + `server/routes.ts` expectations with canonical naming (or keep alias translation centrally).
- Files:
  - [shared/schema.ts](shared/schema.ts)
  - [server/routes.ts](server/routes.ts)

Action:
- If Option A chosen, map server wellness tables to canonical names and keep compatibility shim where required.
- Ensure API routes return stable shape independent of underlying table alias.

Verify:
- Run `npm run check`.
- Run `npm run build` and `npm run build:server`.
- Run smoke API checks for `/api/wellness/:table/:userId` and `/api/wellness/:table`.

Exit criteria:
- Server and shared schema no longer conflict with canonical persistence model.

---

## Step 6 — Re-run full regression gate in fixed order
Run exactly in this sequence:
1. `npm run check`
2. `npm run build`
3. `npm run build:server`
4. `npm start`
5. `node scripts/verify-supabase.mjs`

Pass criteria:
- No blocking runtime/script errors.
- Checker failures only for genuinely absent required objects.

---

## Step 7 — Closeout and hardening
Action:
- Update test report with before/after logs and final pass matrix.
- Add CI gate to run `check`, `build`, `build:server`, and `verify-supabase` on every PR.

Verify:
- Fresh clone run succeeds with the same command sequence.

Exit criteria:
- Errors are reproducibly fixed and guarded against regression.

---

## Fast Execution Priority
If you want quickest unblock first, execute only Steps 1, 3, 4, then Step 6.
