-- Brosia's Library: cloud sync table. Run once in Supabase: SQL Editor -> New query -> Run.
-- Safe to re-run.

-- Remove two tables from an earlier, discarded draft (they held no data).
drop table if exists public.books cascade;
drop table if exists public.goals cascade;

create table if not exists public.library_records (
  user_id           uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  record_key        text        not null check (char_length(record_key) between 1 and 300),
  data              jsonb,
  deleted           boolean     not null default false,
  client_updated_at timestamptz,
  device_id         text        check (device_id is null or char_length(device_id) <= 80),
  updated_at        timestamptz not null default clock_timestamp(),
  primary key (user_id, record_key),
  constraint library_records_size check (data is null or octet_length(data::text) <= 262144)
);

create index if not exists library_records_user_updated on public.library_records (user_id, updated_at);

-- The server, not the device, decides updated_at (devices pull by this cursor).
create or replace function public.library_records_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end $$;

drop trigger if exists library_records_touch on public.library_records;
create trigger library_records_touch before insert or update on public.library_records
  for each row execute function public.library_records_touch();

-- Row-level security: a signed-in user can only see and change their own rows.
alter table public.library_records enable row level security;

drop policy if exists "own records" on public.library_records;
create policy "own records" on public.library_records
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.library_records from anon;
grant select, insert, update, delete on public.library_records to authenticated;
