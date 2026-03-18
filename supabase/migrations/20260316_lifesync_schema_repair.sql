-- LifeSync schema repair (tables, columns, RLS)
-- Run in Supabase SQL editor

begin;

-- Safety guard for manual runs:
-- run this in the same SQL editor tab before executing the migration body:
-- select set_config('lifesync.allow_destructive_reset', 'true', false);
-- Optional production guard inputs (same SQL tab):
-- select set_config('lifesync.project_ref', 'your-project-ref', false);
-- select set_config('lifesync.production_project_refs', 'prod-ref-1,prod-ref-2', false);
-- If current project_ref matches production refs, require:
-- select set_config('lifesync.allow_prod_destructive_reset', 'true', false);
do $$
begin
  if coalesce(current_setting('lifesync.allow_destructive_reset', true), 'false') <> 'true' then
    raise exception using
      message = 'Destructive reset blocked by guard',
      hint = 'Run: select set_config(''lifesync.allow_destructive_reset'', ''true'', false); then re-run in the same SQL tab.';
  end if;
end
$$;

do $$
declare
  current_project_ref text := nullif(
    coalesce(
      current_setting('app.settings.project_ref', true),
      current_setting('lifesync.project_ref', true)
    ),
    ''
  );
  production_project_refs text[] := coalesce(
    string_to_array(replace(coalesce(current_setting('lifesync.production_project_refs', true), ''), ' ', ''), ','),
    array[]::text[]
  );
  allow_prod_reset boolean := coalesce(current_setting('lifesync.allow_prod_destructive_reset', true), 'false') = 'true';
begin
  if current_project_ref is not null
     and cardinality(production_project_refs) > 0
     and current_project_ref = any(production_project_refs)
     and not allow_prod_reset then
    raise exception using
      message = 'Production destructive reset blocked by guard',
      hint = 'Project ref matched lifesync.production_project_refs. Set lifesync.allow_prod_destructive_reset=true only if you intentionally want to run this on production.';
  end if;
end
$$;

create extension if not exists "pgcrypto";

-- =====================================================
-- Full reset: drop existing objects first
-- =====================================================

drop view if exists public.todos cascade;
drop view if exists public.water_logs cascade;
drop view if exists public.sleep_logs cascade;
drop view if exists public.study_logs cascade;
drop view if exists public.activity_logs cascade;
drop view if exists public.meditation_logs cascade;
drop view if exists public.mindfulness_logs cascade;
drop view if exists public.social_logs cascade;
drop view if exists public.pomodoro_logs cascade;

drop table if exists public._lifesync_probe cascade;
drop table if exists public.habit_logs cascade;
drop table if exists public.habits cascade;
drop table if exists public.goals cascade;
drop table if exists public.gratitude_entries cascade;
drop table if exists public.tasks cascade;
drop table if exists public.todos cascade;
drop table if exists public.water_entries cascade;
drop table if exists public.water_logs cascade;
drop table if exists public.sleep_entries cascade;
drop table if exists public.sleep_logs cascade;
drop table if exists public.study_sessions cascade;
drop table if exists public.study_logs cascade;
drop table if exists public.meditation_sessions cascade;
drop table if exists public.meditation_logs cascade;
drop table if exists public.mindfulness_sessions cascade;
drop table if exists public.mindfulness_logs cascade;
drop table if exists public.mood_entries cascade;
drop table if exists public.journal_entries cascade;
drop table if exists public.activities cascade;
drop table if exists public.activity_logs cascade;
drop table if exists public.social_interactions cascade;
drop table if exists public.social_logs cascade;
drop table if exists public.pomodoro_sessions cascade;
drop table if exists public.pomodoro_logs cascade;
drop table if exists public.reflection_entries cascade;

-- =====================================================
-- Core tables
-- =====================================================

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  priority text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  text text,
  completed boolean not null default false,
  priority text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  goal integer not null default 8,
  log_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  glasses integer not null default 0,
  goal integer not null default 8,
  log_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bedtime text,
  wake_time text,
  duration numeric,
  duration_h numeric,
  log_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bedtime text,
  wake_time text,
  duration numeric,
  duration_h numeric,
  log_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  duration integer not null,
  duration_minutes integer,
  focus_rating integer not null default 3,
  notes text,
  study_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_name text not null,
  emoji text not null default '⭐',
  streak integer not null default 0,
  completed_today boolean not null default false,
  success_rate numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text,
  mood_label text,
  mood_score numeric,
  notes text,
  note text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration integer not null,
  duration_minutes integer,
  session_type text not null default 'focus',
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration integer not null,
  sound_id text,
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.mindfulness_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration integer not null,
  sound_id text,
  phase_cycles integer not null default 0,
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null default '',
  body text,
  mood_emoji text,
  word_count integer not null default 0,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  activity_type text,
  duration integer not null,
  intensity text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.social_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text,
  interaction_type text,
  category text,
  rating text,
  duration integer,
  notes text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text,
  target_date date,
  progress integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.gratitude_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  emoji text,
  category text,
  created_at timestamptz not null default now()
);

-- =====================================================
-- Indexes
-- =====================================================

create index if not exists idx_tasks_user_id_created_at on public.tasks(user_id, created_at desc);
create index if not exists idx_todos_user_id_created_at on public.todos(user_id, created_at desc);
create index if not exists idx_water_entries_user_id_created_at on public.water_entries(user_id, created_at desc);
create index if not exists idx_water_logs_user_id_created_at on public.water_logs(user_id, created_at desc);
create index if not exists idx_sleep_entries_user_id_created_at on public.sleep_entries(user_id, created_at desc);
create index if not exists idx_sleep_logs_user_id_created_at on public.sleep_logs(user_id, created_at desc);
create index if not exists idx_study_sessions_user_id_created_at on public.study_sessions(user_id, created_at desc);
create index if not exists idx_habits_user_id_created_at on public.habits(user_id, created_at desc);
create index if not exists idx_habit_logs_user_id_created_at on public.habit_logs(user_id, created_at desc);
create index if not exists idx_mood_entries_user_id_created_at on public.mood_entries(user_id, created_at desc);
create index if not exists idx_pomodoro_sessions_user_id_created_at on public.pomodoro_sessions(user_id, created_at desc);
create index if not exists idx_meditation_sessions_user_id_created_at on public.meditation_sessions(user_id, created_at desc);
create index if not exists idx_mindfulness_sessions_user_id_created_at on public.mindfulness_sessions(user_id, created_at desc);
create index if not exists idx_journal_entries_user_id_created_at on public.journal_entries(user_id, created_at desc);
create index if not exists idx_activities_user_id_created_at on public.activities(user_id, created_at desc);
create index if not exists idx_social_interactions_user_id_created_at on public.social_interactions(user_id, created_at desc);
create index if not exists idx_goals_user_id_created_at on public.goals(user_id, created_at desc);
create index if not exists idx_gratitude_entries_user_id_created_at on public.gratitude_entries(user_id, created_at desc);

-- =====================================================
-- RLS + policies
-- =====================================================

do $$
declare
  t text;
  tables text[] := array[
    'tasks','todos','water_entries','water_logs','sleep_entries','sleep_logs',
    'study_sessions','habits','habit_logs','mood_entries','pomodoro_sessions',
    'meditation_sessions','mindfulness_sessions','journal_entries','activities','social_interactions',
    'goals','gratitude_entries'
  ];
begin
  foreach t in array tables
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "%s_select_own" on public.%I', t, t);
    execute format('drop policy if exists "%s_insert_own" on public.%I', t, t);
    execute format('drop policy if exists "%s_update_own" on public.%I', t, t);
    execute format('drop policy if exists "%s_delete_own" on public.%I', t, t);

    execute format('create policy "%s_select_own" on public.%I for select using (auth.uid() = user_id)', t, t);
    execute format('create policy "%s_insert_own" on public.%I for insert with check (auth.uid() = user_id)', t, t);
    execute format('create policy "%s_update_own" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t, t);
    execute format('create policy "%s_delete_own" on public.%I for delete using (auth.uid() = user_id)', t, t);
  end loop;
end$$;

commit;
