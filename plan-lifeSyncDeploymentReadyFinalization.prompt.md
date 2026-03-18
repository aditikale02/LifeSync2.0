## Plan: LifeSync Deployment-Ready Finalization

Stabilize the project for real deployment by finishing remaining reliability work in controlled chunks: verify what is already complete, close the external Supabase blocker, run strict release gates, and publish a clear agile execution path for post-release impact features. The codebase is largely healthy now; the critical path is database schema completion plus strict validation signoff.

**Steps**
1. Baseline validation and scope lock. Confirm current repo state, enumerate already-completed cleanup/refinement/docs, and freeze scope to deployment-critical fixes only. This step blocks all later execution.
2. Resolve external schema blocker in target Supabase. Apply `supabase/migrations/20260316_lifesync_missing_session_tables.sql` to create missing session domains (`pomodoro_sessions`, `mindfulness_sessions`) with indexes and RLS. Depends on step 1.
3. Run strict deployment gates. Execute `npm run verify:supabase` and `npm run preflight:strict`; both must pass before release. Depends on step 2.
4. Production smoke validation (manual + API). Validate auth flow, core CRUD paths, dashboard loading, and `GET /api/health` in a production-like run. Depends on step 3.
5. CI/CD guardrail hardening. Add/confirm CI workflow to run check/build/server build and strict preflight (or a secret-aware equivalent) to prevent regressions on future merges. Depends on step 3; can run in parallel with step 4 if release timing requires.
6. Deployment execution checklist closure. Verify env contract, build outputs, start command portability, and rollback path; update deployment documentation with final signoff status. Depends on steps 4 and 5.
7. Agile chunked roadmap finalization. Convert remaining improvements into sprint-ready chunks with clear acceptance criteria and sequencing (stability → data quality → impact features). Depends on step 6.
8. Impact feature planning from `suggestion.md`. Prioritize top 3 high-impact real-use features for next cycle with measurable KPI targets and low-risk rollout order. Parallel with step 7.

**Relevant files**
- `c:\Users\Saideep\OneDrive\Desktop\LifeSync\scripts\preflight.mjs` — strict/non-strict gate runner; release gate behavior.
- `c:\Users\Saideep\OneDrive\Desktop\LifeSync\scripts\verify-supabase.mjs` — domain verification logic and failure diagnostics.
- `c:\Users\Saideep\OneDrive\Desktop\LifeSync\scripts\wellness-domains.config.json` — canonical domain/table alias contract.
- `c:\Users\Saideep\OneDrive\Desktop\LifeSync\supabase\migrations\20260316_lifesync_missing_session_tables.sql` — required unblock migration.
- `c:\Users\Saideep\OneDrive\Desktop\LifeSync\server\routes.ts` — runtime API surface including `/api/health`.
- `c:\Users\Saideep\OneDrive\Desktop\LifeSync\package.json` — scripts for deploy gates and runtime.
- `c:\Users\Saideep\OneDrive\Desktop\LifeSync\DEPLOYMENT_READY_EXECUTION_PLAN_2026-03-17.md` — deployment phases and required checks.
- `c:\Users\Saideep\OneDrive\Desktop\LifeSync\AGILE_CHUNK_DEVELOPMENT_ROADMAP.md` — chunk-based development sequencing.
- `c:\Users\Saideep\OneDrive\Desktop\LifeSync\suggestion.md` — high-impact product improvement backlog.

**Verification**
1. `npm run check` passes.
2. `npm run build` and `npm run build:server` pass.
3. `npm run verify:supabase` passes all required domains after migration.
4. `npm run preflight:strict` passes end-to-end.
5. `GET /api/health` returns healthy payload in deployed runtime.
6. Manual smoke: login/register, one write+read in tasks/water/mood/study/activity.

**Decisions**
- Included: deployment-readiness work and release-quality validation only.
- Included: chunked agile plan and high-impact feature prioritization.
- Excluded: broad feature rewrites not required for deployment gate.
- Assumption: Supabase project access exists to apply pending migration.

**Further Considerations**
1. CI strict checks that depend on Supabase credentials should use environment-protected secrets to avoid flaky public runs.
2. Keep non-strict preflight for local velocity and strict preflight for release-only gating.
3. After strict green, tag a release baseline before starting impact feature chunks.