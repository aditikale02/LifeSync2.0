-- LifeSync schema repair (hardened for legacy/mismatched schemas)
-- Run in Supabase SQL editor on project: iiaqcaugjffqhjlecwtz

create extension if not exists "pgcrypto";

-- 1) Create missing tables (without risky legacy assumptions)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  completed boolean not null default false,
  priority text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount numeric not null default 0,
  goal integer not null default 8,
  log_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  bedtime text,
  wake_time text,
  duration numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  duration integer not null,
  session_type text not null default 'focus',
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  duration integer not null,
  sound_id text,
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.mindfulness_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  duration integer not null,
  sound_id text,
  phase_cycles integer not null default 0,
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.social_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text,
  category text,
  rating text,
  duration integer,
  notes text,
  created_at timestamptz not null default now()
);

-- 2) Add missing columns on existing tables (no FK in ALTER to avoid legacy-type failures)
alter table if exists public.todos add column if not exists title text;
alter table if exists public.todos add column if not exists user_id uuid;
alter table if exists public.todos add column if not exists completed boolean not null default false;
alter table if exists public.todos add column if not exists priority text not null default 'medium';
alter table if exists public.todos add column if not exists created_at timestamptz not null default now();

alter table if exists public.water_logs add column if not exists user_id uuid;
alter table if exists public.water_logs add column if not exists glasses integer not null default 0;
alter table if exists public.water_logs add column if not exists goal integer not null default 8;
alter table if exists public.water_logs add column if not exists log_date date not null default current_date;
alter table if exists public.water_logs add column if not exists created_at timestamptz not null default now();

alter table if exists public.sleep_logs add column if not exists user_id uuid;
alter table if exists public.sleep_logs add column if not exists bedtime text;
alter table if exists public.sleep_logs add column if not exists wake_time text;
alter table if exists public.sleep_logs add column if not exists duration_h numeric;
alter table if exists public.sleep_logs add column if not exists created_at timestamptz not null default now();

alter table if exists public.study_sessions add column if not exists user_id uuid;
alter table if exists public.study_sessions add column if not exists subject text;
alter table if exists public.study_sessions add column if not exists duration integer;
alter table if exists public.study_sessions add column if not exists focus_rating integer not null default 3;
alter table if exists public.study_sessions add column if not exists notes text;
alter table if exists public.study_sessions add column if not exists study_date date;
alter table if exists public.study_sessions add column if not exists created_at timestamptz not null default now();

alter table if exists public.habits add column if not exists user_id uuid;
alter table if exists public.habits add column if not exists habit_name text;
alter table if exists public.habits add column if not exists streak integer not null default 0;
alter table if exists public.habits add column if not exists completed_today boolean not null default false;
alter table if exists public.habits add column if not exists success_rate numeric not null default 0;
alter table if exists public.habits add column if not exists created_at timestamptz not null default now();

alter table if exists public.habit_logs add column if not exists user_id uuid;
alter table if exists public.habit_logs add column if not exists habit_id uuid;
alter table if exists public.habit_logs add column if not exists completed_on date not null default current_date;
alter table if exists public.habit_logs add column if not exists created_at timestamptz not null default now();

alter table if exists public.mood_entries add column if not exists user_id uuid;
alter table if exists public.mood_entries add column if not exists mood text;
alter table if exists public.mood_entries add column if not exists mood_score numeric;
alter table if exists public.mood_entries add column if not exists notes text;
alter table if exists public.mood_entries add column if not exists entry_date date not null default current_date;
alter table if exists public.mood_entries add column if not exists created_at timestamptz not null default now();

alter table if exists public.activities add column if not exists user_id uuid;
alter table if exists public.activities add column if not exists type text;
alter table if exists public.activities add column if not exists duration integer;
alter table if exists public.activities add column if not exists intensity text;
alter table if exists public.activities add column if not exists created_at timestamptz not null default now();

-- 3) Helpful indexes
create index if not exists idx_tasks_user_created on public.tasks(user_id, created_at desc);
create index if not exists idx_todos_user_created on public.todos(user_id, created_at desc);
create index if not exists idx_water_entries_user_created on public.water_entries(user_id, created_at desc);
create index if not exists idx_water_logs_user_created on public.water_logs(user_id, created_at desc);
create index if not exists idx_sleep_entries_user_created on public.sleep_entries(user_id, created_at desc);
create index if not exists idx_sleep_logs_user_created on public.sleep_logs(user_id, created_at desc);
create index if not exists idx_study_sessions_user_created on public.study_sessions(user_id, created_at desc);
create index if not exists idx_habits_user_created on public.habits(user_id, created_at desc);
create index if not exists idx_habit_logs_user_created on public.habit_logs(user_id, created_at desc);
create index if not exists idx_mood_entries_user_created on public.mood_entries(user_id, created_at desc);
create index if not exists idx_pomodoro_user_created on public.pomodoro_sessions(user_id, created_at desc);
create index if not exists idx_meditation_user_created on public.meditation_sessions(user_id, created_at desc);
create index if not exists idx_mindfulness_user_created on public.mindfulness_sessions(user_id, created_at desc);
create index if not exists idx_activities_user_created on public.activities(user_id, created_at desc);
create index if not exists idx_social_user_created on public.social_interactions(user_id, created_at desc);

-- 4) RLS policies
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
    EXECUTE format('alter table public.%I enable row level security', t);

    EXECUTE format('drop policy if exists %L on public.%I', t || '_select_own', t);
    EXECUTE format('drop policy if exists %L on public.%I', t || '_insert_own', t);
    EXECUTE format('drop policy if exists %L on public.%I', t || '_update_own', t);
    EXECUTE format('drop policy if exists %L on public.%I', t || '_delete_own', t);

    EXECUTE format('create policy %I on public.%I for select using (auth.uid() = user_id)', t || '_select_own', t);
    EXECUTE format('create policy %I on public.%I for insert with check (auth.uid() = user_id)', t || '_insert_own', t);
    EXECUTE format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || '_update_own', t);
    EXECUTE format('create policy %I on public.%I for delete using (auth.uid() = user_id)', t || '_delete_own', t);
  END LOOP;
END$$;
