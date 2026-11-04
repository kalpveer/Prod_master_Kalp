-- Revenue (only when stage is Generating revenue) + public share links for finished reports.

alter table public.idea_reports
  add column if not exists revenue text,
  add column if not exists share_id text;

create unique index if not exists idea_reports_share_id_uidx
  on public.idea_reports (share_id)
  where share_id is not null;

-- Owner creates or reuses a share token for a finished report.
create or replace function public.enable_idea_share(report_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  tok text;
begin
  if auth.uid() is null then
    raise exception 'Please sign in.';
  end if;

  select share_id into tok
  from public.idea_reports
  where id = report_id
    and user_id = auth.uid()
    and status = 'done';

  if not found then
    raise exception 'Report not found.';
  end if;

  if tok is not null then
    return tok;
  end if;

  tok := replace(gen_random_uuid()::text, '-', '');

  update public.idea_reports
  set share_id = tok
  where id = report_id
    and user_id = auth.uid();

  return tok;
end;
$$;

grant execute on function public.enable_idea_share(uuid) to authenticated;

-- Anyone with the link can read the hosted report (no account).
create or replace function public.get_shared_idea_report(token text)
returns table (
  title text,
  startup_name text,
  idea text,
  audience text,
  different text,
  stage text,
  revenue text,
  deck_name text,
  markdown text,
  created_at timestamptz,
  verdict text,
  iq numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.title,
    r.startup_name,
    r.idea,
    r.audience,
    r.different,
    r.stage,
    r.revenue,
    r.deck_name,
    r.markdown,
    r.created_at,
    r.verdict,
    r.iq
  from public.idea_reports r
  where r.share_id = token
    and r.status = 'done'
  limit 1;
$$;

grant execute on function public.get_shared_idea_report(text) to anon, authenticated;
