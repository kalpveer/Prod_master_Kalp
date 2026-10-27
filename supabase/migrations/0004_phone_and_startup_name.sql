-- Productica: phone on the account (not used for sign-in) + startup name on idea reports
-- Safe to run more than once. Apply in the Supabase SQL editor after 0003.

alter table public.profiles
  add column if not exists phone text;

update public.profiles
set phone = null
where phone is not null and btrim(phone) = '';

alter table public.profiles
  drop constraint if exists profiles_phone_format;

alter table public.profiles
  add constraint profiles_phone_format
  check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  phone text;
begin
  uname := nullif(lower(btrim(coalesce(new.raw_user_meta_data->>'username', ''))), '');
  phone := nullif(btrim(coalesce(new.raw_user_meta_data->>'phone', '')), '');
  insert into public.profiles (id, email, username, phone)
  values (new.id, new.email, uname, phone)
  on conflict (id) do update
    set email = excluded.email,
        username = coalesce(public.profiles.username, excluded.username),
        phone = coalesce(public.profiles.phone, excluded.phone);
  perform public.ensure_account_quotas(new.id);
  return new;
end;
$$;

-- Accounts created before this migration still have the number on the auth user.
update public.profiles p
set phone = nullif(btrim(u.raw_user_meta_data->>'phone'), '')
from auth.users u
where p.id = u.id
  and p.phone is null
  and coalesce(u.raw_user_meta_data->>'phone', '') ~ '^\+[1-9][0-9]{7,14}$';

alter table public.idea_reports
  add column if not exists startup_name text;

update public.idea_reports
set startup_name = left(btrim(coalesce(nullif(title, ''), left(idea, 80))), 80)
where startup_name is null or btrim(startup_name) = '';

update public.idea_reports
set startup_name = 'Untitled startup'
where startup_name is null or btrim(startup_name) = '';

alter table public.idea_reports
  alter column startup_name set not null;
