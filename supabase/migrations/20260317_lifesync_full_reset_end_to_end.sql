-- ============================================================================
-- LifeSync Full Reset (DESTRUCTIVE) - End-to-End Schema Rebuild
-- Date: 2026-03-17
--
-- WARNING:
-- - This script DROPS existing LifeSync wellness tables/views and recreates them.
-- - Execute only on the intended Supabase project/environment.
-- - auth.users is NOT dropped.
-- ============================================================================

begin;

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------------
-- 1) Drop legacy/canonical objects (tables first, then views) to guarantee
--    a clean rebuild.
-- --------------------------------------------------------------------------

drop table if exists public._lifesync_probe cascade;

drop table if exists public.habit_logs cascade;
drop table if exists public.habits cascade;
drop table if exists public.goals cascade;
drop table if exists public.tasks cascade;
drop table if exists public.water_entries cascade;
drop table if exists public.sleep_entries cascade;
drop table if exists public.study_sessions cascade;
drop table if exists public.meditation_sessions cascade;
drop table if exists public.mindfulness_sessions cascade;
drop table if exists public.mood_entries cascade;
drop table if exists public.journal_entries cascade;
drop table if exists public.gratitude_entries cascade;
drop table if exists public.pomodoro_sessions cascade;
drop table if exists public.activities cascade;
drop table if exists public.social_interactions cascade;

drop table if exists public.todos cascade;
drop table if exists public.water_logs cascade;
drop table if exists public.sleep_logs cascade;
drop table if exists public.study_logs cascade;
drop table if exists public.activity_logs cascade;
drop table if exists public.meditation_logs cascade;
drop table if exists public.mindfulness_logs cascade;
drop table if exists public.social_logs cascade;
drop table if exists public.pomodoro_logs cascade;
drop table if exists public.reflection_entries cascade;

drop view if exists public.todos cascade;
drop view if exists public.water_logs cascade;
drop view if exists public.sleep_logs cascade;
drop view if exists public.study_logs cascade;
drop view if exists public.activity_logs cascade;
drop view if exists public.meditation_logs cascade;
drop view if exists public.mindfulness_logs cascade;
drop view if exists public.social_logs cascade;
drop view if exists public.pomodoro_logs cascade;

-- --------------------------------------------------------------------------
-- 2) Canonical tables (aligned with current app writes + conflict targets)
-- --------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  priority text not null default 'medium',
  created_at timestamptz not null default now()
);

create table public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  glasses integer generated always as (coalesce(amount, 0)::integer) stored,
  goal integer not null default 8,
  log_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint water_entries_user_log_date_unique unique (user_id, log_date)
);

create table public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bedtime text,
  wake_time text,
  duration numeric,
  duration_h numeric generated always as (coalesce(duration, 0)) stored,
  log_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  constraint sleep_entries_user_log_date_unique unique (user_id, log_date)
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  duration integer not null,
  duration_minutes integer generated always as (coalesce(duration, 0)) stored,
  focus_rating integer,
  notes text,
  study_date date,
  created_at timestamptz not null default now()
);

create table public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration integer not null,
  sound_id text,
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.mindfulness_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration integer not null,
  sound_id text,
  phase_cycles integer not null default 0,
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null,
  mood_label text generated always as (mood) stored,
  mood_score numeric,
  notes text,
  note text generated always as (notes) stored,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint mood_entries_user_entry_date_unique unique (user_id, entry_date)
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  body text generated always as (content) stored,
  mood_emoji text,
  word_count integer not null default 0,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint journal_entries_user_entry_date_unique unique (user_id, entry_date)
);

create table public.gratitude_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  emoji text,
  category text,
  created_at timestamptz not null default now()
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_name text not null,
  name text generated always as (habit_name) stored,
  emoji text not null default '⭐',
  streak integer not null default 0,
  completed_today boolean not null default false,
  success_rate numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  constraint habit_logs_unique_per_day unique (habit_id, completed_on)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null,
  target_date date,
  progress integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration integer not null,
  duration_minutes integer generated always as (coalesce(duration, 0)) stored,
  session_type text not null default 'focus',
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  activity_type text generated always as (type) stored,
  duration integer not null,
  duration_minutes integer generated always as (coalesce(duration, 0)) stored,
  intensity text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.social_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text,
  interaction_type text generated always as (type) stored,
  category text,
  rating text,
  duration integer,
  notes text,
  note text generated always as (notes) stored,
  created_at timestamptz not null default now()
);

create table public._lifesync_probe (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- 3) Compatibility alias views (read compatibility for legacy naming)
-- --------------------------------------------------------------------------

create view public.todos as
select id, user_id, title, title as text, completed, priority, created_at
from public.tasks;

create view public.water_logs as
select id, user_id, glasses, goal, log_date, created_at
from public.water_entries;

create view public.sleep_logs as
select id, user_id, bedtime, wake_time, duration_h, log_date, notes, created_at
from public.sleep_entries;

create view public.study_logs as
select id, user_id, subject, duration_minutes, focus_rating, notes, study_date, created_at
from public.study_sessions;

create view public.activity_logs as
select id, user_id, activity_type as type, duration, intensity, created_at
from public.activities;

create view public.meditation_logs as
select id, user_id, duration, sound_id, completed, started_at, created_at
from public.meditation_sessions;

create view public.mindfulness_logs as
select id, user_id, duration, sound_id, phase_cycles, completed, started_at, created_at
from public.mindfulness_sessions;

create view public.social_logs as
select id, user_id, category, rating, note, created_at
from public.social_interactions;

create view public.pomodoro_logs as
select id, user_id, duration_minutes, session_type, completed, started_at, created_at
from public.pomodoro_sessions;

-- --------------------------------------------------------------------------
-- 4) Indexes
-- --------------------------------------------------------------------------

create index idx_tasks_user_id_created_at on public.tasks (user_id, created_at desc);
create index idx_water_entries_user_id_created_at on public.water_entries (user_id, created_at desc);
create index idx_sleep_entries_user_id_created_at on public.sleep_entries (user_id, created_at desc);
create index idx_study_sessions_user_id_created_at on public.study_sessions (user_id, created_at desc);
create index idx_meditation_sessions_user_id_created_at on public.meditation_sessions (user_id, created_at desc);
create index idx_mindfulness_sessions_user_id_created_at on public.mindfulness_sessions (user_id, created_at desc);
create index idx_mood_entries_user_id_created_at on public.mood_entries (user_id, created_at desc);
create index idx_journal_entries_user_id_created_at on public.journal_entries (user_id, created_at desc);
create index idx_gratitude_entries_user_id_created_at on public.gratitude_entries (user_id, created_at desc);
create index idx_habits_user_id_created_at on public.habits (user_id, created_at desc);
create index idx_habit_logs_user_id_created_at on public.habit_logs (user_id, created_at desc);
create index idx_goals_user_id_created_at on public.goals (user_id, created_at desc);
create index idx_pomodoro_sessions_user_id_created_at on public.pomodoro_sessions (user_id, created_at desc);
create index idx_activities_user_id_created_at on public.activities (user_id, created_at desc);
create index idx_social_interactions_user_id_created_at on public.social_interactions (user_id, created_at desc);

-- --------------------------------------------------------------------------
-- 5) RLS + owner-only policies
-- --------------------------------------------------------------------------

do $$
declare
  t text;
  tables text[] := array[
    'tasks','water_entries','sleep_entries','study_sessions','meditation_sessions',
    'mindfulness_sessions','mood_entries','journal_entries','gratitude_entries',
    'habits','habit_logs','goals','pomodoro_sessions','activities','social_interactions'
  ];
begin
  foreach t in array tables
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_select_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_own', t);

    execute format('create policy %I on public.%I for select using (auth.uid() = user_id)', t || '_select_own', t);
    execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id)', t || '_insert_own', t);
    execute format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || '_update_own', t);
    execute format('create policy %I on public.%I for delete using (auth.uid() = user_id)', t || '_delete_own', t);
  end loop;
end $$;

-- Probe table is operational/diagnostic only.
alter table public._lifesync_probe enable row level security;
drop policy if exists _lifesync_probe_select_all on public._lifesync_probe;
create policy _lifesync_probe_select_all on public._lifesync_probe
  for select using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant select on all sequences in schema public to anon, authenticated;

commit;

-- Post-run recommendation:
-- 1) npm run verify:supabase
-- 2) npm run preflight:strict
