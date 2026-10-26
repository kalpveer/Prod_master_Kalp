-- Productica: account quotas + /grants module
-- Safe to run more than once. Apply in the Supabase SQL editor after 0001.

-- ───────────────────────── account quotas ─────────────────────────
-- One row per user per module. `used` only ever goes up, so deleting a
-- report or a grant run does not restore a free slot.
create table if not exists public.account_quotas (
  user_id    uuid not null references auth.users (id) on delete cascade,
  module     text not null check (module in ('idea', 'grants')),
  used       integer not null default 0 check (used >= 0),
  free_limit integer not null default 3 check (free_limit > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, module)
);

create index if not exists account_quotas_module_idx
  on public.account_quotas (module, used);

alter table public.account_quotas enable row level security;

drop policy if exists "account_quotas_select_own" on public.account_quotas;
create policy "account_quotas_select_own" on public.account_quotas
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.ensure_account_quotas(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.account_quotas (user_id, module, used, free_limit)
  values
    (p_user_id, 'idea', 0, 3),
    (p_user_id, 'grants', 0, 25)
  on conflict (user_id, module) do nothing;
end;
$$;

revoke all on function public.ensure_account_quotas(uuid) from public, anon, authenticated;
grant execute on function public.ensure_account_quotas(uuid) to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  perform public.ensure_account_quotas(new.id);
  return new;
end;
$$;

insert into public.account_quotas (user_id, module, used, free_limit)
select u.id, m.module, 0, m.free_limit
from auth.users u
cross join (values ('idea', 3), ('grants', 25)) as m(module, free_limit)
on conflict (user_id, module) do nothing;

-- Existing finished idea reports become the floor for the idea quota.
update public.account_quotas q
set used = greatest(q.used, coalesce(s.done, 0)),
    updated_at = now()
from (
  select user_id, count(*)::int as done
  from public.idea_reports
  where status = 'done'
  group by user_id
) s
where q.user_id = s.user_id and q.module = 'idea';

-- ───────────────────────── idea quota enforcement ─────────────────────────
-- Blocks a new run when the lifetime used count plus an in-flight run is already at the cap.
create or replace function public.enforce_idea_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used int;
  v_cap int;
  v_running int;
begin
  if tg_op <> 'INSERT' then
    return new;
  end if;
  if new.status not in ('running', 'done') then
    return new;
  end if;

  perform public.ensure_account_quotas(new.user_id);

  select used, free_limit into v_used, v_cap
  from public.account_quotas
  where user_id = new.user_id and module = 'idea'
  for update;

  select count(*) into v_running
  from public.idea_reports
  where user_id = new.user_id and status = 'running';

  if coalesce(v_used, 0) + coalesce(v_running, 0) >= coalesce(v_cap, 3) then
    raise exception 'IDEA_QUOTA_EXCEEDED'
      using errcode = 'P0001',
            hint = 'This account has used its free idea validations.';
  end if;

  return new;
end;
$$;

drop trigger if exists idea_reports_enforce_quota on public.idea_reports;
create trigger idea_reports_enforce_quota
  before insert on public.idea_reports
  for each row execute function public.enforce_idea_quota();

-- Charge the quota only when a run finishes successfully. Never decrement.
create or replace function public.charge_idea_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status is distinct from 'done') then
    perform public.ensure_account_quotas(new.user_id);
    update public.account_quotas
    set used = used + 1, updated_at = now()
    where user_id = new.user_id and module = 'idea';
  end if;
  return new;
end;
$$;

drop trigger if exists idea_reports_charge_quota on public.idea_reports;
create trigger idea_reports_charge_quota
  after insert or update of status on public.idea_reports
  for each row execute function public.charge_idea_quota();

-- ───────────────────────── grant schemes (catalog) ─────────────────────────
create table if not exists public.grant_schemes (
  id          text primary key,
  name        text not null,
  provider    text not null,
  summary     text not null,
  href        text not null,
  kind        text not null check (kind in ('grant', 'step')),
  india_only  boolean not null default true,
  states      text[],
  sectors     text[],
  applicants  text[],
  stages      text[],
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.grant_schemes enable row level security;

drop policy if exists "grant_schemes_select_active" on public.grant_schemes;
create policy "grant_schemes_select_active" on public.grant_schemes
  for select to authenticated using (active = true);

insert into public.grant_schemes
  (id, name, provider, summary, href, kind, india_only, states, sectors, applicants, stages, sort_order)
values
  (
    'sisfs',
    'Startup India Seed Fund Scheme',
    'Startup India / DPIIT',
    'Seed support for proof of concept, prototype, and early trials. Applications usually go through an approved incubator.',
    'https://seedfund.startupindia.gov.in/',
    'grant', true, null, null, array['startup'],
    array['Researching & validating', 'Building a prototype', 'Early users', 'Generating revenue'],
    10
  ),
  (
    'prayas',
    'NIDHI-PRAYAS',
    'Department of Science & Technology',
    'Prototype support for converting a concept into a working version, typically through a PRAYAS centre.',
    'https://www.nstedb.com/',
    'grant', true, null,
    array['AI / deep tech', 'Hardware', 'Climate / energy', 'Health / biotech', 'Agriculture'],
    null,
    array['Just an idea', 'Researching & validating', 'Building a prototype'],
    20
  ),
  (
    'big',
    'Biotechnology Ignition Grant',
    'BIRAC',
    'Early grant for biotech and health ideas. Individuals and young companies can both be eligible.',
    'https://birac.nic.in/big.php',
    'grant', true, null, array['Health / biotech'], null,
    array['Just an idea', 'Researching & validating', 'Building a prototype', 'Early users'],
    30
  ),
  (
    'msme',
    'MSME Innovative',
    'Ministry of MSME',
    'Incubation and design support for ideas that can become a small business, including a working prototype.',
    'https://innovative.msme.gov.in/',
    'grant', true, null, null, array['startup', 'msme', 'unregistered'],
    array['Researching & validating', 'Building a prototype', 'Early users', 'Generating revenue'],
    40
  ),
  (
    'aim',
    'Atal Innovation Mission',
    'NITI Aayog',
    'Incubator-led support for early ventures. The right programme depends on the incubator you apply with.',
    'https://aim.gov.in/',
    'grant', true, null, null, null,
    array['Just an idea', 'Researching & validating', 'Building a prototype', 'Early users'],
    50
  ),
  (
    'meity',
    'MeitY Startup Hub',
    'Ministry of Electronics & IT',
    'Programmes for software, AI, and other digital startups, often routed through a MeitY incubator.',
    'https://msh.meity.gov.in/',
    'grant', true, null, array['Software', 'AI / deep tech', 'Education'], null,
    array['Researching & validating', 'Building a prototype', 'Early users', 'Generating revenue'],
    60
  ),
  (
    'ssip',
    'Student Startup and Innovation Policy',
    'Government of Gujarat',
    'Support for student and campus innovators in Gujarat, from an early idea through a prototype.',
    'https://ssip.gujarat.gov.in/',
    'grant', false, array['Gujarat'], null, array['student', 'researcher', 'unregistered'],
    array['Just an idea', 'Researching & validating', 'Building a prototype', 'Early users'],
    70
  ),
  (
    'dpiit',
    'DPIIT startup recognition',
    'Startup India',
    'Not a cheque. Recognition is what several Indian seed grants ask for before you can apply.',
    'https://www.startupindia.gov.in/',
    'step', true, null, null, array['unregistered', 'startup'],
    null,
    80
  )
on conflict (id) do update set
  name = excluded.name,
  provider = excluded.provider,
  summary = excluded.summary,
  href = excluded.href,
  kind = excluded.kind,
  india_only = excluded.india_only,
  states = excluded.states,
  sectors = excluded.sectors,
  applicants = excluded.applicants,
  stages = excluded.stages,
  sort_order = excluded.sort_order,
  updated_at = now();

-- ───────────────────────── grant runs (history) ─────────────────────────
create table if not exists public.grant_runs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  idea_report_id uuid references public.idea_reports (id) on delete set null,
  venture        text not null,
  stage          text not null,
  sector         text not null,
  state          text not null,
  applicant      text not null,
  matches        jsonb not null default '[]'::jsonb,
  ready_count    integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists grant_runs_user_created_idx
  on public.grant_runs (user_id, created_at desc);

create index if not exists grant_runs_idea_idx
  on public.grant_runs (idea_report_id);

alter table public.grant_runs enable row level security;

drop policy if exists "grant_runs_select_own" on public.grant_runs;
create policy "grant_runs_select_own" on public.grant_runs
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "grant_runs_delete_own" on public.grant_runs;
create policy "grant_runs_delete_own" on public.grant_runs
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.charge_grant_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_account_quotas(new.user_id);
  update public.account_quotas
  set used = used + 1, updated_at = now()
  where user_id = new.user_id and module = 'grants';
  return new;
end;
$$;

drop trigger if exists grant_runs_charge_quota on public.grant_runs;
create trigger grant_runs_charge_quota
  after insert on public.grant_runs
  for each row execute function public.charge_grant_quota();
