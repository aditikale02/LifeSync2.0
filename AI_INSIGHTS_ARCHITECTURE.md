# AI Wellness Insights Architecture

The AI Insights feature connects LifeSync's comprehensive tracking metrics into a smart wellness assistant pipeline. It is intentionally designed using a serverless architecture to ensure that user data stays strictly protected and heavy processing computations live on the backend.

---

## 1. Data Flow

1. **User Request**: The authenticated user clicks "Generate Weekly Insights" on the `/ai-insights` frontend page.
2. **Edge Invocation**: The frontend calls the Supabase Edge Function `generate-ai-insights` and implicitly passes the user's active JSON Web Token (JWT) in the authorization header.
3. **Authentication Verification**: The serverless edge function automatically resolves the user's secure context via their JWT. If invalid, the request is immediately rejected.
4. **Data Aggregation**: The edge function securely fetches all matching wellness records across 8 tracking tables mapped exclusively to the user's identity over the last 7 days.
5. **AI Processing**: The edge function bundles the raw telemetry into a unified context and optionally forwards it to OpenAI's Large Language Models (if configured) or processes it using structured logic heuristically to synthesize insights.
6. **Data Storage**: The resulting insights JSON payload is forcefully stored in the `ai_insights` database table.
7. **Delivery**: The payload is returned securely to the frontend and dynamically mapped into the user's Dashboard UI.

---

## 2. Frontend Integration

The frontend functionality lives in `client/src/pages/ai-insights.tsx`.

- **Client Wrapper**: It utilizes a standard Supabase browser wrapper initiated at `client/src/lib/supabase.ts` which carries environment variables.
- **Execution**: `supabase.functions.invoke<AIInsightRecord>('generate-ai-insights')`
- **UI States**: The page utilizes internal state tracking: `isGenerating` (loading animation/pulse state), `insight` (resolved success state), or empty placeholder state dynamically based on if an active record has been pulled or generated.

---

## 3. Database Interaction

The Edge Function interacts natively using the Postgres SQL interface mapped through `@supabase/supabase-js`.

- Due to Row Level Security, backend logic strictly relies on passing `{ global: { headers: { Authorization: req.headers.get('Authorization') } } }` from the Edge Function arguments downward. 
- Even across a full system scan covering `mood_entries`, `activities`, `sleep_logs`, `habit_logs`, `gratitude_entries`, `meditation_logs`, `water_logs`, and `study_sessions`, the function is cryptographically prevented from viewing any data outside the active caller's ID constraint.
- This creates an automatic guardrail: the AI prompt payload can never leak, mix, or confuse user telemetry data because the database query structurally only ever yields an isolated dataset.

---

## 4. Edge Function Logic (`generate-ai-insights`)

**Deployed Location:** Node / Deno environment acting on the Supabase Edge Network.

**Core Steps:**
1. Handles complex CORS networking internally to allow `OPTIONS` preflights from the UI.
2. Initializes a Supabase context wrapping the incoming requester JWT.
3. Executes a highly parallelized `Promise.all()` fetching pipeline to pull 7 days' worth of logged material concurrently, minimizing network wait times drastically compared to sequential DML pulls.
4. Pre-aggregates specific stats prior to AI formatting (e.g., summarizing total times, grouping averages, doing math counts upfront).
5. If the `OPENAI_API_KEY` edge secret exists on the project, it formats the telemetry block and hits `gpt-4o-mini` with strict JSON mode enabled to ensure standard typing mappings (arranging elements cleanly into `string[]`). If missing, it uses a functional heuristic fallback generation to populate data deterministically.
6. Inserts the compiled report into `ai_insights` utilizing `.insert({ user_id: user.id ... }).select().single()`.
7. Responds with the final JSON `HTTP 200`.

---
*Created per LifeSync Architecture requirements.*
