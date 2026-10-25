-- Productica: accounts + /idea module
-- Run once in the Supabase SQL editor (or `supabase db push`).
--
-- Conventions for future modules (see docs/MODULES.md):
--   * one table per module, prefixed with the module name (idea_reports, ...)
--   * user_id uuid references auth.users, RLS on, users may only SELECT/DELETE their own rows
--   * rows are written by the server (service role) only, so there are no client INSERT/UPDATE policies
--   * private storage bucket per module, files under "<user_id>/..."

-- ───────────────────────── profiles ─────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ───────────────────────── /idea reports ─────────────────────────
create table if not exists public.idea_reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  status       text not null default 'running' check (status in ('running', 'done', 'failed')),

  -- the four questions
  idea         text not null,
  audience     text not null,
  different    text not null,
  stage        text not null,

  -- optional pitch deck (private storage object, see bucket below)
  deck_path    text,
  deck_name    text,

  -- denormalised from the report so the history list never needs the markdown
  title        text,
  verdict      text,
  iq           numeric(3, 1),

  markdown     text,
  error        text,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idea_reports_user_created_idx
  on public.idea_reports (user_id, created_at desc);

alter table public.idea_reports enable row level security;

drop policy if exists "idea_reports_select_own" on public.idea_reports;
create policy "idea_reports_select_own" on public.idea_reports
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "idea_reports_delete_own" on public.idea_reports;
create policy "idea_reports_delete_own" on public.idea_reports
  for delete to authenticated using (auth.uid() = user_id);

-- ───────────────────────── pitch deck storage ─────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pitch-decks', 'pitch-decks', false, 10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "pitch_decks_insert_own" on storage.objects;
create policy "pitch_decks_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pitch-decks' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "pitch_decks_select_own" on storage.objects;
create policy "pitch_decks_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'pitch-decks' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "pitch_decks_delete_own" on storage.objects;
create policy "pitch_decks_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pitch-decks' and (storage.foldername(name))[1] = auth.uid()::text);
