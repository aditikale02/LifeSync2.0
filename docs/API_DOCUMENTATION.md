# LifeSync 2.0 — API Documentation

> Complete REST API reference for the LifeSync backend (`server/routes.ts`).

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Authentication](#authentication)
- [Social Interactions](#social-interactions)
- [Wellness Records](#wellness-records)
- [Analytics & Insights](#analytics--insights)
- [Error Codes](#error-codes)

---

## Overview

The LifeSync API provides **10 REST endpoints** organized into four groups:

| Group               | Endpoints | Description                            |
| ------------------- | --------- | -------------------------------------- |
| Authentication      | 1         | User registration via Supabase Admin   |
| Social Interactions | 2         | CRUD for social interaction records    |
| Wellness Records    | 4         | Generic CRUD across 12 wellness tables |
| Analytics           | 2         | Summary computation & AI insights      |

All endpoints accept and return **JSON**. Validation is performed server-side using Zod schemas defined in `shared/schema.ts`.

---

## Base URL

| Environment  | URL                                |
| ------------ | ---------------------------------- |
| Development  | `http://localhost:5000/api`        |
| Production   | `https://<your-domain>/api`        |

---

## Response Format

### Success

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid",
  "...": "..."
}
```

### Error

```json
{
  "message": "Human-readable error description."
}
```

---

## Authentication

### `POST /api/auth/register`

Register a new user account via Supabase Admin API.

**Request Body:**

| Field      | Type   | Required | Constraints           |
| ---------- | ------ | -------- | --------------------- |
| `email`    | string | ✅       | Valid email address    |
| `password` | string | ✅       | Minimum 6 characters  |
| `fullName` | string | ❌       | User's display name    |

**Example Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "Jane Doe"
}
```

**Responses:**

| Status | Description                                 |
| ------ | ------------------------------------------- |
| 201    | User registered successfully                |
| 400    | Missing email/password or password too short|
| 409    | Email already exists                        |
| 500    | Server configuration error or Supabase error|

**Example Response (201):**

```json
{
  "message": "User registered successfully."
}
```

> **Note:** Login is handled client-side via `supabase.auth.signInWithPassword()`, not through the server API.

---

## Social Interactions

### `GET /api/social-interactions/:userId`

Fetch all social interactions for a user, sorted by most recent first.

**URL Parameters:**

| Param    | Type   | Description       |
| -------- | ------ | ----------------- |
| `userId` | string | Supabase user ID  |

**Responses:**

| Status | Description                          |
| ------ | ------------------------------------ |
| 200    | Array of social interaction objects  |
| 400    | Missing userId                       |
| 500    | Server error                         |

**Example Response (200):**

```json
[
  {
    "id": "uuid-1",
    "userId": "user-uuid",
    "category": "Friends",
    "rating": "Positive",
    "note": "Had coffee with a friend",
    "createdAt": "2026-03-15T10:30:00.000Z"
  }
]
```

---

### `POST /api/social-interactions`

Create a new social interaction record.

**Request Body:**

| Field      | Type   | Required | Constraints                                         |
| ---------- | ------ | -------- | --------------------------------------------------- |
| `userId`   | string | ✅       | Non-empty                                            |
| `category` | string | ✅       | One of: `Friends`, `Family`, `Strangers`, `Animals`  |
| `rating`   | string | ✅       | One of: `Very Positive`, `Positive`, `Neutral`, `Negative`, `Very Negative` |
| `note`     | string | ❌       | Max 500 characters, trimmed                          |

**Example Request:**

```json
{
  "userId": "user-uuid",
  "category": "Family",
  "rating": "Very Positive",
  "note": "Family dinner together"
}
```

**Responses:**

| Status | Description                     |
| ------ | ------------------------------- |
| 201    | Created interaction object      |
| 400    | Validation error                |
| 500    | Server error                    |

---

## Wellness Records

The wellness API uses **dynamic table routing** — a single set of endpoints handles all 12 wellness tables.

### Supported Tables

| Table Name              | Description                |
| ----------------------- | -------------------------- |
| `meditation_sessions`   | Guided meditation logs     |
| `mindfulness_sessions`  | Mindfulness exercise logs  |
| `mood_entries`          | Daily mood scores          |
| `journal_entries`       | Journal writing entries    |
| `gratitude_entries`     | Gratitude journal entries  |
| `habits`               | Habit tracking records     |
| `goals`                | Goal progress tracking     |
| `todos`                | To-do list items           |
| `activity_logs`        | Physical activity records  |
| `sleep_logs`           | Sleep tracking data        |
| `water_logs`           | Hydration tracking         |
| `study_logs`           | Study session records      |

---

### `GET /api/wellness/:table/:userId`

Fetch all records from a wellness table for a user, sorted by most recent first.

**URL Parameters:**

| Param    | Type   | Description                        |
| -------- | ------ | ---------------------------------- |
| `table`  | string | One of the 12 supported table names|
| `userId` | string | Supabase user ID                   |

**Responses:**

| Status | Description                  |
| ------ | ---------------------------- |
| 200    | Array of record objects      |
| 400    | Missing userId               |
| 404    | Unknown table name           |
| 500    | Server error                 |

**Example:** `GET /api/wellness/mood_entries/user-uuid`

```json
[
  {
    "id": "uuid-1",
    "userId": "user-uuid",
    "moodLabel": "Happy",
    "moodScore": 4.5,
    "notes": "Great day!",
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
]
```

---

### `POST /api/wellness/:table`

Create a new record in a wellness table. The request body is validated against the table-specific Zod schema.

**URL Parameters:**

| Param   | Type   | Description                         |
| ------- | ------ | ----------------------------------- |
| `table` | string | One of the 12 supported table names |

**Request Body Schemas (per table):**

#### `meditation_sessions`

| Field       | Type    | Required | Constraints          |
| ----------- | ------- | -------- | -------------------- |
| `userId`    | string  | ✅       | Non-empty            |
| `duration`  | integer | ✅       | Minimum 1 (seconds)  |
| `soundId`   | string  | ✅       | Non-empty            |
| `completed` | boolean | ❌       | Defaults to true     |
| `startedAt` | string  | ❌       | ISO 8601 datetime    |

#### `mindfulness_sessions`

| Field        | Type    | Required | Constraints          |
| ------------ | ------- | -------- | -------------------- |
| `userId`     | string  | ✅       | Non-empty            |
| `duration`   | integer | ✅       | Minimum 1 (seconds)  |
| `soundId`    | string  | ✅       | Non-empty            |
| `phaseCycles`| integer | ❌       | Minimum 0            |
| `completed`  | boolean | ❌       | Defaults to true     |
| `startedAt`  | string  | ❌       | ISO 8601 datetime    |

#### `mood_entries`

| Field       | Type   | Required | Constraints               |
| ----------- | ------ | -------- | ------------------------- |
| `userId`    | string | ✅       | Non-empty                 |
| `moodLabel` | string | ✅       | Non-empty                 |
| `moodScore` | number | ✅       | 1.0 – 5.0                |
| `notes`     | string | ❌       | Max 500 chars, trimmed    |

#### `journal_entries`

| Field       | Type    | Required | Constraints           |
| ----------- | ------- | -------- | --------------------- |
| `userId`    | string  | ✅       | Non-empty             |
| `title`     | string  | ✅       | Non-empty, trimmed    |
| `body`      | string  | ✅       | Non-empty, trimmed    |
| `moodEmoji` | string  | ❌       | Trimmed               |
| `wordCount` | integer | ❌       | Minimum 0             |

#### `gratitude_entries`

| Field      | Type   | Required | Constraints           |
| ---------- | ------ | -------- | --------------------- |
| `userId`   | string | ✅       | Non-empty             |
| `text`     | string | ✅       | Non-empty, trimmed    |
| `emoji`    | string | ✅       | Non-empty, trimmed    |
| `category` | string | ✅       | Non-empty, trimmed    |

#### `habits`

| Field          | Type    | Required | Constraints           |
| -------------- | ------- | -------- | --------------------- |
| `userId`       | string  | ✅       | Non-empty             |
| `habitName`    | string  | ✅       | Non-empty, trimmed    |
| `emoji`        | string  | ❌       | Trimmed               |
| `streak`       | integer | ❌       | Minimum 0             |
| `completedToday` | boolean | ❌    | Defaults to false     |
| `successRate`  | number  | ❌       | 0 – 100               |

#### `goals`

| Field        | Type    | Required | Constraints                |
| ------------ | ------- | -------- | -------------------------- |
| `userId`     | string  | ✅       | Non-empty                  |
| `title`      | string  | ✅       | Non-empty, trimmed         |
| `type`       | string  | ✅       | `"short"` or `"long"`      |
| `targetDate` | string  | ✅       | Non-empty (date string)    |
| `progress`   | integer | ❌       | 0 – 100                    |
| `completed`  | boolean | ❌       | Defaults to false          |

#### `todos`

| Field      | Type    | Required | Constraints                          |
| ---------- | ------- | -------- | ------------------------------------ |
| `userId`   | string  | ✅       | Non-empty                            |
| `text`     | string  | ✅       | Non-empty, trimmed                   |
| `completed`| boolean | ❌       | Defaults to false                    |
| `priority` | string  | ❌       | `"low"`, `"medium"`, or `"high"`     |

#### `activity_logs`

| Field       | Type    | Required | Constraints           |
| ----------- | ------- | -------- | --------------------- |
| `userId`    | string  | ✅       | Non-empty             |
| `type`      | string  | ✅       | Non-empty, trimmed    |
| `duration`  | integer | ✅       | Minimum 1 (minutes)   |
| `intensity` | string  | ✅       | Non-empty, trimmed    |

#### `sleep_logs`

| Field       | Type   | Required | Constraints           |
| ----------- | ------ | -------- | --------------------- |
| `userId`    | string | ✅       | Non-empty             |
| `bedtime`   | string | ✅       | Non-empty (time)      |
| `wakeTime`  | string | ✅       | Non-empty (time)      |
| `durationH` | number | ✅       | Minimum 0 (hours)     |

#### `water_logs`

| Field    | Type    | Required | Constraints             |
| -------- | ------- | -------- | ----------------------- |
| `userId` | string  | ✅       | Non-empty               |
| `glasses`| integer | ✅       | Minimum 0               |
| `goal`   | integer | ❌       | Minimum 1, defaults to 8|

#### `study_logs`

| Field            | Type    | Required | Constraints              |
| ---------------- | ------- | -------- | ------------------------ |
| `userId`         | string  | ✅       | Non-empty                |
| `subject`        | string  | ✅       | Non-empty, trimmed       |
| `durationMinutes`| integer | ✅       | 1 – 720                  |
| `focusRating`    | integer | ✅       | 1 – 5                    |
| `notes`          | string  | ❌       | Max 500 chars, trimmed   |
| `studyDate`      | string  | ✅       | Non-empty (date string)  |

**Responses:**

| Status | Description                  |
| ------ | ---------------------------- |
| 201    | Created record object        |
| 400    | Validation error             |
| 404    | Unknown table name           |
| 500    | Server error                 |

---

### `DELETE /api/wellness/:table/record/:recordId`

Delete a single record by its ID.

**URL Parameters:**

| Param      | Type   | Description                         |
| ---------- | ------ | ----------------------------------- |
| `table`    | string | One of the 12 supported table names |
| `recordId` | string | UUID of the record to delete        |

**Responses:**

| Status | Description                           |
| ------ | ------------------------------------- |
| 200    | `{ "deletedCount": 1 }` or `{ "deletedCount": 0 }` |
| 400    | Missing recordId                      |
| 404    | Unknown table name                    |
| 500    | Server error                          |

---

### `DELETE /api/wellness/:table`

Bulk-delete records matching a field value for a user.

**URL Parameters:**

| Param   | Type   | Description                         |
| ------- | ------ | ----------------------------------- |
| `table` | string | One of the 12 supported table names |

**Query Parameters:**

| Param    | Type   | Required | Description                            |
| -------- | ------ | -------- | -------------------------------------- |
| `userId` | string | ✅       | Supabase user ID                       |
| `field`  | string | ✅       | Column name (must be in allowed list)  |
| `value`  | string | ✅       | Value to match for deletion            |

**Allowed Fields per Table:**

| Table                  | Deletable Fields                    |
| ---------------------- | ----------------------------------- |
| `meditation_sessions`  | `id`, `userId`, `soundId`           |
| `mindfulness_sessions` | `id`, `userId`, `soundId`           |
| `mood_entries`         | `id`, `userId`, `moodLabel`         |
| `journal_entries`      | `id`, `userId`, `title`             |
| `gratitude_entries`    | `id`, `userId`, `text`, `category`  |
| `habits`              | `id`, `userId`, `habitName`         |
| `goals`               | `id`, `userId`, `title`             |
| `todos`               | `id`, `userId`, `text`              |
| `activity_logs`       | `id`, `userId`, `type`              |
| `sleep_logs`          | `id`, `userId`                      |
| `water_logs`          | `id`, `userId`                      |
| `study_logs`          | `id`, `userId`, `subject`           |

**Responses:**

| Status | Description                              |
| ------ | ---------------------------------------- |
| 200    | `{ "deletedCount": <number> }`           |
| 400    | Missing params or field not deletable    |
| 404    | Unknown table name                       |
| 500    | Server error                             |

---

## Analytics & Insights

### `GET /api/wellness-summary/:userId`

Generate a comprehensive wellness summary with scores and trends.

**URL Parameters:**

| Param    | Type   | Description       |
| -------- | ------ | ----------------- |
| `userId` | string | Supabase user ID  |

**Query Parameters:**

| Param  | Type   | Default | Description                  |
| ------ | ------ | ------- | ---------------------------- |
| `days` | number | 7       | Number of days to analyze    |

**Response Structure:**

```json
{
  "periodDays": 7,
  "metrics": {
    "meditationMinutes": 120,
    "mindfulnessMinutes": 45,
    "avgMeditationSession": 15,
    "avgSleep": 7.2,
    "sleepConsistency": 0.8,
    "moodAvg": 3.8,
    "moodHigh": 5,
    "moodLow": 2,
    "gratitudeEntries": 5,
    "journalEntries": 3,
    "socialInteractions": 8,
    "socialPositiveRatio": 75,
    "habitCompletionPct": 80,
    "goalProgressPct": 60,
    "taskCompletionPct": 70,
    "activityMinutes": 180,
    "caloriesEstimated": 1200,
    "hydrationPct": 85
  },
  "scores": {
    "mindScore": 72,
    "emotionalScore": 68,
    "socialScore": 75,
    "productivityScore": 70,
    "physicalScore": 65,
    "lifeSyncScore": 70
  },
  "trends": {
    "lifeSync7d": [{ "day": "03-10", "count": 2, "value": 68 }],
    "socialFrequency7d": [{ "day": "03-10", "count": 1 }],
    "socialWellness7d": [{ "day": "03-10", "count": 1, "value": 80 }]
  },
  "crossPillar": {
    "sleepVsMood": { "correlationHint": "stable", "avgSleep": 7.2, "avgMood": 3.8 },
    "meditationVsProductivity": { "meditationDays": 5, "taskCompletionPct": 70, "signal": "positive" },
    "activityVsEmotional": { "activityMinutes": 180, "emotionalScore": 68, "signal": "positive" },
    "gratitudeVsMood": { "gratitudeEntries": 5, "avgMood": 3.8, "signal": "positive" },
    "socialVsMood": { "socialPositiveRatio": 75, "avgMood": 3.8, "signal": "positive" }
  }
}
```

---

### `GET /api/ai-insights/:userId`

Generate AI-powered wellness insights based on the last 7 days of data.

**URL Parameters:**

| Param    | Type   | Description       |
| -------- | ------ | ----------------- |
| `userId` | string | Supabase user ID  |

**Response Structure:**

```json
{
  "summary": "Your LifeSync score is 70/100 this week. Mind: 72, Emotional: 68, Social: 75, Productivity: 70, Physical: 65. Focus first on the weakest pillar to create balanced improvement.",
  "wellness_score": 70,
  "strengths": [
    "Emotional wellness is strong this week.",
    "Most social interactions were positive."
  ],
  "improvements": [
    "Average sleep is below target.",
    "Social interaction frequency is low."
  ],
  "recommendations": [
    "Prioritize 7+ hours of sleep for the next 3 nights.",
    "Schedule a short morning meditation before focus blocks."
  ],
  "generated_at": "2026-03-15T10:00:00.000Z"
}
```

---

## Error Codes

| HTTP Status | Meaning                                    |
| ----------- | ------------------------------------------ |
| 200         | Success                                    |
| 201         | Resource created successfully              |
| 400         | Bad request (validation error, missing params)|
| 404         | Resource not found (unknown table name)    |
| 409         | Conflict (duplicate email on registration) |
| 500         | Internal server error                      |

All error responses include a `message` field with a human-readable description.

---

*See also: [Architecture](./ARCHITECTURE.md) · [Database Schema](./DATABASE_SCHEMA.md) · [Deployment Guide](./DEPLOYMENT_GUIDE.md)*
