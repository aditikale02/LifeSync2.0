# LifeSync 2.0 — Project Structure

> Complete directory layout and file organization for the LifeSync wellness application.

## Table of Contents

- [Overview](#overview)
- [Root Directory](#root-directory)
- [Source Code (`src/`)](#source-code-src)
- [Server (`server/`)](#server-server)
- [Shared (`shared/`)](#shared-shared)
- [Static Assets (`public/`)](#static-assets-public)
- [Configuration Files](#configuration-files)
- [Documentation](#documentation)

---

## Overview

LifeSync 2.0 follows a **monorepo** layout with three main code directories:

| Directory   | Purpose                                   |
| ----------- | ----------------------------------------- |
| `src/`      | React frontend (pages, components, hooks) |
| `server/`   | Express backend (routes, database, Vite)  |
| `shared/`   | Shared types, schemas, and constants      |

Path aliases simplify imports across the codebase:

| Alias       | Resolves To   |
| ----------- | ------------- |
| `@/*`       | `src/*`       |
| `@shared/*` | `shared/*`    |
| `@assets/*` | `attached_assets/*` |

---

## Root Directory

```
LifeSync2.0/
├── docs/                          # Project documentation (this folder)
├── src/                           # React frontend application
├── server/                        # Express backend API
├── shared/                        # Shared schemas and types
├── public/                        # Static assets served by Vite
├── attached_assets/               # Additional static assets
│
├── index.html                     # Vite HTML entry point
├── package.json                   # Dependencies and npm scripts
├── package-lock.json              # Locked dependency tree
├── vite.config.ts                 # Vite bundler configuration
├── tsconfig.json                  # TypeScript compiler options
├── tailwind.config.ts             # Tailwind CSS theme & plugins
├── postcss.config.js              # PostCSS pipeline (Tailwind, autoprefixer)
├── drizzle.config.ts              # Drizzle ORM migration configuration
├── components.json                # shadcn/ui component configuration
├── vercel.json                    # Vercel deployment settings
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
└── .replit                        # Replit workspace settings
```

---

## Source Code (`src/`)

```
src/
├── main.tsx                       # React DOM entry — renders <App />
├── App.tsx                        # Root component: providers, routing, layout
├── index.css                      # Global Tailwind directives and custom styles
│
├── pages/                         # Route-level page components (27 files)
│   ├── landing.tsx                # Public landing / marketing page
│   ├── login.tsx                  # Login & registration form
│   ├── register.tsx               # Registration (shared with login)
│   ├── home.tsx                   # Main dashboard (protected)
│   ├── dashboard-hub.tsx          # Dashboard hub overview
│   ├── wellness-test.tsx          # Initial wellness assessment
│   ├── profile.tsx                # User profile & settings
│   ├── todo.tsx                   # To-do list management
│   ├── pomodoro.tsx               # Pomodoro focus timer
│   ├── water.tsx                  # Hydration tracking
│   ├── meditation.tsx             # Guided meditation sessions
│   ├── mindfulness.tsx            # Mindfulness exercises
│   ├── mood.tsx                   # Daily mood logging
│   ├── sleep.tsx                  # Sleep tracking
│   ├── activity.tsx               # Physical activity logging
│   ├── health.tsx                 # Health overview dashboard
│   ├── journal.tsx                # Journal entries
│   ├── study.tsx                  # Study session tracking
│   ├── habits.tsx                 # Habit streak management
│   ├── gratitude.tsx              # Gratitude journaling
│   ├── goals.tsx                  # Goal setting & progress
│   ├── social.tsx                 # Social interactions
│   ├── games.tsx                  # Wellness mini-games
│   ├── feedback.tsx               # User feedback form
│   ├── analytics.tsx              # Analytics dashboard
│   ├── ai-insights.tsx            # AI-generated wellness insights
│   └── not-found.tsx              # 404 error page
│
├── components/                    # Reusable UI components
│   ├── app-sidebar.tsx            # Main navigation sidebar
│   ├── cat-mascot.tsx             # Interactive cat mascot character
│   ├── empty-state.tsx            # Empty-state placeholder UI
│   ├── nature-background.tsx      # Animated nature background
│   ├── progress-ring.tsx          # Circular progress visualization (SVG)
│   ├── stat-card.tsx              # Statistics display card
│   ├── theme-provider.tsx         # Dark / light theme context provider
│   ├── theme-toggle.tsx           # Theme switcher button
│   │
│   └── ui/                        # shadcn/ui primitives (43 components)
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── alert-dialog.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx              # Recharts integration wrapper
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input.tsx
│       ├── input-otp.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle.tsx
│       ├── toggle-group.tsx
│       └── tooltip.tsx
│
├── hooks/                         # Custom React hooks
│   ├── use-auth.tsx               # Supabase auth context & hook
│   ├── use-meditation-session.ts  # Meditation timer & sound management
│   ├── use-mobile.tsx             # Viewport-based mobile detection
│   └── use-toast.ts               # Toast notification hook (Radix)
│
├── lib/                           # Utility libraries
│   ├── queryClient.ts             # TanStack React Query client setup
│   ├── supabase.ts                # Supabase client initialization
│   ├── utils.ts                   # General helpers (cn, formatters)
│   ├── wellness-api.ts            # Fetch wrapper for wellness endpoints
│   └── meditation-sounds.ts       # Sound library metadata
│
└── examples/                      # Reference / example components
    ├── AnalyticsPage.tsx
    ├── CatMascot.tsx
    ├── FeedbackPage.tsx
    ├── GamesPage.tsx
    ├── Home.tsx
    ├── Login.tsx
    ├── MeditationPage.tsx
    ├── NatureBackground.tsx
    ├── PomodoroPage.tsx
    ├── ProgressRing.tsx
    ├── StatCard.tsx
    ├── ThemeToggle.tsx
    ├── TodoPage.tsx
    ├── WaterPage.tsx
    └── WellnessTest.tsx
```

---

## Server (`server/`)

```
server/
├── index.ts                       # Express app bootstrap & HTTP listener
├── routes.ts                      # All API route handlers + table bootstrap
├── db.ts                          # Neon PostgreSQL pool & Drizzle ORM client
├── storage.ts                     # IStorage interface + in-memory fallback
├── vite.ts                        # Dev-mode Vite SSR middleware integration
└── wellness-metrics.ts            # Wellness score computation engine
```

| File                  | Responsibility                                                        |
| --------------------- | --------------------------------------------------------------------- |
| `index.ts`            | Creates Express app, registers routes, attaches Vite or static serve  |
| `routes.ts`           | Defines REST endpoints, bootstraps DB tables, validates with Zod      |
| `db.ts`               | Conditional Neon pool + Drizzle ORM client (graceful fallback)        |
| `storage.ts`          | `IStorage` interface & `MemStorage` class for dev without a database  |
| `vite.ts`             | Vite dev server middleware, static file serving, request logging       |
| `wellness-metrics.ts` | Score computation, cross-pillar analysis, AI insight generation        |

---

## Shared (`shared/`)

```
shared/
├── schema.ts                      # Drizzle table definitions + Zod schemas + TS types
└── social.ts                      # Social interaction categories, ratings, multipliers
```

`shared/` is imported by **both** frontend and backend via the `@shared/*` alias, ensuring type safety across the full stack.

---

## Static Assets (`public/`)

```
public/
└── sounds/                        # Audio files for meditation / mindfulness
```

Files in `public/` are served at the root URL path by Vite (e.g., `/sounds/rain.mp3`).

---

## Configuration Files

| File                | Purpose                                                      |
| ------------------- | ------------------------------------------------------------ |
| `vite.config.ts`    | Vite plugins (React, Replit), path aliases, build output      |
| `tsconfig.json`     | Strict TypeScript, ESNext modules, path mapping               |
| `tailwind.config.ts`| Custom theme colors, fonts, animation utilities               |
| `postcss.config.js` | PostCSS pipeline (Tailwind CSS, autoprefixer)                 |
| `drizzle.config.ts` | Drizzle Kit schema path, migration output, Postgres dialect   |
| `components.json`   | shadcn/ui style (new-york), aliases, Tailwind CSS variables   |
| `vercel.json`       | Vercel build command, output directory, SPA rewrite rules     |
| `.env.example`      | Required environment variable template                        |

---

## File Statistics

| Category               | Count |
| ---------------------- | ----- |
| Page components        | 27    |
| Custom components      | 8     |
| shadcn/ui components   | 43    |
| Custom hooks           | 4     |
| Library / utility files| 5     |
| Server source files    | 5     |
| Shared source files    | 2     |
| Example components     | 15    |
| **Total source files** | **~109** |

---

*See also: [Architecture](./ARCHITECTURE.md) · [API Documentation](./API_DOCUMENTATION.md) · [Components](./COMPONENTS.md)*
