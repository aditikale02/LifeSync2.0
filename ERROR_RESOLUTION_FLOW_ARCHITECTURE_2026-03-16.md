# Error Resolution Flow, Architecture, and Process (Redefined)

Date: 2026-03-16

## 1. Target Architecture

### A. Single Source of Truth for Data-Domain Validation
- Contract file: [scripts/wellness-domains.config.json](scripts/wellness-domains.config.json)
- Purpose: defines logical wellness domains, table aliases, and minimal required columns.
- Rule: any schema/table naming change must update this contract first.

### B. Verification Layer
- Verifier: [scripts/verify-supabase.mjs](scripts/verify-supabase.mjs)
- Behavior:
  - Loads domain contract JSON.
  - Validates each logical domain with alias fallback.
  - Treats optional probe checks as non-blocking when missing.
  - Exits non-zero only on true domain failures.

### C. Build + Runtime Layer
- Build scripts: `npm run check`, `npm run build`, `npm run build:server`
- Runtime scripts: `npm start` (cross-platform via `cross-env`)
- Orchestration: [scripts/preflight.mjs](scripts/preflight.mjs)

### D. Migration Layer
- Canonical migration path: `supabase/migrations/*.sql`
- Current repair migration for missing domains:
  - [supabase/migrations/20260316_lifesync_missing_session_tables.sql](supabase/migrations/20260316_lifesync_missing_session_tables.sql)

---

## 2. Error-Solving Flow (Deterministic)

Run exactly this sequence:
1. `npm run preflight`
2. If preflight fails at Supabase verification:
   - apply pending migration(s) in Supabase SQL editor
   - rerun `npm run verify:supabase`
3. Re-run `npm run preflight`
4. Start app: `npm start` (prod) or `npm run dev` (dev)

---

## 3. Process Ownership

- Contract updates (table aliases/domains): `scripts/wellness-domains.config.json`
- Verification behavior and logging: `scripts/verify-supabase.mjs`
- CI/local quality gate: `scripts/preflight.mjs` + `package.json` scripts
- Database schema and RLS: `supabase/migrations/*.sql`

---

## 4. Error Classification Standard

- **Class A (Local Build/Type):** TS/build/startup errors -> fix code/scripts first.
- **Class B (Schema Drift):** verifier domain failure with missing relation/column -> fix migration or contract mapping.
- **Class C (Environment):** missing env vars (`DATABASE_URL`, Supabase keys) -> fix environment before code.

---

## 5. Process Rules to Prevent Recurrence

1. Never hardcode table checks directly in verifier code; update JSON contract only.
2. Never run production boot validation without `cross-env` in scripts.
3. Every schema migration must be followed by `npm run verify:supabase`.
4. Every release candidate must pass `npm run preflight`.
5. Keep fallback aliases until all environments converge on canonical tables.
