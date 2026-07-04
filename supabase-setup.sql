-- ============================================================
--  Pie Hangout Scheduler — Supabase setup
--  Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- ---------- 1. Tables ----------

create table if not exists public.availability (
  id    bigint generated always as identity primary key,
  name  text not null,
  date  date not null,
  slot  text not null check (slot in ('afternoon', 'evening')),
  -- one person can only be free once per date+slot
  unique (name, date, slot)
);

create table if not exists public.hangout (
  id    bigint generated always as identity primary key,
  date  date not null,
  slot  text not null check (slot in ('afternoon', 'evening')),
  title text not null default 'Pie baking'
);

-- ---------- 2. Row Level Security ----------
-- RLS is ON by default and blocks EVERYTHING until you add policies.
-- This app has no logins, so we allow anyone with the anon key to read
-- and write both tables. (Fine for a trusted friend group; do not reuse
-- this pattern for anything sensitive.)

alter table public.availability enable row level security;
alter table public.hangout enable row level security;

-- availability: anyone can do anything
drop policy if exists "anon can read availability"  on public.availability;
drop policy if exists "anon can write availability" on public.availability;
create policy "anon can read availability"
  on public.availability for select
  using (true);
create policy "anon can write availability"
  on public.availability for all
  using (true) with check (true);

-- hangout: anyone can do anything
drop policy if exists "anon can read hangout"  on public.hangout;
drop policy if exists "anon can write hangout" on public.hangout;
create policy "anon can read hangout"
  on public.hangout for select
  using (true);
create policy "anon can write hangout"
  on public.hangout for all
  using (true) with check (true);

-- ---------- 3. Realtime ----------
-- Let the app receive live updates when rows change.
alter publication supabase_realtime add table public.availability;
alter publication supabase_realtime add table public.hangout;

-- Done! You can now plug your Project URL + anon key into the app.
