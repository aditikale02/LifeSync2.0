-- Minimal probe for project/database write verification

select current_database() as db_name, now() as checked_at;

create table if not exists public._lifesync_probe (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

insert into public._lifesync_probe default values;

select count(*) as probe_rows from public._lifesync_probe;
