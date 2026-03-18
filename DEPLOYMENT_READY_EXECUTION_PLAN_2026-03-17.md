# Deployment Ready Plan (Step-wise Execution)

Date: 2026-03-17
Last updated: 2026-03-18

## Current Status

- Source/build quality: passing (`npm run check`, `npm run build`, `npm run build:server`)
- Runtime script portability: fixed (`cross-env` for `npm start`)
- Health endpoint: implemented at `/api/health`
- Supabase schema verification: passing (`npm run verify:supabase` reports 13 domains OK)
- Strict deployment gate: passing (`npm run preflight:strict`)
- Browser smoke suite: passing (`npm run e2e` 30/30)

## Phase 1 — Local Reliability (Completed)

1. Add cross-platform start script
2. Add preflight pipeline with strict and non-strict modes
3. Add Supabase verification script with domain aliases
4. Add health endpoint for runtime checks

## Phase 2 — Database Readiness (Completed)

1. Apply migration:
   - `supabase/migrations/20260316_lifesync_missing_session_tables.sql`
2. Re-run:
   - `npm run verify:supabase`
   - `npm run preflight:strict`
3. Exit criteria:
   - No failed domains in Supabase verify

Completion status:
- ✅ Domain verification now passes with 0 failures.

## Phase 3 — Deployment Guardrails

1. Keep local dev gate:
   - `npm run preflight` (non-strict)
2. Use production gate:
   - `npm run preflight:strict`
3. CI pipeline (implemented):
   - File: `.github/workflows/ci.yml`
   - Job `quality-and-build`: check, build, build:server, preflight (non-strict)
   - Job `strict-deployment-gate`: runs `preflight:strict` when Supabase secrets are configured

Completion status:
- ✅ Guardrails implemented and validated locally.

## Phase 4 — Production Deployment Checklist

1. Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
   - `DATABASE_URL` (if using Neon/Postgres runtime DB)
2. Build commands:
   - Frontend: `npm run build`
   - Backend: `npm run build:server`
3. Health verification:
   - GET `/api/health`
4. Smoke tests post-deploy:
   - Login/register flow
   - Dashboard load
   - One write per core domain (tasks, water, mood, study, activity)

Completion status (pre-release):
- ✅ `/api/health` validated via automated API smoke.
- ✅ Auth and protected-route flow validated in Playwright.
- ✅ Core interaction smoke validated (todo + water), with full protected route matrix coverage.

## Execution Summary

What was executed in-repo:
- Step-wise hardening and cleanup updates
- Deployment health endpoint
- Dev/prod preflight separation
- CI workflow for quality + strict deployment gating
- Strict release gate validation pass
- Browser smoke validation pass

What remains outside repo:
- Final production deployment execution in hosting platform
- Post-deploy manual business smoke for write+read in tasks/water/mood/study/activity

## Final Signoff Snapshot

- `npm run check` ✅
- `npm run build` ✅
- `npm run build:server` ✅
- `npm run verify:supabase` ✅
- `npm run preflight:strict` ✅
- `npm run e2e` ✅
