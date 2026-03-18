# LifeSync 2.0 — Database Schema

> Complete database table definitions, relationships, validation rules, and type exports.

## Table of Contents

- [Overview](#overview)
- [Entity-Relationship Diagram](#entity-relationship-diagram)
- [Table Definitions](#table-definitions)
  - [users](#users)
  - [social\_interactions](#social_interactions)
  - [meditation\_sessions](#meditation_sessions)
  - [mindfulness\_sessions](#mindfulness_sessions)
  - [mood\_entries](#mood_entries)
  - [journal\_entries](#journal_entries)
  - [gratitude\_entries](#gratitude_entries)
  - [habits](#habits)
  - [goals](#goals)
  - [todos](#todos)
  - [activity\_logs](#activity_logs)
  - [sleep\_logs](#sleep_logs)
  - [water\_logs](#water_logs)
  - [study\_logs](#study_logs)
- [Zod Validation Schemas](#zod-validation-schemas)
- [TypeScript Types](#typescript-types)
- [Lookup Maps](#lookup-maps)
- [Bootstrap Strategy](#bootstrap-strategy)

---

## Overview

The database layer is defined in `shared/schema.ts` using **Drizzle ORM** with PostgreSQL dialect. Every table has:

1. A **Drizzle table definition** — defines columns, types, and defaults.
2. A **Zod insert schema** — validates incoming API payloads at runtime.
3. **TypeScript types** — `Insert*` (for writes) and `Select*` (for reads), inferred from schema.

The backend connects to **Neon PostgreSQL** via `@neondatabase/serverless`. When `DATABASE_URL` is not set, the server falls back to `MemStorage` (in-memory).

---

## Entity-Relationship Diagram

```
                        ┌──────────────┐
                        │    users     │
                        │──────────────│
                        │ id (PK, UUID)│
                        │ username     │
                        │ password     │
                        └──────┬───────┘
                               │ userId (FK, logical)
       ┌───────────────────────┼───────────────────────┐
       │           │           │           │            │
  ┌────▼────┐ ┌────▼────┐ ┌───▼────┐ ┌────▼────┐ ┌────▼────┐
  │meditation│ │  mood   │ │journal │ │ habits  │ │activity │
  │_sessions│ │_entries │ │_entries│ │         │ │ _logs   │
  └─────────┘ └─────────┘ └────────┘ └─────────┘ └─────────┘
  ┌─────────┐ ┌─────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐
  │mindful- │ │gratitude│ │ goals  │ │  todos  │ │sleep_   │
  │ness_    │ │_entries │ │        │ │         │ │  logs   │
  │sessions │ └─────────┘ └────────┘ └─────────┘ └─────────┘
  └─────────┘ ┌─────────┐ ┌────────┐
              │water_   │ │study_  │
              │  logs   │ │  logs  │
              └─────────┘ └────────┘
              ┌─────────────────────┐
              │social_interactions  │
              └─────────────────────┘
```

> **Note:** Foreign key relationships are logical (enforced by application code), not database-level constraints. All wellness tables use `user_id` as a filter column.

---

## Table Definitions

### `users`

**File:** `shared/schema.ts` · **Lines:** 7–11

| Column     | Type    | Constraints                          |
| ---------- | ------- | ------------------------------------ |
| `id`       | varchar | PRIMARY KEY, default `gen_random_uuid()` |
| `username` | text    | NOT NULL, UNIQUE                     |
| `password` | text    | NOT NULL                             |

---

### `social_interactions`

**File:** `shared/schema.ts` · **Lines:** 35–42

| Column      | Type      | Constraints               |
| ----------- | --------- | ------------------------- |
| `id`        | varchar   | PRIMARY KEY               |
| `user_id`   | varchar   | NOT NULL                  |
| `category`  | text      | NOT NULL                  |
| `rating`    | text      | NOT NULL                  |
| `note`      | text      | Nullable                  |
| `created_at`| timestamp | NOT NULL, DEFAULT now()   |

**Categories:** Friends, Family, Strangers, Animals  
**Ratings:** Very Positive, Positive, Neutral, Negative, Very Negative

---

### `meditation_sessions`

**File:** `shared/schema.ts` · **Lines:** 51–59

| Column      | Type      | Constraints               |
| ----------- | --------- | ------------------------- |
| `id`        | varchar   | PRIMARY KEY               |
| `user_id`   | varchar   | NOT NULL                  |
| `duration`  | integer   | NOT NULL (seconds)        |
| `sound_id`  | text      | NOT NULL                  |
| `completed` | boolean   | NOT NULL, DEFAULT true    |
| `started_at`| timestamp | NOT NULL, DEFAULT now()   |
| `created_at`| timestamp | NOT NULL, DEFAULT now()   |

---

### `mindfulness_sessions`

**File:** `shared/schema.ts` · **Lines:** 61–70

| Column        | Type      | Constraints               |
| ------------- | --------- | ------------------------- |
| `id`          | varchar   | PRIMARY KEY               |
| `user_id`     | varchar   | NOT NULL                  |
| `duration`    | integer   | NOT NULL (seconds)        |
| `sound_id`    | text      | NOT NULL                  |
| `phase_cycles`| integer   | NOT NULL, DEFAULT 0       |
| `completed`   | boolean   | NOT NULL, DEFAULT true    |
| `started_at`  | timestamp | NOT NULL, DEFAULT now()   |
| `created_at`  | timestamp | NOT NULL, DEFAULT now()   |

---

### `mood_entries`

**File:** `shared/schema.ts` · **Lines:** 72–79

| Column      | Type      | Constraints               |
| ----------- | --------- | ------------------------- |
| `id`        | varchar   | PRIMARY KEY               |
| `user_id`   | varchar   | NOT NULL                  |
| `mood_label`| text      | NOT NULL                  |
| `mood_score`| real      | NOT NULL (1.0–5.0)        |
| `notes`     | text      | Nullable                  |
| `created_at`| timestamp | NOT NULL, DEFAULT now()   |

---

### `journal_entries`

**File:** `shared/schema.ts` · **Lines:** 81–89

| Column      | Type      | Constraints               |
| ----------- | --------- | ------------------------- |
| `id`        | varchar   | PRIMARY KEY               |
| `user_id`   | varchar   | NOT NULL                  |
| `title`     | text      | NOT NULL                  |
| `body`      | text      | NOT NULL                  |
| `mood_emoji`| text      | Nullable                  |
| `word_count`| integer   | NOT NULL, DEFAULT 0       |
| `created_at`| timestamp | NOT NULL, DEFAULT now()   |

---

### `gratitude_entries`

**File:** `shared/schema.ts` · **Lines:** 91–98

| Column      | Type      | Constraints               |
| ----------- | --------- | ------------------------- |
| `id`        | varchar   | PRIMARY KEY               |
| `user_id`   | varchar   | NOT NULL                  |
| `text`      | text      | NOT NULL                  |
| `emoji`     | text      | NOT NULL                  |
| `category`  | text      | NOT NULL                  |
| `created_at`| timestamp | NOT NULL, DEFAULT now()   |

---

### `habits`

**File:** `shared/schema.ts` · **Lines:** 100–109

| Column          | Type      | Constraints               |
| --------------- | --------- | ------------------------- |
| `id`            | varchar   | PRIMARY KEY               |
| `user_id`       | varchar   | NOT NULL                  |
| `habit_name`    | text      | NOT NULL                  |
| `emoji`         | text      | NOT NULL, DEFAULT '⭐'    |
| `streak`        | integer   | NOT NULL, DEFAULT 0       |
| `completed_today`| boolean  | NOT NULL, DEFAULT false   |
| `success_rate`  | real      | NOT NULL, DEFAULT 0       |
| `created_at`    | timestamp | NOT NULL, DEFAULT now()   |

---

### `goals`

**File:** `shared/schema.ts` · **Lines:** 111–120

| Column      | Type      | Constraints               |
| ----------- | --------- | ------------------------- |
| `id`        | varchar   | PRIMARY KEY               |
| `user_id`   | varchar   | NOT NULL                  |
| `title`     | text      | NOT NULL                  |
| `type`      | text      | NOT NULL ("short"/"long") |
| `target_date`| text     | NOT NULL                  |
| `progress`  | integer   | NOT NULL, DEFAULT 0       |
| `completed` | boolean   | NOT NULL, DEFAULT false   |
| `created_at`| timestamp | NOT NULL, DEFAULT now()   |

---

### `todos`

**File:** `shared/schema.ts` · **Lines:** 122–129

| Column      | Type      | Constraints                    |
| ----------- | --------- | ------------------------------ |
| `id`        | varchar   | PRIMARY KEY                    |
| `user_id`   | varchar   | NOT NULL                       |
| `text`      | text      | NOT NULL                       |
| `completed` | boolean   | NOT NULL, DEFAULT false        |
| `priority`  | text      | NOT NULL, DEFAULT 'medium'     |
| `created_at`| timestamp | NOT NULL, DEFAULT now()        |

---

### `activity_logs`

**File:** `shared/schema.ts` · **Lines:** 131–138

| Column      | Type      | Constraints               |
| ----------- | --------- | ------------------------- |
| `id`        | varchar   | PRIMARY KEY               |
| `user_id`   | varchar   | NOT NULL                  |
| `type`      | text      | NOT NULL                  |
| `duration`  | integer   | NOT NULL (minutes)        |
| `intensity` | text      | NOT NULL                  |
| `created_at`| timestamp | NOT NULL, DEFAULT now()   |

---

### `sleep_logs`

**File:** `shared/schema.ts` · **Lines:** 140–147

| Column      | Type      | Constraints               |
| ----------- | --------- | ------------------------- |
| `id`        | varchar   | PRIMARY KEY               |
| `user_id`   | varchar   | NOT NULL                  |
| `bedtime`   | text      | NOT NULL                  |
| `wake_time` | text      | NOT NULL                  |
| `duration_h`| real      | NOT NULL (hours)          |
| `created_at`| timestamp | NOT NULL, DEFAULT now()   |

---

### `water_logs`

**File:** `shared/schema.ts` · **Lines:** 149–155

| Column      | Type      | Constraints               |
| ----------- | --------- | ------------------------- |
| `id`        | varchar   | PRIMARY KEY               |
| `user_id`   | varchar   | NOT NULL                  |
| `glasses`   | integer   | NOT NULL                  |
| `goal`      | integer   | NOT NULL, DEFAULT 8       |
| `created_at`| timestamp | NOT NULL, DEFAULT now()   |

---

### `study_logs`

**File:** `shared/schema.ts` · **Lines:** 157–166

| Column           | Type      | Constraints               |
| ---------------- | --------- | ------------------------- |
| `id`             | varchar   | PRIMARY KEY               |
| `user_id`        | varchar   | NOT NULL                  |
| `subject`        | text      | NOT NULL                  |
| `duration_minutes`| integer  | NOT NULL                  |
| `focus_rating`   | integer   | NOT NULL, DEFAULT 3 (1–5) |
| `notes`          | text      | Nullable                  |
| `study_date`     | text      | NOT NULL                  |
| `created_at`     | timestamp | NOT NULL, DEFAULT now()   |

---

## Zod Validation Schemas

All insert schemas extend a base schema requiring `userId`:

```typescript
const baseUserSchema = z.object({
  userId: z.string().min(1),
});
```

| Schema Name                       | Table                  | Key Validations                          |
| --------------------------------- | ---------------------- | ---------------------------------------- |
| `insertUserSchema`                | `users`                | username + password (pick from Drizzle)  |
| `insertSocialInteractionSchema`   | `social_interactions`  | category enum, rating enum, note ≤ 500   |
| `insertMeditationSessionSchema`   | `meditation_sessions`  | duration ≥ 1, soundId required           |
| `insertMindfulnessSessionSchema`  | `mindfulness_sessions` | duration ≥ 1, phaseCycles ≥ 0            |
| `insertMoodEntrySchema`           | `mood_entries`         | moodScore 1–5, notes ≤ 500              |
| `insertJournalEntrySchema`        | `journal_entries`      | title + body required, trimmed           |
| `insertGratitudeEntrySchema`      | `gratitude_entries`    | text + emoji + category required         |
| `insertHabitSchema`               | `habits`               | habitName required, successRate 0–100    |
| `insertGoalSchema`                | `goals`                | type enum (short/long), progress 0–100   |
| `insertTodoSchema`                | `todos`                | text required, priority enum             |
| `insertActivityLogSchema`         | `activity_logs`        | type + duration ≥ 1 + intensity required |
| `insertSleepLogSchema`            | `sleep_logs`           | bedtime + wakeTime + durationH ≥ 0       |
| `insertWaterLogSchema`            | `water_logs`           | glasses ≥ 0, goal ≥ 1                   |
| `insertStudyLogSchema`            | `study_logs`           | duration 1–720, focusRating 1–5          |

---

## TypeScript Types

Each table exports two types:

```typescript
// Insert type (for creating records)
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;

// Select type (for reading records)
export type MoodEntry = typeof moodEntries.$inferSelect;
```

**Full type list:**

| Insert Type               | Select Type            |
| ------------------------- | ---------------------- |
| `InsertUser`              | `User`                 |
| `InsertSocialInteraction` | `SocialInteraction`    |
| `InsertMeditationSession` | `MeditationSession`    |
| `InsertMindfulnessSession`| `MindfulnessSession`   |
| `InsertMoodEntry`         | `MoodEntry`            |
| `InsertJournalEntry`      | `JournalEntry`         |
| `InsertGratitudeEntry`    | `GratitudeEntry`       |
| `InsertHabit`             | `Habit`                |
| `InsertGoal`              | `Goal`                 |
| `InsertTodo`              | `Todo`                 |
| `InsertActivityLog`       | `ActivityLog`          |
| `InsertSleepLog`          | `SleepLog`             |
| `InsertWaterLog`          | `WaterLog`             |
| `InsertStudyLog`          | `StudyLog`             |

---

## Lookup Maps

Two lookup objects enable **dynamic table routing** in `server/routes.ts`:

### `wellnessTables`

Maps table name strings to Drizzle table references:

```typescript
export const wellnessTables = {
  meditation_sessions: meditationSessions,
  mindfulness_sessions: mindfulnessSessions,
  mood_entries: moodEntries,
  // ... 12 tables total
} as const;
```

### `wellnessInsertSchemas`

Maps table name strings to Zod validation schemas:

```typescript
export const wellnessInsertSchemas = {
  meditation_sessions: insertMeditationSessionSchema,
  mindfulness_sessions: insertMindfulnessSessionSchema,
  mood_entries: insertMoodEntrySchema,
  // ... 12 schemas total
} as const;
```

### `wellnessTableNames`

Const tuple of all valid table name strings for runtime type checking:

```typescript
export const wellnessTableNames = [
  "meditation_sessions", "mindfulness_sessions", "mood_entries",
  "journal_entries", "gratitude_entries", "habits", "goals",
  "todos", "activity_logs", "sleep_logs", "water_logs", "study_logs",
] as const;

export type WellnessTableName = typeof wellnessTableNames[number];
```

---

## Bootstrap Strategy

Tables are created at server startup via `bootstrapWellnessTables()` in `server/routes.ts`. This function runs `CREATE TABLE IF NOT EXISTS` for all 13 tables, ensuring the schema exists without requiring a separate migration step.

**Migration tooling:** Drizzle Kit (`drizzle-kit push`) is available via the `db:push` npm script for schema synchronization during development.

---

*See also: [API Documentation](./API_DOCUMENTATION.md) · [Architecture](./ARCHITECTURE.md) · [Utilities & Hooks](./UTILITIES_AND_HOOKS.md)*
