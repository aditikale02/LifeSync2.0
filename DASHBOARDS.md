# LifeSync Dashboard Documentation

## Table of Contents

1. [Home Dashboard](#1-home-dashboard)
2. [Habits Dashboard](#2-habits-dashboard)
3. [Gratitude Dashboard](#3-gratitude-dashboard)
4. [Mood Dashboard](#4-mood-dashboard)
5. [Activity Dashboard](#5-activity-dashboard)
6. [Goals Dashboard](#6-goals-dashboard)
7. [Journal Dashboard](#7-journal-dashboard)
8. [Sleep Dashboard](#8-sleep-dashboard)
9. [Nutrition Dashboard](#9-nutrition-dashboard)
10. [Water Tracker](#10-water-tracker)
11. [To-Do List](#11-to-do-list)
12. [Mindfulness Dashboard](#12-mindfulness-dashboard)
13. [Meditation Dashboard](#13-meditation-dashboard)
14. [Social Dashboard](#14-social-dashboard)
15. [Study Dashboard](#15-study-dashboard)
16. [Analytics Dashboard](#16-analytics-dashboard)
17. [Wellness Test](#17-wellness-test)
18. [User Settings](#18-user-settings)
19. [Summary Table](#summary-table)

---

## 1. Home Dashboard

**Route:** `/`

**Purpose:**
The main landing dashboard that gives the user a high-level overview of their wellness day, recent activity, and daily progress across all tracked metrics.

**UI Components:**
- Hero banner with nature background image and welcome message
- 4 `StatCard` widgets: Water Intake, Meditation, Wellness Score, Goals Completed
- `ProgressRing` showing daily progress percentage
- Recent Activity feed with timestamped actions

**Features & Actions:**
- View daily summary stats (water intake, meditation minutes, wellness score, goals)
- See daily overall progress ring
- Review recent cross-dashboard activity feed

**Connected Supabase Tables:**
- `profiles` (welcome message / user name)
- `habits` (goals completed stat)
- `mood_entries` (wellness score)
- `activities` (recent activity)

**Key Database Operations:**
- `FETCH` user profile for welcome message
- `FETCH` habit completion count for today
- `FETCH` recent activity entries (ordered by `created_at DESC`)
- `FETCH` mood entries to compute wellness score

---

## 2. Habits Dashboard

**Route:** `/habits`

**Purpose:**
Track daily habits, monitor streaks, measure success rates, and build consistency over time.

**UI Components:**
- Stats cards: Today's Progress, Best Streak, Overall Success Rate
- Add New Habit form (text input + add button)
- Habit list with checkboxes, emoji, streak badge, and success rate badge
- Motivational card shown when streak ≥ 7 days

**Features & Actions:**
- Create a new habit (name + emoji)
- Mark a habit as completed for today (toggle checkbox)
- Delete a habit
- View streak count per habit
- View overall success rate
- Earn motivational message when streak ≥ 7 days

**Connected Supabase Tables:**
- `habits`
- `habit_logs`

**Key Database Operations:**
```sql
-- Fetch user's habits
SELECT * FROM habits WHERE user_id = auth.uid() AND is_active = true;

-- Add new habit
INSERT INTO habits (user_id, name, emoji) VALUES (auth.uid(), $name, $emoji);

-- Delete habit
DELETE FROM habits WHERE id = $habit_id AND user_id = auth.uid();

-- Mark habit complete (log today)
INSERT INTO habit_logs (user_id, habit_id, completed_on) VALUES (auth.uid(), $habit_id, CURRENT_DATE)
  ON CONFLICT (habit_id, completed_on) DO NOTHING;

-- Update streak + success rate on habit
UPDATE habits SET streak = $streak, success_rate = $rate, updated_at = NOW()
  WHERE id = $habit_id AND user_id = auth.uid();
```

**Relationships:**
- `habits` → `habit_logs` (one habit can have many log entries, one per day)
- Completing a habit today creates a record in `habit_logs`

---

## 3. Gratitude Dashboard

**Route:** `/gratitude`

**Purpose:**
Log daily gratitude entries, reflect on life's positives, and revisit past memory reminders to foster a positive mindset.

**UI Components:**
- Memory Reminder card (random past entry)
- Today's Gratitude form: emoji picker, category selector (Health, Family, Nature, Work, Friends, Self), text input
- Gratitude journal list showing all entries with emoji, text, category, and date
- Limit: 3 entries per day with success message on completion

**Features & Actions:**
- Add a gratitude entry (text + emoji + category)
- View past gratitude journal entries
- Select emoji to personalize entries
- Select a category for each entry
- Receive random "memory reminder" from past entries
- Limited to 3 entries per day

**Connected Supabase Tables:**
- `gratitude_entries`

**Key Database Operations:**
```sql
-- Fetch all entries for user
SELECT * FROM gratitude_entries WHERE user_id = auth.uid() ORDER BY entry_date DESC;

-- Fetch today's entries (for count limit)
SELECT * FROM gratitude_entries WHERE user_id = auth.uid() AND entry_date = CURRENT_DATE;

-- Add new entry
INSERT INTO gratitude_entries (user_id, text, emoji, category, entry_date)
  VALUES (auth.uid(), $text, $emoji, $category, CURRENT_DATE);

-- Delete entry
DELETE FROM gratitude_entries WHERE id = $id AND user_id = auth.uid();
```

---

## 4. Mood Dashboard

**Route:** `/mood`

**Purpose:**
Log daily emotional states, add optional notes, and review weekly mood patterns to understand mental health trends.

**UI Components:**
- Mood selector grid (8 moods: Happy, Sad, Angry, Tired, Sleepy, Excited, Calm, Neutral) with emoji buttons
- Optional text area for notes when a mood is selected
- Log Mood button
- Weekly mood pattern visual (emoji timeline per day)
- Motivational message card (responds differently to Sad/Happy/etc.)

**Features & Actions:**
- Select mood from 8 emotion options
- Add a note/description about the mood
- Log mood for the current day
- Review weekly mood trend

**Connected Supabase Tables:**
- `mood_entries`

**Key Database Operations:**
```sql
-- Log a mood entry
INSERT INTO mood_entries (user_id, mood, emoji, note, entry_date)
  VALUES (auth.uid(), $mood, $emoji, $note, CURRENT_DATE);

-- Fetch mood history for weekly chart
SELECT mood, emoji, entry_date FROM mood_entries
  WHERE user_id = auth.uid() AND entry_date >= (CURRENT_DATE - INTERVAL '7 days')
  ORDER BY entry_date DESC;

-- Update today's entry if it already exists
UPDATE mood_entries SET mood = $mood, note = $note WHERE user_id = auth.uid() AND entry_date = CURRENT_DATE;
```

---

## 5. Activity Dashboard

**Route:** `/activity`

**Purpose:**
Log physical activities, track workout streaks, and visualize weekly exercise patterns.

**UI Components:**
- Stats cards: This Week (total minutes), Streak, Badges Unlocked
- Activity type selector (Running, Yoga, Walking, Sports, Gym)
- Duration input and Log button
- Weekly activity bar chart (minutes per day)

**Features & Actions:**
- Select activity type
- Log duration in minutes
- View total weekly activity time
- View streak count
- See unlocked achievement badges
- Review weekly activity bar chart

**Connected Supabase Tables:**
- `activities`

**Key Database Operations:**
```sql
-- Log an activity
INSERT INTO activities (user_id, type, duration_minutes, intensity, logged_on)
  VALUES (auth.uid(), $type, $duration, 'Moderate', CURRENT_DATE);

-- Fetch this week's activities
SELECT type, duration_minutes, logged_on FROM activities
  WHERE user_id = auth.uid() AND logged_on >= (CURRENT_DATE - INTERVAL '7 days')
  ORDER BY logged_on DESC;

-- Aggregate weekly total
SELECT SUM(duration_minutes) as total FROM activities
  WHERE user_id = auth.uid() AND logged_on >= (CURRENT_DATE - INTERVAL '7 days');
```

---

## 6. Goals Dashboard

**Route:** `/goals`

**Purpose:**
Set and track short-term and long-term personal goals, monitor progress percentages, and celebrate achievements.

**UI Components:**
- Stats cards: Active Goals count, Achievements (completed goals count)
- Add Goal form: type toggle (Short-term / Long-term), title input, target date picker
- Goals list with progress bars, type badge, completion status
- Achievement celebration card (shown when goals are completed)

**Features & Actions:**
- Add a new goal (title, type, target date)
- Track progress (0–100%)
- Mark goal as completed
- View short-term vs long-term goals
- View total completed goals count

**Connected Supabase Tables:**
- `goals`

**Key Database Operations:**
```sql
-- Fetch user's goals
SELECT * FROM goals WHERE user_id = auth.uid() ORDER BY created_at DESC;

-- Insert new goal
INSERT INTO goals (user_id, title, type, target_date, progress)
  VALUES (auth.uid(), $title, $type, $target_date, 0);

-- Update goal progress
UPDATE goals SET progress = $progress, updated_at = NOW()
  WHERE id = $goal_id AND user_id = auth.uid();

-- Mark goal complete
UPDATE goals SET completed = true, completed_at = NOW(), progress = 100, updated_at = NOW()
  WHERE id = $goal_id AND user_id = auth.uid();

-- Delete goal
DELETE FROM goals WHERE id = $goal_id AND user_id = auth.uid();
```

---

## 7. Journal Dashboard

**Route:** `/journal`

**Purpose:**
Provide a private journaling space for daily written reflection, with mood tagging and calendar-based entry navigation.

**UI Components:**
- Title input
- Mood emoji tag selector (8 options)
- Large textarea for journal entry with word count
- Save button
- Calendar (right panel) for date-based navigation

**Features & Actions:**
- Write a dated journal entry
- Add a title to the entry
- Tag the entry with a mood emoji
- View word count
- Navigate entries by date using calendar

**Connected Supabase Tables:**
> Note: No dedicated `journal_entries` table exists yet. Future integration should use a `journal_entries` table. Currently maps to `gratitude_entries` or requires its own table.

**Recommended Database Operations (once table is added):**
```sql
-- Save journal entry
INSERT INTO journal_entries (user_id, title, content, mood_emoji, entry_date)
  VALUES (auth.uid(), $title, $content, $emoji, $date);

-- Fetch entry by date
SELECT * FROM journal_entries WHERE user_id = auth.uid() AND entry_date = $date;

-- Update existing entry
UPDATE journal_entries SET title = $title, content = $content, mood_emoji = $emoji
  WHERE user_id = auth.uid() AND entry_date = $date;
```

---

## 8. Sleep Dashboard

**Route:** `/sleep`

**Purpose:**
Track sleep schedules (bedtime and wake time), calculate total sleep hours, and review weekly sleep patterns.

**UI Components:**
- Bedtime and Wake Time time inputs
- Calculated total sleep hours display
- Log Sleep Data button
- Weekly sleep bar visualization
- Area chart for weekly sleep pattern
- Sleep Stats: average hours, quality score

**Features & Actions:**
- Set and log bedtime
- Set and log wake time
- Auto-calculate total sleep hours
- View weekly sleep pattern chart
- View average sleep hours and quality score

**Connected Supabase Tables:**
> Note: Requires a `sleep_logs` table (not yet created). Map: `user_id`, `bedtime`, `wake_time`, `hours_slept`, `quality_score`, `log_date`.

**Recommended Database Operations:**
```sql
-- Log sleep data
INSERT INTO sleep_logs (user_id, bedtime, wake_time, hours_slept, log_date)
  VALUES (auth.uid(), $bedtime, $wake_time, $hours, CURRENT_DATE);

-- Fetch weekly sleep
SELECT * FROM sleep_logs WHERE user_id = auth.uid()
  AND log_date >= (CURRENT_DATE - INTERVAL '7 days');
```

---

## 9. Nutrition Dashboard

**Route:** `/nutrition`

**Purpose:**
Log daily meals by type (Breakfast, Lunch, Dinner, Snack), track calorie intake, and view weekly nutrition trends.

**UI Components:**
- Meal type selector (Breakfast, Lunch, Dinner, Snack)
- Food item input + Add button
- Today's Meals list (food name, type, optional calories, delete button)
- Weekly nutrition trend line chart

**Features & Actions:**
- Add a meal entry with type and food description
- View all meals logged for today
- Delete a meal entry
- Review weekly nutrition balance trend

**Connected Supabase Tables:**
> Note: Requires a `nutrition_logs` table (not yet created). Map: `user_id`, `meal_type`, `food`, `calories`, `log_date`.

**Recommended Database Operations:**
```sql
-- Add meal
INSERT INTO nutrition_logs (user_id, meal_type, food, calories, log_date)
  VALUES (auth.uid(), $type, $food, $calories, CURRENT_DATE);

-- Fetch today's meals
SELECT * FROM nutrition_logs WHERE user_id = auth.uid() AND log_date = CURRENT_DATE;

-- Delete meal
DELETE FROM nutrition_logs WHERE id = $id AND user_id = auth.uid();
```

---

## 10. Water Tracker

**Route:** `/water`

**Purpose:**
Track daily water intake against an 8-glass goal with a visual circular progress indicator.

**UI Components:**
- Circular SVG progress ring (glasses / goal)
- Add Glass button (+1) and Decrease button (-1)
- Motivational message when goal is reached

**Features & Actions:**
- Increment water glass count
- Decrement water glass count (min 0)
- View completion percentage
- See motivational message at goal (8 glasses)

**Connected Supabase Tables:**
> Note: Can map to a `water_logs` table or be stored in `user_settings` as a daily counter. Recommended: `water_logs` with `user_id`, `glasses`, `log_date`.

**Recommended Database Operations:**
```sql
-- Upsert today's water log
INSERT INTO water_logs (user_id, glasses, log_date) VALUES (auth.uid(), $glasses, CURRENT_DATE)
  ON CONFLICT (user_id, log_date) DO UPDATE SET glasses = EXCLUDED.glasses;

-- Fetch today's count
SELECT glasses FROM water_logs WHERE user_id = auth.uid() AND log_date = CURRENT_DATE;
```

---

## 11. To-Do List

**Route:** `/todo`

**Purpose:**
Manage a personal task list, mark tasks complete, and track productivity score based on completion rate.

**UI Components:**
- Productivity score header
- Task input + Add button
- Task list with checkboxes and delete buttons
- Strikethrough style for completed tasks

**Features & Actions:**
- Add a new task
- Toggle task completion
- Delete a task
- View productivity percentage (completed/total)

**Connected Supabase Tables:**
> Note: Requires a `todos` table (not yet created). Map: `user_id`, `text`, `completed`, `created_at`.

**Recommended Database Operations:**
```sql
-- Add task
INSERT INTO todos (user_id, text) VALUES (auth.uid(), $text);

-- Toggle completion
UPDATE todos SET completed = $completed WHERE id = $id AND user_id = auth.uid();

-- Delete task
DELETE FROM todos WHERE id = $id AND user_id = auth.uid();

-- Fetch tasks
SELECT * FROM todos WHERE user_id = auth.uid() ORDER BY created_at DESC;
```

---

## 12. Mindfulness Dashboard

**Route:** `/mindfulness`

**Purpose:**
Guide users through breathing exercises, daily mindfulness prompts, and offer ambient meditation music for relaxation.

**UI Components:**
- Guided Breathing card with animated circle (Inhale / Hold / Exhale phases)
- Start/Pause breathing exercise button
- Mindfulness exercise prompt (random daily question)
- Ambient music selection (Ocean Waves, Gentle Rain, Forest Sounds, Bird Songs)
- Daily Reflection textarea + Save button

**Features & Actions:**
- Start/pause guided breathing timer (4-2-4-2 cycle)
- View daily mindfulness prompt
- Select ambient background sound
- Write and save daily reflection

**Connected Supabase Tables:**
> Note: Reflection text can map to `gratitude_entries` or a new `reflections` table.

**Recommended Database Operations:**
```sql
-- Save daily reflection
INSERT INTO gratitude_entries (user_id, text, emoji, category, entry_date)
  VALUES (auth.uid(), $reflection, '🌿', 'Mindfulness', CURRENT_DATE);
```

---

## 13. Meditation Dashboard

**Route:** `/meditation`

**Purpose:**
Run timed guided meditation sessions with customizable duration and ambient sound selection.

**UI Components:**
- Duration selector (5, 10, 15, 20 minutes)
- Sound selector grid (Ocean Waves, Rain Forest, Gentle Wind, Bird Songs)
- Start/Pause Meditation button

**Features & Actions:**
- Select session duration
- Select ambient sound
- Start or pause a meditation session

**Connected Supabase Tables:**
> Note: Requires a `meditation_logs` table. Map: `user_id`, `duration_minutes`, `sound_type`, `completed_at`.

**Recommended Database Operations:**
```sql
-- Log completed meditation session
INSERT INTO meditation_logs (user_id, duration_minutes, sound_type, completed_at)
  VALUES (auth.uid(), $duration, $sound, NOW());
```

---

## 14. Social Dashboard

**Route:** `/social`

**Purpose:**
Log social interactions with others, track emotional impact of those interactions, and view weekly social activity trends.

**UI Components:**
- Stats cards: This Week's interactions count, Social Wellness score
- Log Interaction form: who (person name), how it made you feel (textarea)
- Recent Interactions list (person, feeling, date)
- Weekly Interaction Frequency bar chart

**Features & Actions:**
- Log a social interaction (person + feeling)
- View a list of recent interactions
- See weekly social frequency chart
- Track social wellness percentage

**Connected Supabase Tables:**
> Note: Requires a `social_logs` table. Map: `user_id`, `person`, `feeling`, `log_date`.

**Recommended Database Operations:**
```sql
-- Log interaction
INSERT INTO social_logs (user_id, person, feeling, log_date)
  VALUES (auth.uid(), $person, $feeling, CURRENT_DATE);

-- Fetch weekly interactions
SELECT * FROM social_logs WHERE user_id = auth.uid()
  AND log_date >= (CURRENT_DATE - INTERVAL '7 days');
```

---

## 15. Study Dashboard

**Route:** `/study`

**Purpose:**
Track focused study sessions, manage study topics, monitor weekly study hours, and maintain a study streak.

**UI Components:**
- Stats cards: This Week (total hours), Streak, Productivity %
- Weekly Study Hours bar chart
- Study Topics list (name, hours studied, completed badge)
- Add Topic input + button

**Features & Actions:**
- Add a study topic
- Mark a topic as completed
- View total weekly study hours
- Track study streak in days
- View productivity percentage

**Connected Supabase Tables:**
> Note: Requires `study_topics` and `study_sessions` tables.

**Recommended Database Operations:**
```sql
-- Add study topic
INSERT INTO study_topics (user_id, name) VALUES (auth.uid(), $name);

-- Mark topic complete
UPDATE study_topics SET completed = true WHERE id = $id AND user_id = auth.uid();

-- Log study session
INSERT INTO study_sessions (user_id, topic_id, hours, log_date)
  VALUES (auth.uid(), $topic_id, $hours, CURRENT_DATE);
```

---

## 16. Analytics Dashboard

**Route:** `/analytics`

**Purpose:**
Aggregate data across all wellness categories and present a holistic view of the user's weekly progress and category scores.

**UI Components:**
- Summary stats cards: Overall LifeSync Score, Current Streak, Achievements Unlocked
- Weekly Progress line chart (score per day)
- Wellness Categories pie chart (Physical, Mental, Social, Nutrition scores)

**Features & Actions:**
- View overall weekly wellness score trend
- View category breakdown (Physical, Mental, Social, Nutrition)
- Track longest active streak
- Count total achievements unlocked

**Connected Supabase Tables (read/aggregate from):**
- `habits` + `habit_logs`
- `mood_entries`
- `activities`
- `goals`
- `gratitude_entries`

**Key Database Operations:**
```sql
-- Calculate weekly score from habits
SELECT COUNT(*) as completed FROM habit_logs
  WHERE user_id = auth.uid() AND completed_on >= (CURRENT_DATE - INTERVAL '7 days');

-- Get mood trend
SELECT mood, entry_date FROM mood_entries
  WHERE user_id = auth.uid() ORDER BY entry_date DESC LIMIT 7;

-- Get activity totals
SELECT SUM(duration_minutes) FROM activities
  WHERE user_id = auth.uid() AND logged_on >= (CURRENT_DATE - INTERVAL '7 days');
```

---

## 17. Wellness Test

**Route:** `/wellness-test`

**Purpose:**
An onboarding multi-step questionnaire (6 questions) that assesses the user's current wellness habits and generates a personalized wellness score to kick off their journey.

**UI Components:**
- Progress bar (question X of 6)
- One question at a time with radio button options
- Previous / Next / Finish navigation
- Results screen with animated wellness score (70–100%)
- "Start Your Wellness Journey" CTA button

**Features & Actions:**
- Answer 6 wellness questions (hydration, stress, focus, exercise, mood, diet)
- Navigate forward/backward through questions
- Submit to view personalized wellness score
- Proceed to main dashboard

**Connected Supabase Tables:**
> Note: Responses can be stored in `user_settings` or a `wellness_assessments` table (not yet created).

**Recommended Database Operations:**
```sql
-- Save assessment result
INSERT INTO wellness_assessments (user_id, answers, score, taken_at)
  VALUES (auth.uid(), $answers_json, $score, NOW());
```

---

## 18. User Settings

**Route:** `/settings` *(implied)*

**Purpose:**
Allow users to configure their app preferences including theme, notification settings, reminders, and language.

**Connected Supabase Tables:**
- `user_settings`
- `profiles`
- `reminders`

**Key Database Operations:**
```sql
-- Fetch user settings
SELECT * FROM user_settings WHERE user_id = auth.uid();

-- Upsert settings
INSERT INTO user_settings (user_id, theme, notifications_enabled, habit_reminders, mood_reminders, language)
  VALUES (auth.uid(), $theme, $notifications, $habit_reminders, $mood_reminders, $lang)
  ON CONFLICT (user_id) DO UPDATE SET
    theme = EXCLUDED.theme,
    notifications_enabled = EXCLUDED.notifications_enabled,
    updated_at = NOW();

-- Manage reminders
INSERT INTO reminders (user_id, title, remind_at, repeat_interval)
  VALUES (auth.uid(), $title, $remind_at, $interval);

UPDATE reminders SET is_active = false WHERE id = $id AND user_id = auth.uid();
```

---

## Summary Table

| Dashboard | Database Tables Used |
|---|---|
| Home | `profiles`, `habits`, `habit_logs`, `mood_entries`, `activities` |
| Habits | `habits`, `habit_logs` |
| Gratitude | `gratitude_entries` |
| Mood | `mood_entries` |
| Activity | `activities` |
| Goals | `goals` |
| Journal | `journal_entries` *(future)* |
| Sleep | `sleep_logs` *(future)* |
| Nutrition | `nutrition_logs` *(future)* |
| Water Tracker | `water_logs` *(future)* |
| To-Do List | `todos` *(future)* |
| Mindfulness | `gratitude_entries` (reflections) |
| Meditation | `meditation_logs` *(future)* |
| Social | `social_logs` *(future)* |
| Study | `study_topics`, `study_sessions` *(future)* |
| Analytics | `habits`, `habit_logs`, `mood_entries`, `activities`, `goals`, `gratitude_entries` |
| Wellness Test | `wellness_assessments` *(future)* |
| User Settings | `user_settings`, `profiles`, `reminders` |

---

## Dashboard Relationships

```
profiles ──────────────────────── All dashboards (user identity)
habits ──────────────────────────► habit_logs (1 habit → many daily logs)
gratitude_entries ────────────────► Analytics (mood/wellness score)
mood_entries ─────────────────────► Analytics (weekly mood trend)
activities ───────────────────────► Analytics (physical wellness score)
goals ────────────────────────────► Analytics (goal completion score)
user_settings ────────────────────► All dashboards (theme, notifications)
reminders ────────────────────────► Habits, Goals (scheduled alerts)
```

---

*Documentation generated from frontend source code analysis of LifeSync v1.0.*
*Tables marked as "future" are planned additions recommended for full backend integration.*
