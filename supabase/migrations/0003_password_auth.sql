-- Productica: username + password accounts
-- Safe to run more than once. Apply in the Supabase SQL editor after 0002.
--
-- Dashboard (required, or confirmation / reset emails still open localhost):
--   Authentication → URL Configuration
--     Site URL = your live Vercel URL (not http://localhost:5173)
--     Redirect URLs include:
--       http://localhost:5173/**
--       https://*.vercel.app/**
--       https://productica.in/**
--   Authentication → Providers → Email
--     Enable Email
--     Confirm email = OFF  (password sign-in, no magic link)
--     Users can sign up = ON

alter table public.profiles
  add column if not exists username text;

update public.profiles
set username = lower(trim(username))
where username is not null;

alter table public.profiles
  drop constraint if exists profiles_username_format;

alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[a-z][a-z0-9_]{2,19}$');

drop index if exists public.profiles_username_lower_idx;
create unique index profiles_username_lower_idx
  on public.profiles (username)
  where username is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
begin
  uname := nullif(lower(trim(both from coalesce(new.raw_user_meta_data->>'username', ''))), '');
  insert into public.profiles (id, email, username)
  values (new.id, new.email, uname)
  on conflict (id) do update
    set email = excluded.email,
        username = coalesce(public.profiles.username, excluded.username);
  perform public.ensure_account_quotas(new.id);
  return new;
end;
$$;

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where username = lower(trim(p_username))
  );
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
