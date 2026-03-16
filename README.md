# LifeSync 2.0

> A comprehensive full-stack wellness tracking platform built with React, Express, and PostgreSQL.

LifeSync helps users monitor and improve their wellbeing across five core pillars: **Mind**, **Emotional**, **Social**, **Productivity**, and **Physical** wellness — all unified by a single **LifeSync Score**.

---

## Features

- 🧘 **Meditation & Mindfulness** — Guided sessions with ambient sounds and progress tracking
- 😊 **Mood Tracking** — Daily mood logging with 1–5 scores, labels, and notes
- 📓 **Journaling** — Rich journal entries with mood emoji and word count
- 🙏 **Gratitude** — Categorized gratitude entries with emoji support
- ✅ **Habits & Goals** — Streak tracking, daily check-ins, short/long-term goals
- 📝 **To-Do & Pomodoro** — Priority-based task management with focus timer
- 🏃 **Activity & Sleep** — Physical activity logging, sleep duration tracking
- 💧 **Hydration** — Daily water intake tracking with customizable goals
- 📚 **Study Sessions** — Subject-based study logging with focus ratings
- 🤝 **Social Interactions** — Track and rate social encounters by category
- 📊 **Analytics Dashboard** — Charts, trends, and cross-pillar correlations
- 🤖 **AI Insights** — Personalized wellness recommendations and score analysis
- 🌙 **Dark/Light Theme** — System-aware theming with manual toggle
- 🐱 **Cat Mascot** — Friendly interactive companion with contextual messages

---

## Tech Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Frontend     | React 18 · TypeScript · Tailwind CSS · Vite 5           |
| UI Library   | shadcn/ui · Radix UI · Lucide Icons · Framer Motion     |
| Routing      | Wouter (lightweight client-side router)                  |
| State        | TanStack Query (server state) · React Context (auth)     |
| Charts       | Recharts                                                 |
| Backend      | Express 4 · Node.js · tsx runtime                        |
| Database     | PostgreSQL (Neon) · Drizzle ORM                          |
| Auth         | Supabase Auth (JWT)                                      |
| Validation   | Zod (shared schemas)                                     |
| Build        | Vite (frontend) · esbuild (server)                       |

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Setup

```bash
# Clone the repository
git clone https://github.com/aditikale02/LifeSync2.0.git
cd LifeSync2.0

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase and database credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`.

### Scripts

| Command              | Description                               |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Start dev server with HMR (port 5000)     |
| `npm run build`      | Build frontend for production             |
| `npm run build:server` | Bundle server for production            |
| `npm run start`      | Start production server                   |
| `npm run check`      | Run TypeScript type checking              |
| `npm run db:push`    | Push schema changes to database           |

---

## Project Structure

```
LifeSync2.0/
├── src/                    # React frontend
│   ├── pages/              #   27 page components
│   ├── components/         #   8 custom + 43 shadcn/ui components
│   ├── hooks/              #   4 custom React hooks
│   └── lib/                #   5 utility modules
├── server/                 # Express backend
│   ├── routes.ts           #   10 REST API endpoints
│   ├── db.ts               #   Database connection
│   ├── storage.ts          #   In-memory storage fallback
│   └── wellness-metrics.ts #   Score computation engine
├── shared/                 # Shared types & schemas
│   ├── schema.ts           #   13 Drizzle tables + Zod validation
│   └── social.ts           #   Social interaction constants
├── docs/                   # Project documentation
└── public/                 # Static assets
```

---

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

| Document | Description |
| -------- | ----------- |
| [📁 Project Structure](./docs/PROJECT_STRUCTURE.md) | Complete directory layout, file organization, and file statistics |
| [🏗️ Architecture](./docs/ARCHITECTURE.md) | System architecture, design patterns, data flow, and security |
| [🔌 API Documentation](./docs/API_DOCUMENTATION.md) | All 10 REST endpoints with request/response schemas |
| [🗄️ Database Schema](./docs/DATABASE_SCHEMA.md) | 14 table definitions, Zod validation, and TypeScript types |
| [🧩 Components](./docs/COMPONENTS.md) | Frontend components, pages, routing, and shadcn/ui catalog |
| [🔧 Utilities & Hooks](./docs/UTILITIES_AND_HOOKS.md) | Custom hooks, API client, server utilities, and metrics engine |
| [🚀 Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) | Local dev, Vercel, Docker, Nginx, PM2, and database setup |

### Additional Documentation

| Document | Description |
| -------- | ----------- |
| [AI Insights Architecture](./AI_INSIGHTS_ARCHITECTURE.md) | AI-powered wellness insights system design |
| [Dashboard Architecture](./DASHBOARDS.md) | Dashboard features and layout |
| [Database Audit Report](./DATABASE_AUDIT_REPORT.md) | Database structure audit findings |
| [Design Guidelines](./design_guidelines.md) | UI/UX design guidelines and style guide |
| [Full App Test Report](./FULL_APP_TEST_REPORT.md) | Comprehensive application testing report |
| [Functional Test Report](./FUNCTIONAL_TEST_REPORT.md) | Functional test coverage |
| [UI Polish Report](./UI_POLISH_REPORT.md) | UI refinement and polish details |

---

## Environment Variables

| Variable                        | Required | Description                            |
| ------------------------------- | -------- | -------------------------------------- |
| `VITE_SUPABASE_URL`             | ✅       | Supabase project URL                   |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅       | Supabase anon/public key               |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅       | Supabase admin key (server only)       |
| `DATABASE_URL`                  | ❌       | PostgreSQL connection string (optional) |

> Without `DATABASE_URL`, the server runs with in-memory storage. See the [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for full setup instructions.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                  CLIENT (React)                      │
│  Pages → Components → Hooks → API Client (fetch)    │
├──────────────────────────────────────────────────────┤
│                 SHARED LAYER                         │
│       Drizzle Schemas · Zod Validation · Types       │
├──────────────────────────────────────────────────────┤
│                SERVER (Express)                      │
│  Routes → Validation → DB (Drizzle/Neon) or MemStore│
├──────────────────────────────────────────────────────┤
│               EXTERNAL SERVICES                      │
│       Supabase Auth · Neon PostgreSQL · OpenAI       │
└──────────────────────────────────────────────────────┘
```

See the full [Architecture Documentation](./docs/ARCHITECTURE.md) for detailed diagrams, design patterns, and data flow.

---

## License

This project is private. All rights reserved.
