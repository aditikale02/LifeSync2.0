-- LifeSync single-pass schema repair (safe for mixed legacy states)
-- Run this whole script in Supabase SQL Editor for project iiaqcaugjffqhjlecwtz

create extension if not exists "pgcrypto";

-- Helper: execute SQL and continue on error
create or replace function public._lifesync_exec(sql_text text)
returns void
language plpgsql
as $$
begin
  execute sql_text;
exception
  when others then
    raise notice '[LifeSync SQL skipped] % | %', sql_text, SQLERRM;
end;
$$;

-- -----------------------------
-- Create required tables
-- -----------------------------
select public._lifesync_exec($sql$
create table if not exists public._lifesync_probe (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  completed boolean not null default false,
  priority text not null default 'medium',
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  text text,
  completed boolean not null default false,
  priority text not null default 'medium',
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  amount numeric not null default 0,
  goal integer not null default 8,
  log_date date not null default current_date,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  glasses integer not null default 0,
  goal integer not null default 8,
  log_date date not null default current_date,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  bedtime text,
  wake_time text,
  duration numeric,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  bedtime text,
  wake_time text,
  duration_h numeric,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  subject text,
  duration integer,
  focus_rating integer not null default 3,
  notes text,
  study_date date,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  habit_name text,
  streak integer not null default 0,
  completed_today boolean not null default false,
  success_rate numeric not null default 0,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  habit_id uuid,
  completed_on date not null default current_date,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  mood text,
  mood_score numeric,
  notes text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  duration integer,
  session_type text not null default 'focus',
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  duration integer,
  sound_id text,
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.mindfulness_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  duration integer,
  sound_id text,
  phase_cycles integer not null default 0,
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  content text,
  mood_emoji text,
  word_count integer not null default 0,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text,
  duration integer,
  intensity text,
  created_at timestamptz not null default now()
)
$sql$);

select public._lifesync_exec($sql$
create table if not exists public.social_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text,
  category text,
  rating text,
  duration integer,
  notes text,
  created_at timestamptz not null default now()
)
$sql$);

-- -----------------------------
-- Add missing columns to legacy tables
-- -----------------------------
select public._lifesync_exec('alter table if exists public.todos add column if not exists title text');
select public._lifesync_exec('alter table if exists public.sleep_logs add column if not exists duration_h numeric');
select public._lifesync_exec('alter table if exists public.study_sessions add column if not exists subject text');
select public._lifesync_exec('alter table if exists public.habits add column if not exists habit_name text');
select public._lifesync_exec('alter table if exists public.mood_entries add column if not exists mood_score numeric');
select public._lifesync_exec('alter table if exists public.activities add column if not exists duration integer');

-- Ensure user_id + created_at exist across all target tables
DO $$
DECLARE
  t text;
  tables text[] := array[
    '_lifesync_probe','tasks','todos','water_entries','water_logs','sleep_entries','sleep_logs',
    'study_sessions','habits','habit_logs','mood_entries','pomodoro_sessions',
    'meditation_sessions','mindfulness_sessions','journal_entries','activities','social_interactions'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF t <> '_lifesync_probe' THEN
      PERFORM public._lifesync_exec(format('alter table if exists public.%I add column if not exists user_id uuid', t));
    END IF;
    PERFORM public._lifesync_exec(format('alter table if exists public.%I add column if not exists created_at timestamptz not null default now()', t));
  END LOOP;
END$$;

-- -----------------------------
-- Indexes
-- -----------------------------
select public._lifesync_exec('create index if not exists idx_tasks_user_created on public.tasks(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_todos_user_created on public.todos(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_water_entries_user_created on public.water_entries(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_water_logs_user_created on public.water_logs(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_sleep_entries_user_created on public.sleep_entries(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_sleep_logs_user_created on public.sleep_logs(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_study_sessions_user_created on public.study_sessions(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_habits_user_created on public.habits(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_habit_logs_user_created on public.habit_logs(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_mood_entries_user_created on public.mood_entries(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_pomodoro_user_created on public.pomodoro_sessions(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_meditation_user_created on public.meditation_sessions(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_mindfulness_user_created on public.mindfulness_sessions(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_journal_entries_user_created on public.journal_entries(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_activities_user_created on public.activities(user_id, created_at desc)');
select public._lifesync_exec('create index if not exists idx_social_user_created on public.social_interactions(user_id, created_at desc)');

-- -----------------------------
-- Grants + RLS + permissive policies (for anon/authenticated API access)
-- -----------------------------
DO $$
DECLARE
  t text;
  tables text[] := array[
    'tasks','todos','water_entries','water_logs','sleep_entries','sleep_logs',
    'study_sessions','habits','habit_logs','mood_entries','pomodoro_sessions',
    'meditation_sessions','mindfulness_sessions','journal_entries','activities','social_interactions'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    PERFORM public._lifesync_exec(format('grant select, insert, update, delete on table public.%I to anon, authenticated', t));
    PERFORM public._lifesync_exec(format('alter table public.%I enable row level security', t));

    PERFORM public._lifesync_exec(format('drop policy if exists %I on public.%I', t || '_select_own', t));
    PERFORM public._lifesync_exec(format('drop policy if exists %I on public.%I', t || '_insert_own', t));
    PERFORM public._lifesync_exec(format('drop policy if exists %I on public.%I', t || '_update_own', t));
    PERFORM public._lifesync_exec(format('drop policy if exists %I on public.%I', t || '_delete_own', t));

    PERFORM public._lifesync_exec(format('create policy %I on public.%I for select using (true)', t || '_select_own', t));
    PERFORM public._lifesync_exec(format('create policy %I on public.%I for insert with check (true)', t || '_insert_own', t));
    PERFORM public._lifesync_exec(format('create policy %I on public.%I for update using (true) with check (true)', t || '_update_own', t));
    PERFORM public._lifesync_exec(format('create policy %I on public.%I for delete using (true)', t || '_delete_own', t));
  END LOOP;
END$$;

-- Remove helper
drop function if exists public._lifesync_exec(text);
