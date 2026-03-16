# LifeSync 2.0 — Components & Pages Documentation

> Documentation for all frontend components, pages, and the routing architecture.

## Table of Contents

- [Component Architecture](#component-architecture)
- [App Entry Point](#app-entry-point)
- [Routing Configuration](#routing-configuration)
- [Page Components](#page-components)
- [Custom Components](#custom-components)
- [shadcn/ui Components](#shadcnui-components)
- [Examples Directory](#examples-directory)

---

## Component Architecture

LifeSync follows a **layered component architecture**:

```
┌─────────────────────────────────────────┐
│              Pages (27)                  │  Route-level views
│  Full-page components mapped to URLs    │
├─────────────────────────────────────────┤
│          Custom Components (8)          │  App-specific reusable UI
│  Sidebar, mascot, stat cards, etc.      │
├─────────────────────────────────────────┤
│        shadcn/ui Primitives (43)        │  Design system base
│  Button, Dialog, Card, Form, etc.       │
├─────────────────────────────────────────┤
│          Radix UI Primitives            │  Accessible headless UI
│  (installed via shadcn/ui)              │
└─────────────────────────────────────────┘
```

**Conventions:**
- Components use **PascalCase** file names for examples; **kebab-case** for actual components.
- All components are **TypeScript React** (`.tsx`).
- Styling uses **Tailwind CSS** utility classes + `cn()` helper for conditional merging.
- shadcn/ui components follow the **New York** style variant.

---

## App Entry Point

### `src/main.tsx`

Minimal React DOM entry point:

```typescript
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### `src/App.tsx`

Root component that assembles the full provider stack and layout.

**Key exports:**

| Function         | Purpose                                                    |
| ---------------- | ---------------------------------------------------------- |
| `App()`          | Default export — wraps providers around `AppLayout`        |
| `ProtectedRoute` | Auth guard component — redirects to `/login` if no user    |
| `Router()`       | Defines all `<Route>` and `<ProtectedRoute>` mappings      |
| `AppLayout()`    | Conditional layout — sidebar for auth'd users, plain for guests |

**Provider nesting order:**

```
QueryClientProvider → ThemeProvider → TooltipProvider → AuthProvider → AppLayout
```

---

## Routing Configuration

### Public Routes

| Path        | Component      | Description            |
| ----------- | -------------- | ---------------------- |
| `/`         | `LandingPage`  | Marketing/landing page |
| `/login`    | `Login`        | Login form             |
| `/register` | `Login`        | Registration form      |
| `/signup`   | `Login`        | Registration (alias)   |

### Protected Routes (require authentication)

| Path              | Component          | Description                   |
| ----------------- | ------------------ | ----------------------------- |
| `/dashboard`      | `Home`             | Main dashboard                |
| `/dashboard-hub`  | `DashboardHubPage` | Dashboard overview hub        |
| `/wellness-test`  | `WellnessTest`     | Initial wellness assessment   |
| `/todo`           | `TodoPage`         | To-do list management         |
| `/pomodoro`       | `PomodoroPage`     | Pomodoro focus timer          |
| `/water`          | `WaterPage`        | Hydration tracking            |
| `/meditation`     | `MeditationPage`   | Meditation sessions           |
| `/health`         | `HealthPage`       | Health overview               |
| `/journal`        | `JournalPage`      | Journal entries               |
| `/study`          | `StudyPage`        | Study session tracking        |
| `/mood`           | `MoodPage`         | Mood logging                  |
| `/sleep`          | `SleepPage`        | Sleep tracking                |
| `/activity`       | `ActivityPage`     | Activity logging              |
| `/social`         | `SocialPage`       | Social interactions           |
| `/habits`         | `HabitsPage`       | Habit management              |
| `/gratitude`      | `GratitudePage`    | Gratitude journal             |
| `/mindfulness`    | `MindfulnessPage`  | Mindfulness exercises         |
| `/goals`          | `GoalsPage`        | Goal tracking                 |
| `/ai-insights`    | `AiInsightsPage`   | AI wellness insights          |
| `/games`          | `GamesPage`        | Wellness mini-games           |
| `/feedback`       | `FeedbackPage`     | User feedback form            |
| `/analytics`      | `AnalyticsPage`    | Analytics dashboard           |
| `/profile`        | `ProfilePage`      | User profile settings         |

### Auth Guard: `ProtectedRoute`

```typescript
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();

  if (loading) return <Loader2 spinner />;
  if (!user) { redirect to /login; return null; }

  return <Component {...rest} />;
}
```

---

## Page Components

All page components reside in `src/pages/` and are **self-contained views** that:

1. Fetch data using `useAuth()` (user ID) + `fetchWellnessRecords()` or TanStack Query.
2. Render forms for data entry using shadcn/ui form components.
3. Display data visualizations using Recharts or custom components.
4. Handle CRUD operations via `wellness-api.ts` utility functions.

### Page Categories

#### Authentication Pages

| File           | Description                                    |
| -------------- | ---------------------------------------------- |
| `landing.tsx`  | Public landing page with feature overview       |
| `login.tsx`    | Dual-purpose login / registration form         |
| `register.tsx` | Registration page (may redirect to login)      |

#### Dashboard Pages

| File              | Description                                |
| ----------------- | ------------------------------------------ |
| `home.tsx`        | Main dashboard with wellness overview      |
| `dashboard-hub.tsx` | Hub connecting all dashboard features    |
| `profile.tsx`     | User profile and settings                  |

#### Wellness Tracking Pages

| File              | Data Table              | Key Features                     |
| ----------------- | ----------------------- | -------------------------------- |
| `meditation.tsx`  | `meditation_sessions`   | Timer, sound selection, history  |
| `mindfulness.tsx` | `mindfulness_sessions`  | Phase cycles, guided exercises   |
| `mood.tsx`        | `mood_entries`          | 1–5 score, labels, notes         |
| `sleep.tsx`       | `sleep_logs`            | Bedtime/wake time, duration      |
| `water.tsx`       | `water_logs`            | Glass counter, daily goal        |
| `activity.tsx`    | `activity_logs`         | Activity type, duration, intensity|
| `journal.tsx`     | `journal_entries`       | Rich text, mood emoji, word count|
| `gratitude.tsx`   | `gratitude_entries`     | Category, emoji, text            |
| `study.tsx`       | `study_logs`            | Subject, duration, focus rating  |

#### Productivity Pages

| File           | Data Table | Key Features                     |
| -------------- | ---------- | -------------------------------- |
| `habits.tsx`   | `habits`   | Streak tracking, daily check-in  |
| `goals.tsx`    | `goals`    | Short/long term, progress bars   |
| `todo.tsx`     | `todos`    | Priority levels, completion      |
| `pomodoro.tsx` | —          | Timer-based focus sessions       |

#### Social & Engagement Pages

| File           | Description                                |
| -------------- | ------------------------------------------ |
| `social.tsx`   | Social interaction logging & analysis      |
| `games.tsx`    | Wellness-themed mini-games                 |
| `feedback.tsx` | User feedback submission form              |

#### Analytics Pages

| File              | Description                                |
| ----------------- | ------------------------------------------ |
| `analytics.tsx`   | Charts and data visualizations             |
| `ai-insights.tsx` | AI-generated wellness recommendations      |
| `health.tsx`      | Combined health metrics overview           |
| `wellness-test.tsx` | Initial wellness assessment quiz         |

---

## Custom Components

### `app-sidebar.tsx`

**Purpose:** Main navigation sidebar for authenticated users.

- Built on shadcn/ui `<Sidebar>` component.
- Contains navigation links to all app pages.
- Collapsible with icon-only mode.
- Highlights the current active route.

### `cat-mascot.tsx`

**Purpose:** Interactive animated cat mascot character.

- Displays contextual messages to the user.
- Uses Framer Motion for animations.
- Props: `message: string`, `showMessage: boolean`.

### `empty-state.tsx`

**Purpose:** Placeholder UI shown when a page has no data.

- Customizable icon, title, and description.
- Encourages users to start tracking.

### `nature-background.tsx`

**Purpose:** Animated nature-themed background overlay.

- Adds atmospheric visual depth to pages.
- Renders behind page content with reduced opacity.

### `progress-ring.tsx`

**Purpose:** Circular SVG progress visualization.

- Configurable size, stroke width, and value.
- Animates on value change.
- Used in dashboard cards and stat displays.

### `stat-card.tsx`

**Purpose:** Compact card for displaying a single metric.

- Icon, label, value, and optional trend indicator.
- Consistent styling across dashboard views.

### `theme-provider.tsx`

**Purpose:** Theme context provider using `next-themes`.

- Wraps the app to enable dark/light mode switching.
- Persists preference in localStorage.

### `theme-toggle.tsx`

**Purpose:** Button to toggle between dark and light themes.

- Sun/Moon icon based on current theme.
- Placed in the app header.

---

## shadcn/ui Components

43 primitive UI components installed via the shadcn/ui CLI. All located in `src/components/ui/`.

### Form Components

| Component       | Radix Primitive              | Description                  |
| --------------- | ---------------------------- | ---------------------------- |
| `button.tsx`    | `@radix-ui/react-slot`       | Button with variants         |
| `input.tsx`     | Native                       | Styled text input            |
| `textarea.tsx`  | Native                       | Styled textarea              |
| `select.tsx`    | `@radix-ui/react-select`     | Dropdown select              |
| `checkbox.tsx`  | `@radix-ui/react-checkbox`   | Checkbox control             |
| `radio-group.tsx`| `@radix-ui/react-radio-group`| Radio button group          |
| `switch.tsx`    | `@radix-ui/react-switch`     | Toggle switch                |
| `slider.tsx`    | `@radix-ui/react-slider`     | Range slider                 |
| `toggle.tsx`    | `@radix-ui/react-toggle`     | Toggle button                |
| `toggle-group.tsx`| `@radix-ui/react-toggle-group`| Grouped toggle buttons    |
| `form.tsx`      | React Hook Form              | Form wrapper with validation |
| `label.tsx`     | `@radix-ui/react-label`      | Form label                   |
| `input-otp.tsx` | `input-otp`                  | OTP input field              |
| `calendar.tsx`  | `react-day-picker`           | Date picker calendar         |

### Dialog & Overlay Components

| Component         | Radix Primitive                 | Description              |
| ----------------- | ------------------------------- | ------------------------ |
| `dialog.tsx`      | `@radix-ui/react-dialog`       | Modal dialog             |
| `alert-dialog.tsx`| `@radix-ui/react-alert-dialog` | Confirmation dialog      |
| `drawer.tsx`      | `vaul`                          | Bottom sheet drawer      |
| `sheet.tsx`       | `@radix-ui/react-dialog`       | Slide-over panel         |
| `popover.tsx`     | `@radix-ui/react-popover`      | Popover tooltip          |
| `hover-card.tsx`  | `@radix-ui/react-hover-card`   | Hover info card          |
| `tooltip.tsx`     | `@radix-ui/react-tooltip`      | Simple tooltip           |

### Navigation Components

| Component             | Radix Primitive                      | Description           |
| --------------------- | ------------------------------------ | --------------------- |
| `sidebar.tsx`         | Custom                               | App navigation sidebar|
| `tabs.tsx`            | `@radix-ui/react-tabs`              | Tabbed navigation     |
| `navigation-menu.tsx` | `@radix-ui/react-navigation-menu`   | Nav menu              |
| `menubar.tsx`         | `@radix-ui/react-menubar`           | Menu bar              |
| `pagination.tsx`      | Custom                               | Page pagination       |

### Data Display Components

| Component         | Radix Primitive                 | Description              |
| ----------------- | ------------------------------- | ------------------------ |
| `card.tsx`        | Custom                          | Content card container   |
| `table.tsx`       | Custom                          | Data table               |
| `accordion.tsx`   | `@radix-ui/react-accordion`    | Collapsible sections     |
| `carousel.tsx`    | `embla-carousel-react`          | Image/content carousel   |
| `progress.tsx`    | `@radix-ui/react-progress`     | Progress bar             |
| `badge.tsx`       | Custom                          | Status badge             |
| `avatar.tsx`      | `@radix-ui/react-avatar`       | User avatar              |
| `chart.tsx`       | `recharts`                      | Chart wrapper            |

### Feedback Components

| Component      | Radix Primitive              | Description              |
| -------------- | ---------------------------- | ------------------------ |
| `toast.tsx`    | `@radix-ui/react-toast`     | Toast notification       |
| `toaster.tsx`  | Custom                       | Toast container          |
| `alert.tsx`    | Custom                       | Alert banner             |
| `skeleton.tsx` | Custom                       | Loading skeleton         |

### Layout Components

| Component         | Radix Primitive                   | Description              |
| ----------------- | --------------------------------- | ------------------------ |
| `separator.tsx`   | `@radix-ui/react-separator`      | Visual divider           |
| `scroll-area.tsx` | `@radix-ui/react-scroll-area`    | Custom scrollbar         |
| `resizable.tsx`   | `react-resizable-panels`          | Resizable panel layout   |
| `aspect-ratio.tsx`| `@radix-ui/react-aspect-ratio`   | Aspect ratio container   |
| `collapsible.tsx` | `@radix-ui/react-collapsible`    | Collapsible content      |

### Dropdown & Command Components

| Component           | Radix Primitive                    | Description            |
| ------------------- | ---------------------------------- | ---------------------- |
| `dropdown-menu.tsx` | `@radix-ui/react-dropdown-menu`   | Dropdown menu          |
| `context-menu.tsx`  | `@radix-ui/react-context-menu`    | Right-click menu       |
| `command.tsx`       | `cmdk`                             | Command palette        |

---

## Examples Directory

The `src/examples/` directory contains **15 reference implementations** that serve as design templates and coding patterns. These are not used in the production routing but serve as documentation-by-code.

| File                  | Demonstrates                              |
| --------------------- | ----------------------------------------- |
| `AnalyticsPage.tsx`   | Charts, data fetching, score display      |
| `CatMascot.tsx`       | Animation, positioning, message display   |
| `FeedbackPage.tsx`    | Form submission, validation               |
| `GamesPage.tsx`       | Interactive game UI patterns              |
| `Home.tsx`            | Dashboard layout, stat cards              |
| `Login.tsx`           | Auth form, Supabase integration           |
| `MeditationPage.tsx`  | Timer, audio, session management          |
| `NatureBackground.tsx`| CSS animation, overlay rendering          |
| `PomodoroPage.tsx`    | Countdown timer, break management         |
| `ProgressRing.tsx`    | SVG circle, animated stroke               |
| `StatCard.tsx`        | Card layout, icon integration             |
| `ThemeToggle.tsx`     | Theme switching, icon animation           |
| `TodoPage.tsx`        | CRUD operations, priority sorting         |
| `WaterPage.tsx`       | Counter UI, goal tracking                 |
| `WellnessTest.tsx`    | Multi-step form, score calculation        |

---

*See also: [Project Structure](./PROJECT_STRUCTURE.md) · [Utilities & Hooks](./UTILITIES_AND_HOOKS.md) · [Architecture](./ARCHITECTURE.md)*
