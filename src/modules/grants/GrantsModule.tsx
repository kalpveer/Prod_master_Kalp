import { useEffect, useMemo, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, ArrowUpRight, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import ToolChrome from '../ToolChrome';
import { writeWorkspace } from '../workspace';
import { ideaApi } from '../idea/ideaApi';
import type { IdeaReportSummary } from '../idea/types';
import WaitNewsScreen from '../wait/WaitNewsScreen';
import { grantsApi, type GrantRunSummary } from './grantsApi';
import { extractApplyLinks, isHttpUrl, linkifyMarkdown } from './linkify';
import {
  GRANT_APPLICANTS,
  GRANT_SECTORS,
  GRANT_STATES,
  STAGE_OPTIONS,
  type GrantApplicant,
  type GrantInput,
  type GrantMatch,
  type GrantSector,
  type GrantState,
} from './catalog';

const ideaFromUrl = () => new URLSearchParams(window.location.search).get('idea');

const empty: GrantInput = { stage: '', sector: '', state: '', applicant: '', venture: '' };

export default function GrantsModule() {
  const { user, signOut } = useAuth();
  const [ideas, setIdeas] = useState<IdeaReportSummary[] | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(ideaFromUrl);
  const [input, setInput] = useState<GrantInput>(empty);
  const [matches, setMatches] = useState<GrantMatch[] | null>(null);
  const [report, setReport] = useState('');
  const [runs, setRuns] = useState<GrantRunSummary[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [waitStartedAt, setWaitStartedAt] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState(false);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    document.title = 'Grant matching · Productica';
  }, []);

  useEffect(() => {
    const sync = () => setSourceId(ideaFromUrl());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    let alive = true;
    void grantsApi.list().then(rows => {
      if (alive) setRuns(rows);
    }).catch(() => {
      if (alive) setRuns([]);
    });
    void ideaApi.list().then(rows => {
      if (!alive) return;
      const done = rows.filter(r => r.status === 'done');
      setIdeas(done);
      const wanted = ideaFromUrl();
      const picked = done.find(r => r.id === wanted) ?? null;
      if (picked) {
        setSourceId(picked.id);
        setInput(prev => ({
          ...prev,
          stage: prev.stage || picked.stage,
          venture: prev.venture || picked.title || picked.idea,
        }));
        writeWorkspace({ ideaId: picked.id, venture: picked.title || picked.idea, stage: picked.stage });
      } else if (wanted) {
        setSourceId(null);
      }
    }).catch(() => {
      if (alive) setIdeas([]);
    });
    return () => {
      alive = false;
    };
  }, []);

  const source = ideas?.find(r => r.id === sourceId) ?? null;
  const ready = Boolean(input.stage && input.sector && input.state && input.applicant && input.venture.trim().length >= 8);
  const problems = {
    venture: input.venture.trim().length >= 8 ? '' : 'Name the venture in a few words.',
    stage: input.stage ? '' : 'Pick the stage.',
    sector: input.sector ? '' : 'Pick a sector.',
    state: input.state ? '' : 'Pick where it is based.',
    applicant: input.applicant ? '' : 'Pick who is applying.',
  };
  const hasResults = matches !== null;
  const applyLinks = useMemo(() => extractApplyLinks(report), [report]);

  const chooseIdea = (idea: IdeaReportSummary) => {
    setSourceId(idea.id);
    setMatches(null);
    setReport('');
    setShowForm(true);
    setInput(prev => ({ ...prev, stage: idea.stage, venture: idea.title || idea.idea }));
    writeWorkspace({ ideaId: idea.id, venture: idea.title || idea.idea, stage: idea.stage });
    window.history.replaceState(null, '', `/grants?idea=${idea.id}`);
  };

  const describeOwn = () => {
    setSourceId(null);
    setMatches(null);
    setReport('');
    setShowForm(true);
    writeWorkspace({ ideaId: undefined });
    window.history.replaceState(null, '', '/grants');
  };

  const openRun = (run: GrantRunSummary) => {
    setSourceId(run.idea_report_id);
    setInput({
      venture: run.venture,
      stage: run.stage,
      sector: run.sector as GrantSector,
      state: run.state as GrantState,
      applicant: run.applicant as GrantApplicant,
    });
    setMatches(run.matches);
    setReport(run.report);
    setShowForm(false);
    writeWorkspace({ ideaId: run.idea_report_id || undefined, grantRunId: run.id, venture: run.venture, stage: run.stage });
    window.history.replaceState(null, '', run.idea_report_id ? `/grants?idea=${run.idea_report_id}` : '/grants');
    window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  };

  const run = async () => {
    setTouched(true);
    if (!ready || busy) return;
    setBusy(true);
    setWaitStartedAt(Date.now());
    setFormError('');
    try {
      const result = await grantsApi.match(input, sourceId);
      setMatches(result.matches);
      setReport(result.report);
      setShowForm(false);
      setRuns(await grantsApi.list().catch(() => null));
      writeWorkspace({ ideaId: sourceId || undefined, grantRunId: result.id, venture: input.venture, stage: input.stage });
      window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setBusy(false);
      setWaitStartedAt(null);
    }
  };

  const removeRun = async (id: string) => {
    if (!window.confirm('Delete this shortlist? The match is removed from history, but it still counts on this account.')) return;
    try {
      await grantsApi.remove(id);
      setRuns(await grantsApi.list());
    } catch (e) {
      setFormError((e as Error).message);
    }
  };

  const readyMatches = useMemo(() => matches?.filter(m => m.status === 'ready') ?? [], [matches]);
  const laterMatches = useMemo(() => matches?.filter(m => m.status === 'later') ?? [], [matches]);
  const validateHref = source
    ? `/idea?r=${source.id}`
    : `/idea?from=grants`;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {busy && waitStartedAt && (
        <WaitNewsScreen
          eyebrow="Matching"
          title={<>Finding grants that <span className="font-semibold">fit this venture.</span></>}
          note="This usually takes a minute. Stay on this page — the shortlist is saved to your account when it is ready."
          phases={['Reading the venture', 'Checking public schemes', 'Scoring the fit', 'Writing apply links']}
          startedAt={waitStartedAt}
          backLabel="Grant matching"
        />
      )}

      <ToolChrome active="grants" email={user?.email} onSignOut={() => void signOut()}>
        <a href="#match" className="text-white/40 hover:text-white transition-colors">New match</a>
      </ToolChrome>

      <main className="max-w-6xl mx-auto px-6 md:px-12 pt-10 md:pt-14 pb-28">
        <section>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-5">Grant matching · after validation, or on its own</p>
          <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-8 lg:gap-14 lg:items-end">
            <div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-[1.02]">
                Which grants <span className="font-semibold">fit this venture?</span>
              </h1>
              <p className="mt-5 text-base md:text-lg text-white/50 max-w-xl">
                Validate the idea first if you can. This page then uses that report. You can also start here and validate the same venture afterwards.
              </p>
            </div>
            <ContextCard source={source} input={input} validateHref={validateHref} />
          </div>
        </section>

        {hasResults && (
          <section id="results" className="mt-14 scroll-mt-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Your shortlist</p>
                <h2 className="mt-2 text-2xl md:text-3xl font-light tracking-tight">
                  Apply where it <span className="font-semibold">already fits.</span>
                </h2>
              </div>
              <button type="button" onClick={() => { setShowForm(true); document.getElementById('match')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm text-white/50 hover:text-white transition-colors">
                Adjust answers
              </button>
            </div>
            <ResultList
              busy={busy}
              report={report}
              applyLinks={applyLinks}
              readyMatches={readyMatches}
              laterMatches={laterMatches}
              source={source}
            />
          </section>
        )}

        <div className={`grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] gap-10 lg:gap-12 items-start ${hasResults ? 'mt-16' : 'mt-14'}`}>
          <section id="match" className={`scroll-mt-8 ${hasResults && !showForm ? 'hidden lg:block' : ''}`}>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-3">Grant match</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-6">
              {hasResults ? <>Adjust and <span className="font-semibold">run again.</span></> : <>Start with the <span className="font-semibold">venture.</span></>}
            </h2>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10 grid gap-10">
              <Field n="01" label="Which venture is this for?" hint="Pick a saved validation so both tools share the same idea, or describe one here.">
                {ideas === null ? (
                  <p className="text-sm text-white/30">Loading your validations…</p>
                ) : ideas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {ideas.map(idea => {
                      const on = sourceId === idea.id;
                      const title = idea.title || (idea.idea.length > 48 ? `${idea.idea.slice(0, 48)}…` : idea.idea);
                      return (
                        <button key={idea.id} type="button" onClick={() => chooseIdea(idea)} className={chip(on)}>
                          {title}
                        </button>
                      );
                    })}
                    <button type="button" onClick={describeOwn} className={chip(sourceId === null)}>
                      A different venture
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-white/40">
                    No validations yet.{' '}
                    <a href="/idea" className="text-white underline underline-offset-2 hover:text-white/70">Validate an idea</a>
                    {' '}and it will show up here, or describe the venture below.
                  </p>
                )}
                {source && (
                  <a href={`/idea?r=${source.id}`} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                    <FileText size={14} /> Open this validation
                  </a>
                )}
                <textarea
                  value={input.venture}
                  onChange={e => { setInput(p => ({ ...p, venture: e.target.value })); setMatches(null); setReport(''); }}
                  rows={3}
                  maxLength={400}
                  placeholder="e.g. A campus tool that matches student ideas to Gujarat schemes"
                  className={underline}
                />
                {touched && problems.venture && <p className="text-xs text-red-500">{problems.venture}</p>}
              </Field>

              <Field n="02" label="What stage is it at?" hint="Be honest. Most grants want more than a sentence on a page.">
                <div className="flex flex-wrap gap-2">
                  {STAGE_OPTIONS.map(stage => (
                    <button key={stage} type="button" onClick={() => { setInput(p => ({ ...p, stage })); setMatches(null); setReport(''); }} className={chip(input.stage === stage)}>
                      {stage}
                    </button>
                  ))}
                </div>
                {touched && problems.stage && <p className="text-xs text-red-500">{problems.stage}</p>}
              </Field>

              <Field n="03" label="What sector is it in?" hint="Pick the closest one. Specialist grants, like biotech, only appear for that sector.">
                <div className="flex flex-wrap gap-2">
                  {GRANT_SECTORS.map(sector => (
                    <button key={sector} type="button" onClick={() => { setInput(p => ({ ...p, sector: sector as GrantSector })); setMatches(null); setReport(''); }} className={chip(input.sector === sector)}>
                      {sector}
                    </button>
                  ))}
                </div>
                {touched && problems.sector && <p className="text-xs text-red-500">{problems.sector}</p>}
              </Field>

              <Field n="04" label="Where is it based?" hint="State schemes only show up for that state. National schemes show up anywhere in India.">
                <div className="flex flex-wrap gap-2">
                  {GRANT_STATES.map(state => (
                    <button key={state} type="button" onClick={() => { setInput(p => ({ ...p, state: state as GrantState })); setMatches(null); setReport(''); }} className={chip(input.state === state)}>
                      {state}
                    </button>
                  ))}
                </div>
                {touched && problems.state && <p className="text-xs text-red-500">{problems.state}</p>}
              </Field>

              <Field n="05" label="Who is applying?" hint="Several schemes are only for registered startups, students, or researchers.">
                <div className="flex flex-wrap gap-2">
                  {GRANT_APPLICANTS.map(applicant => (
                    <button key={applicant.id} type="button" onClick={() => { setInput(p => ({ ...p, applicant: applicant.id as GrantApplicant })); setMatches(null); setReport(''); }} className={chip(input.applicant === applicant.id)}>
                      {applicant.label}
                    </button>
                  ))}
                </div>
                {touched && problems.applicant && <p className="text-xs text-red-500">{problems.applicant}</p>}
              </Field>

              <div className="grid gap-3">
                <button type="button" onClick={() => void run()} disabled={busy} className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {busy ? 'Matching grants… this can take a minute' : hasResults ? 'Run match again' : 'Show matching grants'} {!busy && <ArrowRight size={16} />}
                </button>
                {formError && <p role="alert" className="text-sm text-red-500">{formError}</p>}
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-6">
            {!hasResults && (
              <div className="mb-10">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Shortlist</p>
                <p className="mt-2 mb-4 text-sm text-white/40">
                  {source ? `Using ${source.title || 'your validation'}.` : 'Not tied to a validation yet. You can still match, then validate the same venture.'}
                </p>
                {busy ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8">
                    <p className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Matching
                    </p>
                    <p className="mt-3 text-base font-semibold tracking-tight">The grant engine is reading this venture.</p>
                    <p className="mt-2 text-sm text-white/40 leading-relaxed">This usually takes a minute. Stay on this page.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 px-5 py-8">
                    <p className="text-base font-semibold tracking-tight">No shortlist yet</p>
                    <p className="mt-2 text-sm text-white/40 leading-relaxed">Answer the five questions. Apply links will show up here, ready to open.</p>
                  </div>
                )}
              </div>
            )}

            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-3">Saved shortlists</p>
            {runs === null ? (
              <p className="text-sm text-white/30">Loading your matches…</p>
            ) : runs.length === 0 ? (
              <p className="text-sm text-white/40">Each match is saved to this account so you can reopen it later.</p>
            ) : (
              <div className="grid gap-2">
                {runs.map(item => (
                  <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/10 px-4 py-3">
                    <button type="button" onClick={() => openRun(item)} className="flex-1 min-w-0 text-left">
                      <span className="block text-sm font-semibold tracking-tight truncate">{item.venture}</span>
                      <span className="mt-1 block text-xs text-white/40">
                        {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {item.idea_report_id ? ' · from a validation' : ''}
                        {' · '}{item.ready_count} ready
                      </span>
                    </button>
                    <button type="button" onClick={() => void removeRun(item.id)} aria-label="Delete shortlist" className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function ContextCard({ source, input, validateHref }: { source: IdeaReportSummary | null; input: GrantInput; validateHref: string }) {
  if (source) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Shared with idea validation</p>
        <p className="mt-2 text-lg font-semibold tracking-tight">{source.title || source.idea}</p>
        <p className="mt-1 text-sm text-white/45">{source.stage}{source.verdict ? ` · ${source.verdict}` : ''}{source.iq != null ? ` · IQ ${Number(source.iq).toFixed(1)}` : ''}</p>
        <a href={`/idea?r=${source.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/70 transition-colors">
          Open the validation <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Works on its own</p>
      <p className="mt-2 text-sm text-white/55 leading-relaxed">
        {input.venture.trim()
          ? 'This match is not tied to a validation yet. You can still run it, then send the same venture to idea validation.'
          : 'No validation selected. Pick one above, or start here and validate afterwards.'}
      </p>
      <a
        href={validateHref}
        onClick={() => writeWorkspace({ venture: input.venture, stage: input.stage || undefined })}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/70 transition-colors"
      >
        Validate this venture <ArrowRight size={14} />
      </a>
    </div>
  );
}

function ResultList({
  busy,
  report,
  applyLinks,
  readyMatches,
  laterMatches,
  source,
}: {
  busy: boolean;
  report: string;
  applyLinks: { href: string; label: string }[];
  readyMatches: GrantMatch[];
  laterMatches: GrantMatch[];
  source: IdeaReportSummary | null;
}) {
  if (busy) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8">
        <p className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Matching
        </p>
        <p className="mt-3 text-base font-semibold tracking-tight">Updating this shortlist.</p>
      </div>
    );
  }

  const cards = [...readyMatches, ...laterMatches];
  const extraLinks = applyLinks.filter(link => !cards.some(m => m.scheme.href === link.href));

  return (
    <div className="grid gap-4">
      {source && (
        <a href={`/idea?r=${source.id}`} className="rounded-2xl border border-white/10 px-5 py-4 flex flex-wrap items-center justify-between gap-3 hover:border-white/25 transition-colors">
          <span>
            <span className="block text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">From idea validation</span>
            <span className="mt-1 block text-sm font-semibold">{source.title || source.idea}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-white/60">Open report <ArrowRight size={14} /></span>
        </a>
      )}

      {cards.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3">
          {readyMatches.map(match => <MatchCard key={match.scheme.id} match={match} />)}
          {laterMatches.map(match => <MatchCard key={match.scheme.id} match={match} />)}
        </div>
      )}

      {extraLinks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {extraLinks.map(link => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white text-black text-sm font-semibold px-4 py-2 hover:bg-white/90">
              Apply on {link.label} <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      )}

      {report && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-sm text-white/70 leading-relaxed prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:text-white prose-a:text-white prose-a:underline prose-a:underline-offset-2">
          <GrantMarkdown text={report} />
        </div>
      )}

      {!report && cards.length === 0 && extraLinks.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8">
          <p className="text-base font-semibold tracking-tight">No schemes came back</p>
          <p className="mt-2 text-sm text-white/40 leading-relaxed">Try a broader sector, or add more detail in the venture description.</p>
        </div>
      )}
    </div>
  );
}

function GrantMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) => (
          isHttpUrl(href) ? (
            <a href={href} target="_blank" rel="noreferrer" className="text-white underline underline-offset-2 hover:text-white/70 font-semibold">
              {children}
            </a>
          ) : <span>{children}</span>
        ),
      }}
    >
      {linkifyMarkdown(text)}
    </ReactMarkdown>
  );
}

function MatchCard({ match }: { match: GrantMatch }) {
  const later = match.status === 'later';
  const href = isHttpUrl(match.scheme.href) ? match.scheme.href : null;
  return (
    <article className={`rounded-2xl border px-5 py-5 flex flex-col ${later ? 'border-white/10 bg-transparent' : 'border-white/15 bg-white/[0.03]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">{match.scheme.provider}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{match.scheme.name}</h3>
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-widest border rounded-md px-2 py-1 ${later ? 'text-white/40 border-white/15' : 'text-white border-white/30'}`}>
          {later ? 'Later' : match.scheme.kind === 'step' ? 'Do first' : 'Apply'}
        </span>
      </div>
      {match.scheme.summary && <p className="mt-2 text-sm text-white/55 leading-relaxed">{match.scheme.summary}</p>}
      {match.why && <p className="mt-2 text-sm text-white/40 leading-relaxed">{match.why}</p>}
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={`mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${later ? 'border border-white/20 text-white hover:bg-white/5' : 'bg-white text-black hover:bg-white/90'}`}>
          {later ? 'Read the official page' : 'Apply on the official site'} <ArrowUpRight size={14} />
        </a>
      ) : (
        <p className="mt-5 text-xs text-white/30">No apply link came back for this one. Check the write-up below.</p>
      )}
    </article>
  );
}

function Field({ n, label, hint, children }: { n: string; label: string; hint: string; children: ReactNode }) {
  return (
    <div className="grid gap-3">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">{n}</p>
        <h3 className="mt-2 text-xl md:text-2xl font-light tracking-tight">{label}</h3>
        <p className="mt-1 text-sm text-white/40">{hint}</p>
      </div>
      {children}
    </div>
  );
}

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-sm text-left transition-all active:scale-[0.97] ${
    on ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white'
  }`;

const underline =
  'w-full bg-transparent border-0 border-b border-white/25 focus:border-white/80 outline-none resize-none text-lg font-light leading-relaxed placeholder:text-white/20 py-2 transition-colors';
