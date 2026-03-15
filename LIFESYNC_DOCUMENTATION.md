# LifeSync - Wellness Analytics System

> **LifeSync is a wellness analytics system tracking Mind, Social, Emotional, Productivity, and Physical Wellness through user activity and AI-generated insights.**

LifeSync provides a unified dashboard experience across 20+ wellness modules. Every graph, score, and AI insight is derived directly from user-logged data, making the system **fully connected, meaningful, and actionable**. The architecture supports real-time metric recalculation, cross-pillar pattern analysis, and an AI feedback loop that adapts weekly recommendations as user behavior evolves.

**Stack:** React 18 + TypeScript + Vite 5 - Wouter - Tailwind CSS + shadcn/ui - Recharts - Framer Motion - Supabase Auth + Edge Functions - Drizzle ORM + Neon Postgres (optional, MemStorage fallback) - Express + Node.js

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Sources / Tables](#data-sources--tables)
3. [Dashboards / Categories](#dashboards--categories)
4. [Metrics and Calculations](#metrics-and-calculations)
5. [Normalization Reference](#normalization-reference)
6. [AI Insights Flow](#ai-insights-flow)
7. [Composite LifeSync Score](#composite-lifesync-score)
8. [Cross-Pillar Analysis](#cross-pillar-analysis)
9. [Feedback Loop](#feedback-loop)
10. [Tech Stack](#tech-stack)

---

## System Architecture

```
+------------------------------------------------------------------------------+
|                            USER INTERACTIONS                                 |
|   Logs mood . Meditates . Sleeps . Exercises . Tracks water . Writes journal |
|   Adds habits . Sets goals . Completes tasks . Logs social interactions      |
+------------------------------------+-----------------------------------------+
                                     | user input events
                                     v
+------------------------------------------------------------------------------+
|                          DATA LAYER (Tables)                                 |
|                                                                              |
|  users . social_interactions (Neon Postgres + Drizzle ORM)                  |
|  meditation_sessions . mindfulness_sessions . mood_entries . journal_entries |
|  gratitude_entries . habits . goals . todos . activity_logs . sleep_logs     |
|  water_logs  (client-side state -> DB migration candidates)                  |
+----------+--------------------------------------------+---------------------+
           | raw records                                | REST API
           v                                            v
+-----------------------------+          +------------------------------+
|   METRIC ENGINE             |          |   EXPRESS SERVER             |
|                             |          |   GET /api/social-inter...   |
|  Per-pillar sub-scores      |          |   POST /api/social-inter...  |
|  (normalized 0-100)         |          |   POST /api/auth/register    |
|                             |          |   (DB or MemStorage)         |
|  Mind . Emotional           |          +------------------------------+
|  Social . Productivity      |
|  Physical                   |
+----------+------------------+
           | sub-scores + raw metrics
           v
+------------------------------------------------------------------------------+
|                     SUPABASE EDGE FUNCTION                                   |
|               generate-ai-insights                                           |
|                                                                              |
|  1. Aggregates 7-day metrics across all pillars                              |
|  2. Computes composite LifeSync Score                                        |
|  3. Sends structured prompt to LLM                                           |
|  4. Returns { summary, wellness_score, strengths, improvements,              |
|               recommendations }                                              |
+----------+-------------------------------------------------------------------+
           | AIInsightRecord
           v
+------------------------------------------------------------------------------+
|                        DASHBOARD LAYER (React Pages)                         |
|                                                                              |
|  Mind          Emotional      Social         Productivity     Physical       |
|  /meditation   /mood          /social        /habits          /activity      |
|  /mindfulness  /journal       (score, chart) /goals           /water         |
|  /sleep        /gratitude                    /todo . /pomodoro /health       |
|                                                                              |
|  Cross-cutting: /home . /analytics . /ai-insights . /wellness-test           |
+------------------------------------------------------------------------------+
           | AI recommendations
           v
+------------------------------------------------------------------------------+
|                          FEEDBACK LOOP                                       |
|  User acts on recommendations -> new data logged -> metrics recalculated    |
|  -> AI re-evaluates next week -> insights evolve with behavior              |
+------------------------------------------------------------------------------+
```

---

## Data Sources / Tables

> Every table is linked to `user_id` and carries a timestamp (`created_at` or `date`) enabling time-series analysis and rolling-window calculations.

### Persisted Tables (Neon Postgres via Drizzle ORM)

#### users

| Field    | Type    | Notes                          |
|----------|---------|--------------------------------|
| id       | varchar | Primary key, UUID auto-generated |
| username | text    | Unique, not null               |
| password | text    | Hashed (bcrypt), not null      |

**Purpose:** Authentication anchor. All other tables reference `users.id` as `user_id`.

#### social_interactions

| Field      | Type      | Notes                                                                   |
|------------|-----------|-------------------------------------------------------------------------|
| id         | varchar   | Primary key, UUID                                                       |
| user_id    | varchar   | FK -> users.id, not null                                                |
| category   | text      | Enum: Friends / Family / Strangers / Animals                            |
| rating     | text      | Enum: Very Positive / Positive / Neutral / Negative / Very Negative     |
| note       | text      | Optional free-text note, max 500 chars                                  |
| created_at | timestamp | Auto-set on insert, used for time-series queries                        |

**Purpose:** Drives the Social Wellness pillar - connection wellness score, positive ratio, category mix, and trend charts.

---

### Client-Side State Tables (DB migration candidates)

#### meditation_sessions

| Field      | Type    | Notes                                                |
|------------|---------|------------------------------------------------------|
| id         | string  | Client-generated UUID                                |
| user_id    | string  | From authenticated session                           |
| duration   | integer | Session length in minutes (5 / 10 / 15 / 20)         |
| sound_id   | string  | ocean / rainforest / wind / birds                    |
| completed  | boolean | True if timer ran to zero; false if stopped early    |
| started_at | date    | Session start timestamp                              |

**Purpose:** Feeds Mind Score - total minutes, session frequency, completion rate, sound preferences.

#### mindfulness_sessions

| Field        | Type    | Notes                                                    |
|--------------|---------|----------------------------------------------------------|
| id           | string  | Client-generated UUID                                    |
| user_id      | string  | From authenticated session                               |
| duration     | integer | Selected session length in minutes (5 / 10 / 15 / 20)   |
| sound_id     | string  | Same sound set as meditation                             |
| phase_cycles | integer | Number of completed inhale/hold/exhale cycles            |
| completed    | boolean | True if full duration elapsed                            |
| started_at   | date    | Session start timestamp                                  |

**Purpose:** Complements meditation in the Mind Score - breathing consistency, phase adherence.

#### mood_entries

| Field      | Type    | Notes                                                                       |
|------------|---------|-----------------------------------------------------------------------------|
| id         | string  | Client-generated UUID                                                       |
| user_id    | string  | From authenticated session                                                  |
| mood_label | string  | Excited / Happy / Calm / Neutral / Tired / Sad / Angry / Sleepy             |
| mood_score | float   | Numeric value 1.0-5.0 mapped from label (see score table below)             |
| notes      | text    | Optional free-text note                                                     |
| created_at | date    | Log timestamp - one entry per day recommended                               |

**Purpose:** Primary input for Mood Score; feeds cross-pillar Sleep vs. Mood and Meditation vs. Mood correlations.

Mood label to score mapping:

| Label   | Score |
|---------|-------|
| Excited | 5.0   |
| Happy   | 4.0   |
| Calm    | 3.5   |
| Neutral | 3.0   |
| Tired   | 2.5   |
| Sad     | 2.0   |
| Sleepy  | 1.5   |
| Angry   | 1.0   |

#### journal_entries

| Field      | Type    | Notes                                                  |
|------------|---------|--------------------------------------------------------|
| id         | string  | Client-generated UUID                                  |
| user_id    | string  | From authenticated session                             |
| title      | string  | Entry title                                            |
| body       | text    | Full journal text                                      |
| mood_emoji | string  | Emoji mood tag from 8-option palette                   |
| word_count | integer | Derived: body.trim().split(/\s+/).length               |
| date       | date    | Entry date (one per day recommended)                   |

**Purpose:** Feeds journaling streak and word count in the Emotional Score; longer entries correlate with deeper emotional processing.

#### gratitude_entries

| Field    | Type   | Notes                                                          |
|----------|--------|----------------------------------------------------------------|
| id       | string | Client-generated UUID                                          |
| user_id  | string | From authenticated session                                     |
| text     | string | Gratitude note                                                 |
| emoji    | string | Decorative emoji from 12-option palette                        |
| category | string | Health / Family / Nature / Work / Friends / Self               |
| date     | date   | Entry date                                                     |

**Purpose:** Daily gratitude count feeds the Emotional Score; category distribution reveals what the user values most.

#### habits

| Field           | Type    | Notes                                          |
|-----------------|---------|------------------------------------------------|
| id              | string  | Client-generated UUID                          |
| user_id         | string  | From authenticated session                     |
| habit_name      | string  | User-defined label                             |
| emoji           | string  | Visual identifier                              |
| streak          | integer | Consecutive days completed_today = true        |
| completed_today | boolean | Reset to false at midnight                     |
| success_rate    | float   | days_completed / days_since_creation x 100     |
| created_at      | date    | Habit creation date                            |

**Purpose:** Habit streaks and success rates are the primary Productivity Score inputs; streaks >= 7 days trigger "on fire" status.

#### goals

| Field       | Type    | Notes                                                |
|-------------|---------|------------------------------------------------------|
| id          | string  | Client-generated UUID                                |
| user_id     | string  | From authenticated session                           |
| title       | string  | Goal description                                     |
| type        | string  | short (days-weeks) / long (months-year)              |
| target_date | date    | Deadline                                             |
| progress    | integer | 0-100 percent; auto-marks completed=true at 100      |
| completed   | boolean | True when progress = 100                             |

**Purpose:** Active goal progress % feeds the Productivity Score; overdue goals flag a warning in AI insights.

#### todos

| Field      | Type    | Notes                               |
|------------|---------|-------------------------------------|
| id         | string  | Client-generated UUID               |
| user_id    | string  | From authenticated session          |
| text       | string  | Task description                    |
| completed  | boolean | Toggle state                        |
| priority   | string  | low / medium / high                 |
| created_at | date    | Task creation timestamp             |

**Purpose:** Daily task completion % feeds the Productivity Score; high-priority incomplete tasks surface in AI recommendations.

#### activity_logs

| Field      | Type    | Notes                                                         |
|------------|---------|---------------------------------------------------------------|
| id         | string  | Client-generated UUID                                         |
| user_id    | string  | From authenticated session                                    |
| type       | string  | Running / Yoga / Walking / Sports / Gym                       |
| duration   | integer | Minutes                                                       |
| intensity  | string  | Low / Moderate / High                                         |
| logged_at  | date    | Timestamp of log                                              |

**Purpose:** Weekly activity minutes and estimated calories are the primary Physical Score inputs; feeds the Activity vs. Mood cross-pillar analysis.

Activity MET estimates used for calorie estimation:

| Type    | MET |
|---------|-----|
| Running | 9.8 |
| Gym     | 6.0 |
| Sports  | 7.0 |
| Walking | 3.5 |
| Yoga    | 3.0 |

#### sleep_logs

| Field      | Type   | Notes                                        |
|------------|--------|----------------------------------------------|
| id         | string | Client-generated UUID                        |
| user_id    | string | From authenticated session                   |
| bedtime    | time   | HH:MM (24-hour)                              |
| wake_time  | time   | HH:MM (24-hour)                              |
| duration_h | float  | Derived: wake_time - bedtime (hours)         |
| date       | date   | Night of sleep                               |

**Purpose:** Core input for Mind Score and the Sleep vs. Mood cross-pillar analysis; sleep deficit flags appear in AI improvements.

#### water_logs

| Field   | Type    | Notes                                  |
|---------|---------|----------------------------------------|
| id      | string  | Client-generated UUID                  |
| user_id | string  | From authenticated session             |
| glasses | integer | Count logged for the day               |
| goal    | integer | Daily target (default: 8 glasses)      |
| date    | date    | Log date                               |

**Purpose:** Hydration % feeds the Physical Score; on days below 50% goal, AI surfaces a hydration recommendation.

---

## Dashboards / Categories

Each dashboard visualizes **real metrics derived from the tables above**. The chart types, KPI cards, and trend lines are all driven by user data.

### 1 - Mind Wellness

| Dashboard   | Route          | Primary Data Source       | Visualizations                                                |
|-------------|----------------|---------------------------|---------------------------------------------------------------|
| Meditation  | /meditation    | meditation_sessions       | Duration selector, countdown timer, sound selector, completion toast |
| Mindfulness | /mindfulness   | mindfulness_sessions      | Breathing phase timer, duration selector, sound-linked session, cycle counter |
| Sleep       | /sleep         | sleep_logs                | Bedtime/wake input, duration display, 7-day AreaChart (hours) |

**Key goal:** Track consistency of mind-restorative behaviors. All three dashboards contribute to the Mind Score.

### 2 - Emotional Wellness

| Dashboard | Route       | Primary Data Source  | Visualizations                                        |
|-----------|-------------|----------------------|-------------------------------------------------------|
| Mood      | /mood       | mood_entries         | 8-state emoji grid, 7-day AreaChart (score trend)     |
| Journal   | /journal    | journal_entries      | Rich text editor, mood tag, calendar date picker, word count badge |
| Gratitude | /gratitude  | gratitude_entries    | Entry list with emoji + category badges, daily count card |

**Key goal:** Surface emotional patterns. The Mood AreaChart directly maps mood_score over 7 days, making trend direction visible at a glance.

### 3 - Social Wellness

| Dashboard | Route    | Primary Data Source    | Visualizations                                                          |
|-----------|----------|------------------------|-------------------------------------------------------------------------|
| Social    | /social  | social_interactions    | Category selector, rating selector, optional note, Connection Wellness Score ring, 7-day BarChart (frequency), 7-day LineChart (daily wellness score), Category Mix breakdown cards, Recent Interactions list |

**Key goal:** Quantify relationship quality, not just quantity. The Connection Wellness Score blends interaction quality (75%) and frequency (25%).

### 4 - Productivity

| Dashboard | Route      | Primary Data Source          | Visualizations                                              |
|-----------|------------|------------------------------|-------------------------------------------------------------|
| Habits    | /habits    | habits                       | Habit checklist, streak flame badge, success rate bar, global completion % |
| Goals     | /goals     | goals                        | Progress bars, short/long-term tabs, overdue warning badge  |
| Tasks     | /todo      | todos                        | Priority-labeled checklist, completion % KPI card           |
| Pomodoro  | /pomodoro  | Session state (in-browser)   | 25-min countdown, break counter, session tally              |
| Study     | /study     | Session state                | Study session log, focus resource cards                     |

**Key goal:** Measure intentional output. Habit streaks, goal progress %, and task completion % are normalized to 0-100 for the Productivity Score.

### 5 - Physical Wellness

| Dashboard | Route      | Primary Data Source  | Visualizations                                                |
|-----------|------------|----------------------|---------------------------------------------------------------|
| Activity  | /activity  | activity_logs        | Activity type selector, duration input, 7-day BarChart (minutes), intensity distribution |
| Water     | /water     | water_logs           | Animated fill ring, +/- glass controls, progress % card, hydration status badge |
| Health    | /health    | Aggregated (all)     | 3 ProgressRings (Mental / Physical / Social), 7-day multi-line chart |

**Key goal:** Track physical care routines. The Health dashboard aggregates Mental, Physical, and Social health into a single-view ring display updated by real records.

### 6 - Cross-Cutting Dashboards

| Dashboard     | Route            | Data Sources              | Purpose                                                          |
|---------------|------------------|---------------------------|------------------------------------------------------------------|
| Home          | /home            | All tables                | Daily overview: today's mood, hydration, habits, activity KPIs  |
| Analytics     | /analytics       | All tables                | LifeSync Score history, category pie chart, 30-day trend line, achievements |
| AI Insights   | /ai-insights     | All tables -> Edge Fn     | Weekly summary, wellness score ring, strengths, improvements, recommendations |
| Wellness Test | /wellness-test   | User responses            | Periodic self-assessment; scores feed into baseline calibration  |
| Games         | /games           | Session state             | Cognitive mini-games contributing to Mind Score (optional bonus) |
| Feedback      | /feedback        | User input                | Product improvement; not scored                                  |
| Profile       | /profile         | users                     | Account management, data privacy settings                        |

---

## Metrics and Calculations

### Mind Wellness

#### Meditation

| Metric                | Formula                                                              |
|-----------------------|----------------------------------------------------------------------|
| Total minutes / week  | SUM(duration) WHERE started_at >= NOW() - 7d                        |
| Average session (min) | SUM(duration) / COUNT(sessions)                                     |
| Sessions this week    | COUNT(*) WHERE started_at >= NOW() - 7d                             |
| Completion rate       | COUNT(completed = true) / COUNT(*) x 100                            |
| Favorite sound        | MODE(sound_id) over 7-day window                                    |
| Daily streak          | Consecutive calendar days with >= 1 completed session               |

#### Mindfulness

| Metric               | Formula                                                              |
|----------------------|----------------------------------------------------------------------|
| Sessions this week   | COUNT(*) WHERE started_at >= NOW() - 7d                             |
| Total minutes / week | SUM(duration) WHERE started_at >= NOW() - 7d                        |
| Avg breathing cycles | AVG(phase_cycles) per session this week                             |
| Weekly streak        | Consecutive days with >= 1 session                                  |

#### Sleep

| Metric            | Formula                                                    |
|-------------------|------------------------------------------------------------|
| Last night        | duration_h for date = YESTERDAY                            |
| 7-day average     | SUM(duration_h) / 7                                        |
| Sleep deficit     | MAX(0, 8.0 - avg_7d_sleep_h)                               |
| Best night (7d)   | MAX(duration_h) WHERE date >= NOW() - 7d                   |
| Consistency score | STDEV(duration_h) - lower = more consistent (inverted for scoring) |

---

### Emotional Wellness

#### Mood

| Metric           | Formula                                                       |
|------------------|---------------------------------------------------------------|
| Today's score    | mood_score for date = TODAY                                   |
| 7-day average    | SUM(mood_score) / COUNT(entries) WHERE date >= NOW() - 7d    |
| Weekly high      | MAX(mood_score) WHERE date >= NOW() - 7d                      |
| Weekly low       | MIN(mood_score) WHERE date >= NOW() - 7d                      |
| Trend direction  | mood_score[day7] - mood_score[day1]: positive = improving     |
| Normalized score | (avg_mood_score - 1) / (5 - 1) x 100 maps 1-5 to 0-100       |

#### Journal

| Metric            | Formula                                                |
|-------------------|--------------------------------------------------------|
| Current streak    | Consecutive days with >= 1 entry                       |
| Entries this week | COUNT(*) WHERE date >= NOW() - 7d                      |
| Avg word count    | AVG(word_count) WHERE date >= NOW() - 7d               |

#### Gratitude

| Metric              | Formula                                          |
|---------------------|--------------------------------------------------|
| Entries today       | COUNT(*) WHERE date = TODAY                      |
| Entries this week   | COUNT(*) WHERE date >= NOW() - 7d                |
| Top category        | MODE(category) WHERE date >= NOW() - 7d          |
| Daily consistency   | Days with >= 1 entry / 7 (% of week covered)     |

---

### Social Wellness

**Per-interaction impact score:**

```
impactScore = MIN(100, ROUND(ratingScore x categoryMultiplier))
```

Rating score table:

| Rating        | Base Score |
|---------------|------------|
| Very Positive | 100        |
| Positive      | 80         |
| Neutral       | 60         |
| Negative      | 35         |
| Very Negative | 15         |

Category multiplier table:

| Category  | Multiplier | Reasoning                             |
|-----------|------------|---------------------------------------|
| Family    | 1.10       | Deep relational bonds amplify impact  |
| Friends   | 1.05       | Close social ties                     |
| Animals   | 1.00       | Baseline - positive but neutral       |
| Strangers | 0.90       | Weaker relational weight              |

**Connection Wellness Score (0-100):**

```
frequencyScore  = MIN(100, (weeklyCount / 10) x 100)
averageImpact   = AVG(impactScore) across all stored interactions
wellnessScore   = ROUND(averageImpact x 0.75 + frequencyScore x 0.25)
```

Quality (75%) is weighted over frequency (25%) - reflecting that meaningful interactions matter more than sheer volume.

**Additional social metrics:**

| Metric                  | Formula                                                        |
|-------------------------|----------------------------------------------------------------|
| Positive ratio (%)      | COUNT(rating IN [Very Positive, Positive]) / total x 100       |
| Weekly interaction count| COUNT(*) WHERE created_at >= NOW() - 7d                        |
| Category mix            | COUNT(*) GROUP BY category (shown as breakdown cards)          |
| 7-day frequency chart   | Daily COUNT(*) for each of the past 7 days (BarChart)          |
| 7-day wellness chart    | Daily AVG(impactScore) for each of the past 7 days (LineChart) |

---

### Productivity

#### Habits

| Metric              | Formula                                                        |
|---------------------|----------------------------------------------------------------|
| Active streak/habit | Consecutive days completed_today = true before a miss         |
| Global streak       | Days where ALL habits were completed                           |
| Completion % today  | completedCount / totalHabits x 100                             |
| Success rate/habit  | daysCompleted / daysSinceCreation x 100                        |
| On-fire threshold   | Streak >= 7 days triggers flame badge                          |

#### Goals

| Metric               | Formula                                                    |
|----------------------|------------------------------------------------------------|
| Avg progress %       | AVG(progress) WHERE completed = false                      |
| Completed this month | COUNT(*) WHERE completed = true AND date >= NOW() - 30d    |
| Overdue goals        | COUNT(*) WHERE target_date < TODAY AND completed = false   |

#### Tasks (Todo)

| Metric                | Formula                                             |
|-----------------------|-----------------------------------------------------|
| Completion % today    | COUNT(completed = true) / COUNT(*) x 100            |
| High-priority open    | COUNT(*) WHERE priority = high AND completed = false|
| Tasks done this week  | COUNT(*) WHERE completed = true AND date >= NOW() - 7d |

#### Pomodoro

| Metric         | Formula                                                       |
|----------------|---------------------------------------------------------------|
| Sessions today | COUNT(completed work blocks) in current browser session       |
| Focus minutes  | sessions x 25                                                 |
| Break minutes  | breaks x 5                                                    |
| Focus ratio    | focus_minutes / (focus_minutes + break_minutes) x 100         |

---

### Physical Wellness

#### Activity

| Metric               | Formula                                                   |
|----------------------|-----------------------------------------------------------|
| Total minutes / week | SUM(duration) WHERE logged_at >= NOW() - 7d               |
| Active days          | COUNT(DISTINCT DATE(logged_at)) WHERE logged_at >= NOW() - 7d |
| Estimated calories   | SUM(duration x MET x weight_kg / 60) per session          |
| Favorite activity    | MODE(type) WHERE logged_at >= NOW() - 30d                 |

#### Water

| Metric           | Formula                                                     |
|------------------|-------------------------------------------------------------|
| Daily progress   | glasses / goal x 100 (%)                                    |
| Goal             | 8 glasses / day = 2.0 L                                     |
| Hydration status | <50% Needs Water / 50-79% Good / >=80% Hydrated             |
| Days on-goal/week| COUNT(WHERE glasses >= goal AND date >= NOW() - 7d)         |

---

## Normalization Reference

All sub-scores are normalized to **0-100** before being composed into the LifeSync Score.

| Pillar       | Raw Signal                          | Normalization Formula                                            |
|--------------|-------------------------------------|------------------------------------------------------------------|
| Mind         | Meditation min + sleep h + sessions | MIN(100, (meditation_min/70 + sleep_h/8 + sessions/7) / 3 x 100)|
| Emotional    | Mood avg + streak + gratitude count | mood_norm x 0.5 + streak_norm x 0.3 + gratitude_norm x 0.2      |
| Social       | Connection Wellness Score           | Already 0-100 from wellness formula                              |
| Productivity | Habit % + goal avg % + task %       | habit_pct x 0.5 + goal_pct x 0.3 + task_pct x 0.2               |
| Physical     | Activity min + hydration %          | MIN(100, activity_min/150 x 100) x 0.6 + hydration_pct x 0.4    |

Where:
- `mood_norm = (avg_mood_score - 1) / 4 x 100`
- `streak_norm = MIN(100, journal_streak / 7 x 100)`
- `gratitude_norm = MIN(100, weekly_count / 7 x 100)`

---

## AI Insights Flow

```
+-----------------------------------------------------------------------------+
|                 STEP 1 - User triggers weekly analysis                      |
|           Clicks "Generate Weekly Insights" on /ai-insights                 |
+---------------------------------+-------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------+
|                 STEP 2 - Authentication guard                               |
|  supabase.auth.getSession()                                                 |
|  -> No session: error toast, abort                                          |
|  -> Session OK: continue with user_id                                       |
+---------------------------------+-------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------+
|                 STEP 3 - Data aggregation (last 7 days)                     |
|                                                                             |
|  Mind        meditation_min . sleep_avg_h . mindfulness_sessions            |
|              sleep_consistency . meditation_streak                          |
|                                                                             |
|  Emotional   mood_avg . mood_trend . journal_streak . word_count_avg        |
|              gratitude_count . gratitude_categories                         |
|                                                                             |
|  Social      connection_wellness_score . positive_ratio                     |
|              total_interactions . category_mix                              |
|                                                                             |
|  Productivity habit_completion_pct . top_habit_streak                      |
|               goal_avg_progress . task_completion_pct                       |
|               pomodoro_sessions                                             |
|                                                                             |
|  Physical    activity_min . active_days . calories_est                      |
|              water_goal_hit_days . hydration_pct                            |
+---------------------------------+-------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------+
|                 STEP 4 - Sub-score computation                              |
|                                                                             |
|  mind_score         = normalize(mind metrics)         -> 0-100              |
|  emotional_score    = normalize(emotional metrics)    -> 0-100              |
|  social_score       = connection_wellness_score       -> 0-100              |
|  productivity_score = normalize(productivity metrics) -> 0-100              |
|  physical_score     = normalize(physical metrics)     -> 0-100              |
+---------------------------------+-------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------+
|                 STEP 5 - Composite LifeSync Score                           |
|                                                                             |
|  lifeSync_score = ROUND(                                                    |
|    mind_score         x 0.25  +                                             |
|    emotional_score    x 0.20  +                                             |
|    social_score       x 0.20  +                                             |
|    productivity_score x 0.20  +                                             |
|    physical_score     x 0.15                                               |
|  )                                                                          |
+---------------------------------+-------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------+
|                 STEP 6 - Supabase Edge Function: generate-ai-insights       |
|                                                                             |
|  Receives structured JSON payload with all sub-scores + raw metrics         |
|  Constructs a system prompt identifying:                                    |
|   . Strongest pillar (highest sub-score)                                    |
|   . Weakest pillar (lowest sub-score)                                       |
|   . Notable trends (mood trending up/down, streak milestone, etc.)          |
|   . Cross-pillar flags (e.g., low sleep + low mood this week)               |
|                                                                             |
|  Calls LLM (GPT-4o / Claude) with structured prompt                        |
|  Returns AIInsightRecord:                                                   |
|   {                                                                         |
|     summary         : string    // 2-3 sentence weekly narrative            |
|     wellness_score  : number    // 0-100 composite (pre-computed)           |
|     strengths       : string[]  // 3-5 specific achievements                |
|     improvements    : string[]  // 3-5 identified gaps                      |
|     recommendations : string[]  // 3-6 concrete next actions                |
|   }                                                                         |
+---------------------------------+-------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------+
|                 STEP 7 - Dashboard render                                   |
|                                                                             |
|  /ai-insights page:                                                         |
|  +-- Gradient "Weekly Summary" card with narrative                          |
|  +-- SVG score ring: wellness_score / 100                                   |
|  +-- Green card: strengths (bulleted)                                       |
|  +-- Orange card: improvements (bulleted)                                   |
|  +-- Indigo 3-column grid: recommendations (numbered)                       |
|                                                                             |
|  /analytics page:                                                           |
|  +-- LifeSync Score trend (30-day LineChart)                                |
|  +-- Category sub-score PieChart                                            |
+-----------------------------------------------------------------------------+
```

### Example AI Input Payload (7-day aggregate)

```json
{
  "user_id": "usr_abc123",
  "period": "2026-03-09 to 2026-03-16",
  "mind": {
    "meditation_min": 65,
    "meditation_sessions": 5,
    "meditation_streak_days": 5,
    "avg_session_min": 13,
    "mindfulness_sessions": 3,
    "sleep_avg_hours": 7.1,
    "sleep_deficit_hours": 0.9,
    "sleep_consistency_stdev": 0.6,
    "mind_score": 72
  },
  "emotional": {
    "mood_avg_score": 3.8,
    "mood_trend": "+0.3 (improving)",
    "mood_weekly_high": 5.0,
    "mood_weekly_low": 2.0,
    "journal_streak_days": 12,
    "avg_entry_word_count": 180,
    "gratitude_entries": 6,
    "gratitude_top_category": "Family",
    "emotional_score": 79
  },
  "social": {
    "connection_wellness_score": 74,
    "total_interactions": 8,
    "positive_ratio_pct": 82,
    "category_mix": { "Friends": 4, "Family": 2, "Strangers": 1, "Animals": 1 },
    "social_score": 74
  },
  "productivity": {
    "habit_completion_pct": 73,
    "top_habit_streak": 12,
    "goal_avg_progress_pct": 55,
    "task_completion_pct": 68,
    "pomodoro_sessions": 2,
    "productivity_score": 65
  },
  "physical": {
    "activity_min": 180,
    "active_days": 4,
    "calories_estimated": 1260,
    "water_goal_hit_days": 5,
    "hydration_pct_avg": 81,
    "physical_score": 77
  },
  "lifesync_score": 74
}
```

### Example AI Output

**Weekly Summary:**
> "You had a solid week overall - your emotional wellness was particularly strong, driven by a 12-day journal streak and an improving mood trend. Social quality was high with 82% of interactions rated positively. The main drag this week was productivity: only 2 Pomodoro sessions and a 68% task completion rate signal that structured focus time needs attention."

**Strengths:**
- Journal streak of 12 consecutive days - a personal record in emotional consistency
- Mood trending upward across the week (+0.3 points, reaching Excited on Wednesday)
- Social wellness at 74/100 with 82% positive interaction rate
- Hydration goal met on 5 of 7 days
- 180 minutes of physical activity spread across 4 active days

**Areas to Focus On:**
- Sleep averaged 7.1 hours - 0.9 hours below the 8-hour target on 3 nights
- Productivity score (65/100) is the weakest pillar this week
- Only 2 Pomodoro sessions logged; structured focus time is lagging
- 3 high-priority tasks remain incomplete as of Friday
- 1 goal is overdue - review target date and adjust scope

**AI Recommendations:**
1. Move bedtime 30 minutes earlier on nights following high-activity days to close the 0.9-hour sleep deficit
2. Block 2 Pomodoro sessions (9-10 AM) daily on the 3 highest-priority open tasks before noon
3. Review and update the overdue goal - extend the deadline or break it into smaller milestones
4. Keep the journal streak going - add a 2-sentence minimum entry on days when writing feels hard
5. Try a 20-minute Ocean Waves meditation on Sunday evenings to prime the week ahead
6. Log one intentional Family interaction this week to maintain the high positive ratio

---

## Composite LifeSync Score

### Weighted Formula

```
LifeSync Score = ROUND(
  mind_score         x 0.25  +
  emotional_score    x 0.20  +
  social_score       x 0.20  +
  productivity_score x 0.20  +
  physical_score     x 0.15
)
```

Where each sub-score is in the range 0-100.

### Weight Rationale

| Pillar       | Weight | Reasoning                                                |
|--------------|--------|----------------------------------------------------------|
| Mind         | 25%    | Sleep + meditation are foundational to all other pillars |
| Emotional    | 20%    | Mood and self-reflection power long-term resilience      |
| Social       | 20%    | Human connection is a primary determinant of well-being  |
| Productivity | 20%    | Intentional output creates purpose and momentum          |
| Physical     | 15%    | Physical care supports but does not override the above   |

### Wellness Tier Bands

| Score Range | Tier         | Description                                           |
|-------------|--------------|-------------------------------------------------------|
| 90-100      | Synchronized | All five pillars at peak - rare and worth celebrating |
| 75-89       | Balanced     | Strong across the board; one minor gap                |
| 60-74       | Growing      | Visible progress; 1-2 pillars need attention          |
| 45-59       | Developing   | Foundation present; multiple pillars lagging          |
| 0-44        | Needs Sync   | Several pillars critically low; AI flags urgent gaps  |

---

## Cross-Pillar Analysis

Cross-pillar analysis reveals how different wellness domains influence each other. These patterns are surfaced in the AI Insights summary and the /analytics charts.

### Sleep vs. Mood

**Hypothesis:** Nights with sleep duration below 6.5 hours correlate with lower mood scores the following day.

**Calculation:**
```
For each day d:
  sleep_prev_night = sleep_logs.duration_h WHERE date = d - 1
  mood_today       = mood_entries.mood_score WHERE date = d

Correlation = PEARSON(sleep_series, mood_series) over 30 days
```

**Chart:** Dual-axis LineChart on /health and /analytics - sleep hours (left axis) vs. mood score (right axis) over 30 days.

**AI trigger:** If correlation > 0.5 and last 3 nights averaged < 6.5h, AI surfaces:
> "Your mood dropped significantly on days following poor sleep - prioritizing 7+ hours this week could improve your mood average by an estimated 0.5-1.0 points."

---

### Meditation vs. Productivity

**Hypothesis:** Days with a completed meditation session show higher task completion rates and Pomodoro session counts.

**Calculation:**
```
meditation_days = dates WHERE meditation_sessions.completed = true

avg_task_completion_on_meditation_days     = AVG(task_pct) on meditation_days
avg_task_completion_on_non_meditation_days = AVG(task_pct) on remaining days

delta = avg_meditation_days - avg_non_meditation_days
```

**Chart:** Grouped BarChart on /analytics comparing task completion % on meditation vs. non-meditation days.

**AI trigger:** If delta > 10%, AI surfaces:
> "On days you meditated, your task completion was X% higher. Even a 5-minute session in the morning appears to prime your focus for the day."

---

### Physical Activity vs. Emotional Wellness

**Hypothesis:** Weeks with 150+ minutes of activity show higher average mood scores and more gratitude entries.

**Calculation:**
```
active_weeks = weeks WHERE SUM(activity_logs.duration) >= 150

avg_mood_active   = AVG(mood_entries.mood_score) in active_weeks
avg_mood_inactive = AVG(mood_entries.mood_score) in inactive_weeks
```

**Chart:** Paired BarChart on /analytics - weekly activity minutes vs. weekly mood average.

**AI trigger:** If mood gap > 0.5 points, AI surfaces:
> "Your mood average is X points higher in weeks when you exercise for 150+ minutes. Scheduling activity early in the week tends to raise your emotional baseline."

---

### Gratitude vs. Mood Trend

**Hypothesis:** Days with >= 1 gratitude entry show a higher mood score the same day or the following morning.

**Calculation:**
```
gratitude_days = dates WHERE COUNT(gratitude_entries) >= 1

avg_mood_on_gratitude_days     = AVG(mood_score) WHERE date IN gratitude_days
avg_mood_on_non_gratitude_days = AVG(mood_score) WHERE date NOT IN gratitude_days
```

**AI trigger:** If delta > 0.3 points and gratitude consistency < 50%, AI surfaces:
> "On days you logged gratitude, your mood was measurably higher. A 60-second entry could be one of the highest-leverage habits you add."

---

### Social Interactions vs. Mood

**Hypothesis:** Days with >= 1 positive social interaction show higher same-day mood scores.

**Calculation:**
```
positive_interaction_days = dates WHERE any social_interactions.rating
                            IN [Very Positive, Positive]

avg_mood_on_positive_days  = AVG(mood_score) WHERE date IN positive_interaction_days
avg_mood_on_other_days     = AVG(mood_score) WHERE date NOT IN positive_interaction_days
```

**AI trigger:** If delta > 0.4 points, AI surfaces:
> "Your mood scores are noticeably higher on days with positive social contact. Even brief, uplifting interactions appear to have a meaningful effect on your emotional state."

---

### Cross-Pillar Summary Table

| Pattern                        | Data Inputs                            | Output in AI                               |
|--------------------------------|----------------------------------------|--------------------------------------------|
| Sleep -> Mood                  | sleep_logs + mood_entries              | Sleep deficit -> low mood warning           |
| Meditation -> Productivity     | meditation_sessions + todos            | Meditation correlation to task output      |
| Activity -> Emotional          | activity_logs + mood_entries           | Exercise + mood elevation flag             |
| Gratitude -> Mood              | gratitude_entries + mood_entries       | Gratitude practice vs. mood lift           |
| Social quality -> Mood         | social_interactions + mood_entries     | Positive interaction vs. mood delta        |
| Habit streaks -> Goal progress | habits + goals                         | Consistency bridging to goal attainment    |
| Water intake -> Mood (energy)  | water_logs + mood_entries              | Dehydration days vs. low-energy moods      |

---

## Feedback Loop

The LifeSync feedback loop ensures AI recommendations are not one-directional - they close back into the data layer and evolve week over week.

```
+-------------------------------------------------------------+
|  AI Recommendations delivered on /ai-insights               |
|  e.g., "Sleep 30 min earlier 3 nights this week"            |
+-----------------------------+-------------------------------+
                              | user acts
                              v
+-------------------------------------------------------------+
|  New data logged                                             |
|  . sleep_logs: bedtime earlier, duration_h increases         |
|  . mood_entries: mood_score improves on following days       |
|  . habits: new "10pm bedtime" habit added, streak grows      |
+-----------------------------+-------------------------------+
                              | metrics recalculated
                              v
+-------------------------------------------------------------+
|  Sub-scores updated (next 7-day window)                      |
|  . mind_score increases (better sleep)                       |
|  . emotional_score increases (improved mood)                 |
|  . productivity_score may increase (well-rested focus)       |
+-----------------------------+-------------------------------+
                              | AI re-evaluates
                              v
+-------------------------------------------------------------+
|  Next week's AI insights reflect the improvement             |
|  . Sleep listed in Strengths instead of Improvements        |
|  . New lowest pillar identified                              |
|  . Fresh recommendations target the next gap                |
+-------------------------------------------------------------+
```

**Behavioral principles:**
1. Each recommendation maps to a **specific loggable action** in a LifeSync dashboard.
2. Progress on the recommended action is **measurable** within 7 days.
3. The AI never repeats a recommendation the user has already resolved.
4. Over time, as all pillars improve, recommendations shift from remedial to **optimization-focused** (e.g., from "sleep more" to "optimize your sleep consistency window").

---

## Tech Stack

| Layer        | Technology                                                           |
|--------------|----------------------------------------------------------------------|
| Frontend     | React 18 + TypeScript + Vite 5                                       |
| Routing      | Wouter (useLocation, Link, ProtectedRoute)                           |
| UI           | Tailwind CSS + shadcn/ui (Button, Card, Input, Badge, Select, etc.)  |
| Charts       | Recharts - BarChart, LineChart, AreaChart, PieChart, ResponsiveContainer |
| Animations   | Framer Motion (motion.div, AnimatePresence)                          |
| Auth         | Supabase Auth (supabase.auth.getSession)                             |
| AI Engine    | Supabase Edge Function generate-ai-insights -> LLM (GPT-4o / Claude)|
| Database     | Drizzle ORM + Neon Postgres via @neondatabase/serverless             |
| DB Fallback  | In-memory MemStorage (active when DATABASE_URL is not set)           |
| Audio        | Native HTMLAudioElement - loop=true, volume=0.7, preload=auto        |
| Server       | Express + Node.js (tsx runtime); entry: server/index.ts              |
| API Routes   | GET/POST /api/social-interactions, POST /api/auth/register           |
| Build        | Vite 5 (frontend) + esbuild (server bundle)                          |
| DB Schema    | shared/schema.ts (Drizzle table definitions + Zod insert schemas)    |
| Path Aliases | @/ -> src/ . @shared/ -> shared/                                     |

---

*Generated: 2026-03-16 - LifeSync Wellness Analytics System*
