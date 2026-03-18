# Agile Chunk Development Roadmap

Date: 2026-03-17
Last updated: 2026-03-18

## Current Execution Status (2026-03-18)

- Chunk 1: ✅ Completed (build/run/preflight stability + cross-platform scripts)
- Chunk 2: ✅ Completed (Supabase schema verification now passing)
- Chunk 3: ✅ Completed (E2E smoke and route matrix green)
- Chunk 4: ✅ Completed (strict deployment gate green)
- Chunk 5: 🔜 Active next cycle (driven by `suggestion.md`)

Immediate next executable commands:

1. Tag release baseline from current strict-green state
2. Start Chunk 5 Sprint-1 implementation for Top-3 impact features
3. Ship in low-risk flags with KPI instrumentation

## Chunk 1 — Stabilize Core Build/Run

**Goal**: Ensure app builds and runs consistently across environments.

- Tasks:
  - Type-check and build gate stabilization
  - Cross-platform runtime scripts
  - Preflight pipeline
- Done when:
  - `npm run preflight` passes (non-strict)

## Chunk 2 — Data Layer Convergence

**Goal**: Remove schema drift between app, checker, and Supabase target.

- Tasks:
  - Apply missing migration for session domains
  - Re-run strict Supabase verification
  - Align canonical table mappings and aliases
- Done when:
  - `npm run verify:supabase` passes all required domains

## Chunk 3 — Functional E2E Hardening

**Goal**: Ensure all dashboard workflows are persistently reliable.

- Tasks:
  - Execute one-by-one route and API test cases
  - Validate auth + CRUD + summaries + insights
  - Regression pass after fixes
- Done when:
  - Full phase test report shows no blocker failures

## Chunk 4 — Deployment Readiness

**Goal**: Make release process deterministic and observable.

- Tasks:
  - `/api/health` checks and uptime monitoring
  - Strict CI gate (`preflight:strict`)
  - Environment variable contract verification
- Done when:
  - Production build + strict checks pass in CI

## Chunk 5 — Product Impact Improvements

**Goal**: Prioritize features that drive real user retention/outcomes.

- Tasks:
  - implement top impact suggestions from `suggestion.md`
  - instrument key engagement metrics
  - run phased rollout with feedback loop
- Done when:
  - measurable improvement in activation/retention metrics

## Top 3 Impact Features (Next Cycle)

Priority is derived from `suggestion.md` and optimized for low-risk rollout order.

### 1) Outcome-Driven Daily Plan

- Why first:
  - Highest immediate daily utility and retention leverage.
- Sprint acceptance criteria:
  - Personalized daily plan renders for authenticated users.
  - Plan includes top priorities + hydration + focus windows.
  - Non-blocking fallback when data is sparse.
- KPI targets (first 2 weeks):
  - Daily active users opening plan card: ≥ 60% of DAU.
  - Task completion lift among exposed users: +10%.

### 2) Risk Alerts + Early Intervention

- Why second:
  - Converts passive tracking into proactive support.
- Sprint acceptance criteria:
  - Rule-based risk detector for sleep/mood/completion decline.
  - In-app alert with one concrete intervention action.
  - Alert frequency capped to prevent fatigue.
- KPI targets (first 2 weeks):
  - Alert acknowledge rate: ≥ 40%.
  - 7-day negative trend persistence reduced by 15%.

### 3) Weekly Coach Report (Shareable)

- Why third:
  - Reinforces accountability and weekly re-engagement.
- Sprint acceptance criteria:
  - Weekly summary generated from existing wellness domains.
  - Includes wins, setbacks, and next-week actions.
  - Export/share action available.
- KPI targets (first 2 weeks):
  - Weekly report open rate: ≥ 45% of weekly actives.
  - Week-over-week return among viewers: +8%.

## Low-risk Rollout Sequence

1. Feature flags per capability (plan, alerts, report).
2. Internal QA + 10% cohort exposure.
3. Expand to 50% after KPI/no-regression check.
4. Full rollout after one stable weekly cycle.

## Sprint Cadence Recommendation

- Sprint length: 1 week
- Ceremony lightweight:
  - Day 1: plan chunk tasks
  - Day 3: mid-sprint checkpoint
  - Day 5: demo + retrospective + carryover decisions
