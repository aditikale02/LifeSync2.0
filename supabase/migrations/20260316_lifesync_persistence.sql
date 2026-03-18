-- LifeSync canonical persistence schema
-- Run in Supabase SQL editor or via migration runner.

create extension if not exists "pgcrypto";

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  priority text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  goal integer not null default 8,
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
  content text not null,
  mood_emoji text,
  word_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  duration integer not null,
  focus_rating integer,
  notes text,
  study_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null,
  mood_score numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bedtime time,
  wake_time time,
  duration numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration integer not null,
  session_type text not null default 'focus',
  completed boolean not null default true,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.social_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text,
  category text,
  rating text,
  duration integer,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_name text not null,
  emoji text,
  streak integer not null default 0,
  completed_today boolean not null default false,
  success_rate numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null,
  target_date date,
  progress integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  duration integer not null,
  intensity text,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_tasks_user_id_created_at on public.tasks(user_id, created_at desc);
create index if not exists idx_water_entries_user_id_created_at on public.water_entries(user_id, created_at desc);
create index if not exists idx_meditation_sessions_user_id_created_at on public.meditation_sessions(user_id, created_at desc);
create index if not exists idx_mindfulness_sessions_user_id_created_at on public.mindfulness_sessions(user_id, created_at desc);
create index if not exists idx_journal_entries_user_id_created_at on public.journal_entries(user_id, created_at desc);
create index if not exists idx_study_sessions_user_id_created_at on public.study_sessions(user_id, created_at desc);
create index if not exists idx_mood_entries_user_id_created_at on public.mood_entries(user_id, created_at desc);
create index if not exists idx_sleep_entries_user_id_created_at on public.sleep_entries(user_id, created_at desc);
create index if not exists idx_pomodoro_sessions_user_id_created_at on public.pomodoro_sessions(user_id, created_at desc);
create index if not exists idx_social_interactions_user_id_created_at on public.social_interactions(user_id, created_at desc);
create index if not exists idx_habits_user_id_created_at on public.habits(user_id, created_at desc);
create index if not exists idx_goals_user_id_created_at on public.goals(user_id, created_at desc);
create index if not exists idx_activities_user_id_created_at on public.activities(user_id, created_at desc);

-- Legacy table migration into canonical tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'todos') THEN
    EXECUTE $migrate$
      INSERT INTO public.tasks (id, user_id, title, completed, priority, created_at)
      SELECT id::uuid, user_id::uuid, COALESCE(title, text), COALESCE(completed, false), COALESCE(priority, 'medium'), COALESCE(created_at, now())
      FROM public.todos
      ON CONFLICT (id) DO NOTHING
    $migrate$;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'water_logs') THEN
    EXECUTE $migrate$
      INSERT INTO public.water_entries (id, user_id, amount, goal, created_at)
      SELECT id::uuid, user_id::uuid, COALESCE(amount, glasses, 0), COALESCE(goal, 8), COALESCE(created_at, now())
      FROM public.water_logs
      ON CONFLICT (id) DO NOTHING
    $migrate$;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sleep_logs') THEN
    EXECUTE $migrate$
      INSERT INTO public.sleep_entries (id, user_id, bedtime, wake_time, duration, created_at)
      SELECT id::uuid, user_id::uuid, bedtime::time, wake_time::time, COALESCE(duration, duration_h, 0), COALESCE(created_at, now())
      FROM public.sleep_logs
      ON CONFLICT (id) DO NOTHING
    $migrate$;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_logs') THEN
    EXECUTE $migrate$
      INSERT INTO public.social_interactions (id, user_id, type, category, rating, duration, notes, created_at)
      SELECT id::uuid, user_id::uuid, COALESCE(type, category), category, rating, duration, COALESCE(notes, note), COALESCE(created_at, now())
      FROM public.social_logs
      ON CONFLICT (id) DO NOTHING
    $migrate$;
  END IF;
END $$;

-- Enable RLS and owner-only policies
DO $$
DECLARE table_name text;
BEGIN
  FOR table_name IN
    SELECT unnest(array[
      'tasks','water_entries','meditation_sessions','mindfulness_sessions','journal_entries','study_sessions','mood_entries','sleep_entries','pomodoro_sessions','social_interactions','habits','habit_logs','goals','activities'
    ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I_select_own ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I_insert_own ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I_update_own ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I_delete_own ON public.%I', table_name, table_name);

    EXECUTE format('CREATE POLICY %I_select_own ON public.%I FOR SELECT USING (auth.uid() = user_id)', table_name, table_name);
    EXECUTE format('CREATE POLICY %I_insert_own ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', table_name, table_name);
    EXECUTE format('CREATE POLICY %I_update_own ON public.%I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', table_name, table_name);
    EXECUTE format('CREATE POLICY %I_delete_own ON public.%I FOR DELETE USING (auth.uid() = user_id)', table_name, table_name);
  END LOOP;
END $$;
