# LifeSync End-to-End Test Plan (UI + Backend)

## Scope
This implementation covers browser automation with Playwright plus backend verification checks for health/auth and core module persistence behavior.

## Environment
- Target: staging Supabase project
- App URL: `http://127.0.0.1:5100`
- Auth: unique user per run via signup flow
- Isolation: test data names prefixed with `E2E`

## Automated Suite Implemented (Chunk 1)
1. Auth setup (signup + session bootstrap)
2. Protected route enforcement (authenticated/unauthenticated)
3. Core CRUD on Todo
4. Core write/update on Water
5. Backend health endpoint verification
6. Protected route matrix coverage for all major modules

## Test Cases by Area

### 1) Authentication
- Register valid user -> redirects to `/dashboard`
- Storage state persisted for downstream tests
- Unauthenticated access to `/todo` redirects to `/login`
- Authenticated access to `/dashboard` stays authorized

### 2) Core Module: Todo
- Add new task through UI
- Verify task appears in list
- Toggle task completion
- Verify completed visual state (`line-through`)
- Delete task
- Verify task disappears from UI

### 3) Core Module: Water
- Set manual glasses count and save
- Verify saved value remains in input
- Increment hydration by one
- Verify value increments deterministically
- Update daily goal and verify persisted value

### 4) Backend/API
- `GET /api/health` returns 200
- Payload contains `status: ok` and expected service name

### 5) Protected Route Matrix (UI smoke for all modules)
Routes covered:
- `/dashboard`, `/dashboard-hub`, `/timeline`, `/wellness-test`
- `/todo`, `/pomodoro`, `/water`, `/meditation`, `/health`
- `/journal`, `/study`, `/mood`, `/sleep`, `/activity`
- `/social`, `/habits`, `/gratitude`, `/mindfulness`, `/goals`
- `/ai-insights`, `/games`, `/feedback`, `/analytics`, `/profile`

Per route checks:
- Route loads without redirect to login
- Sidebar trigger visible (authenticated shell active)
- Not-found content absent

## Remaining Deep Cases (Next Chunks)
- Per-module backend parity assertions (read-back after each write)
- Negative validations (invalid payloads, stale session behavior)
- Chart/state transition assertions for analytics/health/mood/timeline
- RLS boundary checks with second user
- Cleanup utilities for deterministic staging data pruning

## Execution
- Install browsers: `npm run e2e:install`
- Run suite: `npm run e2e`
- Headed debugging: `npm run e2e:headed`
- Report: `npm run e2e:report`
