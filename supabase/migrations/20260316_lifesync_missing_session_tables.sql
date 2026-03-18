-- Repair migration: create missing session tables found by verify-supabase
-- Date: 2026-03-16

create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration integer not null,
  session_type text not null default 'focus',
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

create index if not exists idx_pomodoro_sessions_user_id_created_at
  on public.pomodoro_sessions(user_id, created_at desc);

create index if not exists idx_mindfulness_sessions_user_id_created_at
  on public.mindfulness_sessions(user_id, created_at desc);

alter table public.pomodoro_sessions enable row level security;
alter table public.mindfulness_sessions enable row level security;

drop policy if exists pomodoro_sessions_select_own on public.pomodoro_sessions;
drop policy if exists pomodoro_sessions_insert_own on public.pomodoro_sessions;
drop policy if exists pomodoro_sessions_update_own on public.pomodoro_sessions;
drop policy if exists pomodoro_sessions_delete_own on public.pomodoro_sessions;

create policy pomodoro_sessions_select_own on public.pomodoro_sessions
  for select using (auth.uid() = user_id);
create policy pomodoro_sessions_insert_own on public.pomodoro_sessions
  for insert with check (auth.uid() = user_id);
create policy pomodoro_sessions_update_own on public.pomodoro_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy pomodoro_sessions_delete_own on public.pomodoro_sessions
  for delete using (auth.uid() = user_id);

drop policy if exists mindfulness_sessions_select_own on public.mindfulness_sessions;
drop policy if exists mindfulness_sessions_insert_own on public.mindfulness_sessions;
drop policy if exists mindfulness_sessions_update_own on public.mindfulness_sessions;
drop policy if exists mindfulness_sessions_delete_own on public.mindfulness_sessions;

create policy mindfulness_sessions_select_own on public.mindfulness_sessions
  for select using (auth.uid() = user_id);
create policy mindfulness_sessions_insert_own on public.mindfulness_sessions
  for insert with check (auth.uid() = user_id);
create policy mindfulness_sessions_update_own on public.mindfulness_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy mindfulness_sessions_delete_own on public.mindfulness_sessions
  for delete using (auth.uid() = user_id);
