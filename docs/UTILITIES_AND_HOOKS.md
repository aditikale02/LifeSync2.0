# LifeSync 2.0 — Utilities & Hooks Documentation

> Documentation for custom React hooks, library utilities, and the API client layer.

## Table of Contents

- [Custom React Hooks](#custom-react-hooks)
  - [useAuth](#useauth)
  - [useMeditationSession](#usemeditationsession)
  - [useMobile](#usemobile)
  - [useToast](#usetoast)
- [Library Utilities](#library-utilities)
  - [queryClient.ts](#queryclientts)
  - [supabase.ts](#supabasets)
  - [utils.ts](#utilsts)
  - [wellness-api.ts](#wellness-apits)
  - [meditation-sounds.ts](#meditation-soundsts)
- [Server Utilities](#server-utilities)
  - [db.ts](#dbts)
  - [storage.ts](#storagets)
  - [vite.ts](#vitets)
  - [wellness-metrics.ts](#wellness-metricsts)

---

## Custom React Hooks

### `useAuth`

**File:** `src/hooks/use-auth.tsx`

Authentication context hook that manages Supabase user session state.

#### Exported Members

| Export          | Type       | Description                                     |
| --------------- | ---------- | ----------------------------------------------- |
| `AuthProvider`  | Component  | Context provider — wrap around app root          |
| `useAuth()`     | Hook       | Access auth state from any component             |

#### AuthContext Interface

```typescript
interface AuthContextType {
  user: User | null;        // Supabase User object (null if not logged in)
  session: Session | null;  // Supabase Session (contains JWT)
  loading: boolean;         // True while checking initial session
  signOut: () => Promise<void>;  // Sign out and redirect to /login
}
```

#### Behavior

1. On mount, calls `supabase.auth.getSession()` to restore any existing session.
2. Subscribes to `supabase.auth.onAuthStateChange()` for real-time auth events.
3. Automatically redirects:
   - To `/login` when session is lost (and user is not on a public page).
   - To `/dashboard` when user signs in (and is on an auth page).
4. Cleanup: unsubscribes from auth listener on unmount.

#### Usage

```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Redirect to="/login" />;

  return <div>Hello, {user.email}</div>;
}
```

---

### `useMeditationSession`

**File:** `src/hooks/use-meditation-session.ts`

Manages meditation session state including timer, sound playback, and completion tracking.

#### Key Features

- Countdown timer with configurable duration.
- Audio playback integration with `HTMLAudioElement`.
- Session state management (idle → active → completed).
- Saves completed sessions via the wellness API.

---

### `useMobile`

**File:** `src/hooks/use-mobile.tsx`

Viewport-based mobile detection hook.

#### Usage

```typescript
import { useMobile } from "@/hooks/use-mobile";

function MyComponent() {
  const isMobile = useMobile();

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

#### Behavior

- Uses `window.matchMedia` or `window.innerWidth` to detect mobile viewports.
- Returns a boolean that updates on window resize.

---

### `useToast`

**File:** `src/hooks/use-toast.ts`

Toast notification hook built on the Radix UI Toast primitive.

#### Usage

```typescript
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Saved!", description: "Your data was saved." });
  };
}
```

---

## Library Utilities

### `queryClient.ts`

**File:** `src/lib/queryClient.ts`

TanStack React Query client configuration and API request helper.

#### Exported Members

| Export           | Type            | Description                                   |
| ---------------- | --------------- | --------------------------------------------- |
| `queryClient`    | `QueryClient`   | Shared React Query client instance             |
| `apiRequest()`   | Function        | Generic fetch wrapper for mutations            |
| `getQueryFn()`   | Factory         | Creates typed query functions with 401 handling|

#### `apiRequest(method, url, data?)`

Generic fetch wrapper that:
- Sets `Content-Type: application/json` when data is provided.
- Includes credentials (`credentials: "include"`).
- Throws on non-OK responses with status code and error text.

```typescript
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response>
```

#### `getQueryFn(options)`

Factory function that returns a query function for TanStack Query:
- Constructs the URL from `queryKey` array.
- Handles 401 responses based on `on401` option:
  - `"returnNull"` — returns `null` silently (useful for optional auth checks).
  - `"throw"` — throws an error (default behavior).

#### Default Query Client Options

```typescript
{
  queries: {
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,      // Data never becomes stale automatically
    retry: false,             // No automatic retries on failure
  },
  mutations: {
    retry: false,
  },
}
```

---

### `supabase.ts`

**File:** `src/lib/supabase.ts`

Supabase client initialization for the frontend.

#### Exported Members

| Export      | Type             | Description                        |
| ----------- | ---------------- | ---------------------------------- |
| `supabase`  | `SupabaseClient` | Configured Supabase client instance|

#### Configuration

- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from environment.
- Logs a warning if either value is missing (graceful degradation).
- Uses the **anon key** (publishable) for client-side operations.

---

### `utils.ts`

**File:** `src/lib/utils.ts`

General-purpose utility functions.

#### Exported Members

| Export | Type     | Description                                        |
| ------ | -------- | -------------------------------------------------- |
| `cn()` | Function | Merges class names using `clsx` + `tailwind-merge` |

#### `cn(...inputs)`

Combines and deduplicates Tailwind CSS class names:

```typescript
import { cn } from "@/lib/utils";

// Usage
<div className={cn("p-4 bg-red-500", isActive && "bg-blue-500")} />
```

---

### `wellness-api.ts`

**File:** `src/lib/wellness-api.ts`

Type-safe API client for wellness record CRUD operations.

#### Exported Functions

| Function                        | HTTP Method | Endpoint                                       |
| ------------------------------- | ----------- | ---------------------------------------------- |
| `createWellnessRecord(table, payload)` | POST  | `/api/wellness/:table`                          |
| `fetchWellnessRecords(table, userId)`  | GET   | `/api/wellness/:table/:userId`                  |
| `deleteWellnessRecord(table, recordId)`| DELETE| `/api/wellness/:table/record/:recordId`         |
| `deleteWellnessRecordsByField(table, userId, field, value)` | DELETE | `/api/wellness/:table?userId=&field=&value=` |

#### `createWellnessRecord<T>(table, payload)`

```typescript
export async function createWellnessRecord<T extends Record<string, unknown>>(
  table: WellnessTableName,
  payload: T,
): Promise<T & { id: string }>
```

- Sends JSON POST request.
- Returns the created record with a generated `id`.
- Throws on validation or server errors.

#### `fetchWellnessRecords<T>(table, userId)`

```typescript
export async function fetchWellnessRecords<T extends Record<string, unknown>>(
  table: WellnessTableName,
  userId: string,
): Promise<T[]>
```

- Fetches all records for the given user.
- Returns an array sorted by most recent first.

#### `deleteWellnessRecord(table, recordId)`

```typescript
export async function deleteWellnessRecord(
  table: WellnessTableName,
  recordId: string,
): Promise<{ deletedCount: number }>
```

- Deletes a single record by UUID.
- Returns the count of deleted records.

#### `deleteWellnessRecordsByField(table, userId, field, value)`

```typescript
export async function deleteWellnessRecordsByField(
  table: WellnessTableName,
  userId: string,
  field: string,
  value: string,
): Promise<{ deletedCount: number }>
```

- Bulk-deletes records matching a specific field value.
- Sends field/value as query parameters.

---

### `meditation-sounds.ts`

**File:** `src/lib/meditation-sounds.ts`

Sound library metadata for meditation and mindfulness sessions.

- Contains an array of sound objects with `id`, `name`, `url`, and `category`.
- URLs point to files in the `public/sounds/` directory.

---

## Server Utilities

### `db.ts`

**File:** `server/db.ts`

Database connection setup with graceful fallback.

#### Exported Members

| Export        | Type                | Description                              |
| ------------- | ------------------- | ---------------------------------------- |
| `pool`        | `Pool \| null`      | Neon connection pool (null if no DB URL)  |
| `db`          | `DrizzleDB \| null` | Drizzle ORM client (null if no DB URL)    |
| `hasDatabase` | `boolean`           | Whether a database connection is available|

#### Connection Flow

```
DATABASE_URL env var
  │
  ├─► Present: Create Neon Pool → Create Drizzle client → hasDatabase = true
  │
  └─► Missing: pool = null, db = null, hasDatabase = false
      (Server uses MemStorage fallback)
```

---

### `storage.ts`

**File:** `server/storage.ts`

In-memory storage implementation for development without a database.

#### Interface: `IStorage`

```typescript
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSocialInteractionsByUserId(userId: string): Promise<SocialInteraction[]>;
  createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction>;
  getWellnessRecordsByUserId(table: WellnessTableName, userId: string): Promise<Record<string, unknown>[]>;
  createWellnessRecord(table: WellnessTableName, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  deleteWellnessRecord(table: WellnessTableName, recordId: string): Promise<number>;
  deleteWellnessRecordsByField(table: WellnessTableName, userId: string, field: string, value: string): Promise<number>;
}
```

#### Class: `MemStorage`

Implements `IStorage` using `Map` data structures:

- `users: Map<string, User>` — User accounts.
- `socialInteractions: Map<string, SocialInteraction>` — Social records.
- `wellnessRecords: Record<WellnessTableName, Map<string, Record<string, unknown>>>` — Per-table record maps.

**Characteristics:**
- Data is lost on server restart (non-persistent).
- Sorts records by `createdAt` descending.
- Generates UUIDs via `crypto.randomUUID()`.
- Exported singleton: `export const storage = new MemStorage();`

---

### `vite.ts`

**File:** `server/vite.ts`

Vite integration for development and production static serving.

#### Exported Functions

| Function                | Environment | Description                                |
| ----------------------- | ----------- | ------------------------------------------ |
| `setupVite(app, server)`| Development | Attaches Vite middleware for HMR + SSR     |
| `serveStatic(app)`      | Production  | Serves built files from `dist/`            |
| `log(message, source)`  | Both        | Formatted console logging with timestamps  |

---

### `wellness-metrics.ts`

**File:** `server/wellness-metrics.ts`

Wellness score computation and insight generation engine.

#### Exported Functions

| Function                    | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `buildWellnessSummary(data, days)` | Computes all scores, metrics, and trends        |
| `buildInsightFromSummary(summary)` | Generates human-readable insights from scores   |

#### Internal Helper Functions

| Function            | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `toDate(record)`    | Extracts Date from `createdAt` or `startedAt`            |
| `inLastDays(record, days)` | Checks if record falls within the last N days     |
| `avg(values)`       | Arithmetic mean of number array                          |
| `sum(values)`       | Sum of number array                                      |
| `clamp100(value)`   | Clamps a number to 0–100 range                           |
| `stdev(values)`     | Standard deviation of number array                       |
| `dailyCounts(records, days)` | Groups records by day with counts and values    |
| `getSocialImpact(record)` | Calculates impact score from rating × category multiplier |
| `latestByKey(records, keyField)` | Deduplicates records by a key field (latest wins)|
| `latestPerDay(records)` | Keeps only the most recent record per calendar day   |
| `computeSnapshot(data, days)` | Core scoring algorithm (all 5 pillars)           |

#### Scoring Algorithm

The **LifeSync Score** is a weighted composite of five pillars:

| Pillar        | Weight | Components                                       |
| ------------- | ------ | ------------------------------------------------ |
| Mind          | 25%    | Meditation + mindfulness minutes, sleep, session count |
| Emotional     | 20%    | Mood average, journal streak, gratitude frequency |
| Social        | 20%    | Interaction impact (75%) + frequency (25%)        |
| Productivity  | 20%    | Habits (50%) + goals (30%) + tasks (20%)          |
| Physical      | 15%    | Activity minutes (60%) + hydration (40%)          |

#### Cross-Pillar Correlations

The engine detects relationships between wellness pillars:

| Correlation              | Detection Logic                                |
| ------------------------ | ---------------------------------------------- |
| Sleep vs. Mood           | `negative` if avg sleep < 6.5h AND mood < 3   |
| Meditation vs. Productivity | `positive` if ≥ 3 sessions AND tasks ≥ 60% |
| Activity vs. Emotional   | `positive` if ≥ 150 min AND emotional ≥ 70    |
| Gratitude vs. Mood       | `positive` if ≥ 5 entries AND mood ≥ 3.5       |
| Social vs. Mood          | `positive` if positive ratio ≥ 70% AND mood ≥ 3.5 |

---

*See also: [Components](./COMPONENTS.md) · [API Documentation](./API_DOCUMENTATION.md) · [Database Schema](./DATABASE_SCHEMA.md)*
