# LifeSync 2.0 — System Architecture

> High-level architecture, design patterns, and data flow for the LifeSync wellness platform.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [System Diagram](#system-diagram)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Shared Layer](#shared-layer)
- [Authentication Flow](#authentication-flow)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Design Patterns](#design-patterns)
- [Security Considerations](#security-considerations)
- [Error Handling Strategy](#error-handling-strategy)

---

## Architecture Overview

LifeSync 2.0 is a **full-stack monorepo** application following a **three-layer architecture**:

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT (React)                       │
│   Pages ─► Components ─► Hooks ─► API Client (fetch)    │
├──────────────────────────────────────────────────────────┤
│                    SHARED LAYER                          │
│          Drizzle Schemas · Zod Validation · Types        │
├──────────────────────────────────────────────────────────┤
│                   SERVER (Express)                       │
│  Routes ─► Validation ─► DB (Drizzle/Neon) or MemStore  │
├──────────────────────────────────────────────────────────┤
│                  EXTERNAL SERVICES                       │
│          Supabase Auth · Neon PostgreSQL · OpenAI        │
└──────────────────────────────────────────────────────────┘
```

**Key principles:**

- **Type safety end-to-end** — Shared Zod schemas validate on both client and server.
- **Graceful degradation** — The server runs with an in-memory store when no database is configured.
- **Separation of concerns** — Frontend, backend, and shared code live in distinct directories.

---

## Technology Stack

### Frontend

| Technology          | Version  | Purpose                                |
| ------------------- | -------- | -------------------------------------- |
| React               | 18.3     | UI rendering                           |
| TypeScript          | 5.6      | Static type safety                     |
| Vite                | 5.4      | Dev server & production bundling       |
| Tailwind CSS        | 3.4      | Utility-first styling                  |
| shadcn/ui + Radix   | latest   | Accessible, composable UI primitives   |
| Wouter              | 3.3      | Lightweight client-side routing        |
| TanStack Query      | 5.60     | Server state & data fetching           |
| Framer Motion       | 11.13    | Animations & transitions               |
| Recharts            | 2.15     | Charts & data visualization            |
| Lucide React        | 0.453    | Icon library                           |

### Backend

| Technology          | Version  | Purpose                                |
| ------------------- | -------- | -------------------------------------- |
| Express             | 4.21     | HTTP server & REST API                 |
| Node.js + tsx       | 20+      | Runtime with TypeScript execution      |
| Drizzle ORM         | 0.39     | Type-safe SQL query builder            |
| Neon Serverless     | 0.10     | PostgreSQL connection (serverless)     |
| Zod                 | 3.24     | Runtime request validation             |
| esbuild             | 0.25     | Server bundle for production           |

### External Services

| Service             | Purpose                                |
| ------------------- | -------------------------------------- |
| Supabase Auth       | User registration, login, sessions     |
| Neon PostgreSQL     | Persistent data storage                |
| OpenAI              | AI-powered wellness insights           |

---

## System Diagram

```
                        ┌─────────────────┐
                        │   Browser / PWA  │
                        └────────┬────────┘
                                 │ HTTPS
                        ┌────────▼────────┐
                        │   Vite Dev / CDN │ (static assets)
                        └────────┬────────┘
                                 │
                  ┌──────────────▼──────────────┐
                  │       Express Server         │
                  │  ┌───────────────────────┐   │
                  │  │   Route Handlers      │   │
                  │  │  ┌─────────────────┐  │   │
                  │  │  │ Zod Validation  │  │   │
                  │  │  └────────┬────────┘  │   │
                  │  │           │            │   │
                  │  │  ┌────────▼────────┐  │   │
                  │  │  │ Drizzle ORM /   │  │   │
                  │  │  │ MemStorage      │  │   │
                  │  │  └────────┬────────┘  │   │
                  │  └───────────┼───────────┘   │
                  │              │                │
                  │  ┌───────────▼───────────┐   │
                  │  │ Wellness Metrics Engine│   │
                  │  └───────────────────────┘   │
                  └──────────────┬──────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
  ┌───────▼───────┐    ┌────────▼────────┐   ┌─────────▼──────┐
  │ Neon Postgres  │    │  Supabase Auth  │   │    OpenAI API  │
  │ (persistent)   │    │ (JWT sessions)  │   │ (insights)     │
  └───────────────┘    └─────────────────┘   └────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
<App>
  └── <QueryClientProvider>
       └── <ThemeProvider>
            └── <TooltipProvider>
                 └── <AuthProvider>
                      └── <AppLayout>
                           ├── <AppSidebar />
                           ├── <ThemeToggle />
                           ├── <NatureBackground />
                           ├── <CatMascot />
                           └── <Router>
                                ├── <LandingPage />     (public)
                                ├── <Login />            (public)
                                └── <ProtectedRoute>     (auth-gated)
                                     ├── <Home />
                                     ├── <MeditationPage />
                                     ├── <AnalyticsPage />
                                     └── ... (20+ pages)
```

### Routing Strategy

- **Router:** Wouter (lightweight, ~1.3KB)
- **Public routes:** `/`, `/login`, `/register`, `/signup`
- **Protected routes:** All app pages wrapped in `<ProtectedRoute>`
- **Auth guard:** Redirects to `/login` if no session; shows spinner while loading.
- **404 fallback:** Catches unmatched paths with `<NotFound>`.

### Provider Stack (outermost → innermost)

1. `QueryClientProvider` — TanStack Query cache & mutations
2. `ThemeProvider` — Dark/light mode via `next-themes`
3. `TooltipProvider` — Global tooltip context
4. `AuthProvider` — Supabase session state
5. `SidebarProvider` — Sidebar open/closed state

---

## Backend Architecture

### Server Startup Sequence

```
server/index.ts
  │
  ├─► Create Express app
  ├─► Attach JSON body parser (with raw body for webhooks)
  ├─► Attach request logging middleware
  ├─► registerRoutes(app)
  │     ├─► bootstrapWellnessTables()   (CREATE TABLE IF NOT EXISTS)
  │     └─► Define 10 API endpoints
  ├─► Attach global error handler
  ├─► setupVite(app, server)            (dev) or serveStatic(app) (prod)
  └─► Listen on port 5000
```

### Storage Abstraction

The server uses the **Strategy pattern** for data persistence:

```typescript
interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSocialInteractionsByUserId(userId: string): Promise<SocialInteraction[]>;
  createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction>;
  getWellnessRecordsByUserId(table, userId): Promise<Record<string, unknown>[]>;
  createWellnessRecord(table, input): Promise<Record<string, unknown>>;
  deleteWellnessRecord(table, recordId): Promise<number>;
  deleteWellnessRecordsByField(table, userId, field, value): Promise<number>;
}
```

**Implementations:**

| Mode           | Storage        | When                                 |
| -------------- | -------------- | ------------------------------------ |
| Development    | `MemStorage`   | `DATABASE_URL` not set               |
| Production     | Drizzle + Neon | `DATABASE_URL` configured            |

Each route handler checks `hasDatabase && db` to select the storage path.

### Wellness Metrics Engine

`server/wellness-metrics.ts` provides two key exported functions:

1. **`buildWellnessSummary(data, days)`** — Aggregates all wellness data into scores:
   - Mind Score (meditation, sleep, mindfulness)
   - Emotional Score (mood, journal, gratitude)
   - Social Score (interaction frequency & sentiment)
   - Productivity Score (habits, goals, tasks)
   - Physical Score (activity, hydration)
   - **LifeSync Score** (weighted composite of all pillars)
   - Cross-pillar correlations (sleep vs. mood, meditation vs. productivity, etc.)

2. **`buildInsightFromSummary(summary)`** — Generates actionable insights:
   - Identifies strengths and areas for improvement
   - Produces personalized recommendations
   - Returns a human-readable summary text

---

## Shared Layer

The `shared/` directory ensures **type consistency** between frontend and backend.

### `shared/schema.ts`

- **13 Drizzle table definitions** (users + 12 wellness tables)
- **12 Zod insert schemas** with validation rules
- **24 TypeScript types** (Insert + Select for each table)
- **Lookup maps** (`wellnessTables`, `wellnessInsertSchemas`) for dynamic routing

### `shared/social.ts`

- Interaction categories: Friends, Family, Strangers, Animals
- Interaction ratings: Very Positive → Very Negative
- Score multipliers per category

---

## Authentication Flow

```
┌──────────┐                  ┌──────────────┐           ┌─────────────┐
│  Browser  │                  │ Express API  │           │  Supabase   │
└─────┬────┘                  └──────┬───────┘           └──────┬──────┘
      │                              │                          │
      │  1. POST /api/auth/register  │                          │
      │ ─────────────────────────►   │                          │
      │                              │  2. admin.createUser()   │
      │                              │ ─────────────────────►   │
      │                              │                          │
      │                              │  3. User created (JWT)   │
      │                              │ ◄─────────────────────   │
      │  4. 201 Created              │                          │
      │ ◄─────────────────────────   │                          │
      │                              │                          │
      │  5. supabase.auth.signIn()   │                          │
      │ ─────────────────────────────────────────────────────►  │
      │                              │                          │
      │  6. Session + JWT            │                          │
      │ ◄─────────────────────────────────────────────────────  │
      │                              │                          │
      │  7. AuthProvider updates     │                          │
      │     user state ─► redirect   │                          │
      │     to /dashboard            │                          │
```

**Key details:**

- Registration uses Supabase Admin API (server-side, service role key).
- Login happens **client-side** via `supabase.auth.signInWithPassword()`.
- Session management is handled by Supabase JS client with `onAuthStateChange`.
- The `AuthProvider` context broadcasts user state to all components.

---

## Data Flow

### Write Path (Creating a Wellness Record)

```
Page Component
  │
  ├─► Call createWellnessRecord(table, payload)    [src/lib/wellness-api.ts]
  │     │
  │     ├─► POST /api/wellness/:table               [fetch]
  │     │
  │     └─► Server receives request                  [server/routes.ts]
  │           ├─► Validate with Zod schema
  │           ├─► Generate UUID + timestamp
  │           ├─► Insert via Drizzle ORM (or MemStorage)
  │           └─► Return 201 + record JSON
  │
  └─► Invalidate TanStack Query cache → re-fetch
```

### Read Path (Fetching Wellness Records)

```
Page Component
  │
  ├─► useQuery(["wellness", table, userId])        [TanStack Query]
  │     │
  │     ├─► GET /api/wellness/:table/:userId        [fetch]
  │     │
  │     └─► Server returns sorted records            [server/routes.ts]
  │           ├─► SELECT ... WHERE user_id = $1 ORDER BY created_at DESC
  │           └─► Return JSON array
  │
  └─► Render data in page component
```

---

## State Management

| Layer              | Tool               | Scope                             |
| ------------------ | ------------------ | --------------------------------- |
| Server state       | TanStack Query     | API data, caching, invalidation   |
| Auth state         | React Context      | User session, signOut callback    |
| Theme state        | next-themes        | Dark/light mode preference        |
| UI state           | React `useState`   | Form inputs, toggles, modals      |
| Sidebar state      | SidebarProvider    | Open/closed sidebar               |

There is **no global client-side store** (e.g., Redux, Zustand). Each page fetches its own data via TanStack Query, which handles caching and deduplication automatically.

---

## Design Patterns

| Pattern                 | Usage                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| **Provider Pattern**    | Auth, Theme, Query, Tooltip — nested context providers in App    |
| **Strategy Pattern**    | `IStorage` interface with `MemStorage` / Drizzle implementations |
| **Protected Route**     | HOC wrapping pages with auth check + loading state               |
| **Dynamic Routing**     | `/api/wellness/:table` maps to Drizzle tables via lookup object  |
| **Schema-First**        | Drizzle tables → Zod schemas → TypeScript types (single source)  |
| **Composition**         | shadcn/ui components composed from Radix UI primitives           |
| **Compound Component**  | Sidebar, Tabs, Dialog — multi-part Radix components              |
| **Custom Hook**         | Encapsulate reusable logic (auth, meditation, mobile, toast)     |
| **API Client Layer**    | `wellness-api.ts` abstracts fetch calls behind typed functions   |

---

## Security Considerations

| Area                | Implementation                                                  |
| ------------------- | --------------------------------------------------------------- |
| Authentication      | Supabase Auth with JWT tokens; service-role key server-side only|
| Input validation    | Zod schemas on every write endpoint                             |
| SQL injection       | Drizzle ORM parameterized queries (no raw SQL with user input)  |
| CORS                | Same-origin (Vite proxy in dev, single domain in prod)          |
| Secrets             | `.env` file excluded from Git; `.env.example` provides template |
| Body parsing        | `express.json()` with raw body capture for webhook verification |

---

## Error Handling Strategy

### Server-Side

- Every route handler wraps logic in `try/catch`.
- Zod `.safeParse()` returns structured validation errors (400).
- Global Express error handler catches unhandled errors (500).
- Error responses follow a consistent `{ message: string }` shape.

### Client-Side

- `throwIfResNotOk()` in `queryClient.ts` converts HTTP errors to thrown exceptions.
- TanStack Query surfaces errors to components via `error` / `isError` states.
- Toast notifications display user-friendly error messages.
- `AuthProvider` handles auth state transitions gracefully.

---

*See also: [Project Structure](./PROJECT_STRUCTURE.md) · [API Documentation](./API_DOCUMENTATION.md) · [Database Schema](./DATABASE_SCHEMA.md)*
