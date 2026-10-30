import { useEffect, useMemo, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, ArrowUpRight, FileText, Trash2 } from 'lucide-react';
import { PrismaHero } from '@/components/ui/prisma-hero';
import { useAuth } from '../../auth/useAuth';
import ToolChrome from '../ToolChrome';
import ToolLanding from '../ToolLanding';
import { writeWorkspace } from '../workspace';
import { ideaApi } from '../idea/ideaApi';
import type { IdeaReportSummary } from '../idea/types';
import WaitNewsScreen from '../wait/WaitNewsScreen';
import { grantsApi, type GrantRunSummary } from './grantsApi';
import { extractApplyLinks, isHttpUrl, linkifyMarkdown } from './linkify';
import { prepareGrantReport } from './reportMarkdown';
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

const empty: GrantInput = {
  stage: '', sector: '', state: '', applicant: '', venture: '',
  startupName: '', idea: '', audience: '', different: '',
};

export default function GrantsModule() {
  const { displayName, signOut } = useAuth();
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
  /** True when the visitor chose to answer the venture questions on this page. */
  const [ownIdea, setOwnIdea] = useState(false);
  const [entered, setEntered] = useState(() => Boolean(ideaFromUrl()));

  useEffect(() => {
    document.title = 'Grants · VentureLab';
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
        setOwnIdea(false);
        setInput(prev => ({
          ...prev,
          stage: prev.stage || picked.stage,
          startupName: picked.startup_name || prev.startupName,
          idea: picked.idea || prev.idea,
          venture: prev.venture || picked.startup_name || picked.title || picked.idea,
        }));
        writeWorkspace({
          ideaId: picked.id,
          venture: picked.startup_name || picked.title || picked.idea,
          startupName: picked.startup_name,
          idea: picked.idea,
          stage: picked.stage,
        });
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
  const askingVenture = !source && (ideas?.length === 0 || ownIdea);
  const showGrantQuestions = Boolean(source) || askingVenture;
  const grantStart = askingVenture ? 6 : 1;
  const ready = Boolean(
    input.sector && input.state && input.applicant
    && (source
      ? source.stage
      : input.stage && input.startupName.trim().length >= 2 && input.idea.trim().length >= 20 && input.audience.trim().length >= 3 && input.different.trim().length >= 5),
  );
  const problems = {
    startupName: input.startupName.trim().length >= 2 ? '' : 'Name your startup.',
    idea: input.idea.trim().length >= 20 ? '' : 'Describe your idea in a bit more detail (a couple of sentences).',
    audience: input.audience.trim().length >= 3 ? '' : 'Tell us who this is for.',
    different: input.different.trim().length >= 5 ? '' : 'Tell us what makes it different.',
    stage: input.stage ? '' : 'Pick the stage.',
    sector: input.sector ? '' : 'Pick a sector.',
    state: input.state ? '' : 'Pick where it is based.',
    applicant: input.applicant ? '' : 'Pick who is applying.',
  };
  const hasResults = matches !== null;
  const applyLinks = useMemo(() => extractApplyLinks(report), [report]);

  const chooseIdea = (idea: IdeaReportSummary) => {
    setSourceId(idea.id);
    setOwnIdea(false);
    setMatches(null);
    setReport('');
    setShowForm(true);
    const venture = idea.startup_name?.trim() || idea.title || idea.idea;
    setInput(prev => ({
      ...prev,
      stage: idea.stage,
      startupName: idea.startup_name || '',
      idea: idea.idea,
      venture,
    }));
    writeWorkspace({ ideaId: idea.id, venture, startupName: idea.startup_name, idea: idea.idea, stage: idea.stage });
    window.history.replaceState(null, '', `/grants?idea=${idea.id}`);
  };

  const describeOwn = () => {
    setOwnIdea(true);
    setSourceId(null);
    setMatches(null);
    setReport('');
    setShowForm(true);
    setInput(prev => ({ ...empty, sector: prev.sector, state: prev.state, applicant: prev.applicant }));
    writeWorkspace({ ideaId: undefined, startupName: '', idea: '', audience: '', different: '' });
    window.history.replaceState(null, '', '/grants');
  };

  const openRun = (run: GrantRunSummary) => {
    setSourceId(run.idea_report_id);
    setOwnIdea(!run.idea_report_id);
    setInput({
      venture: run.venture,
      stage: run.stage,
      sector: run.sector as GrantSector,
      state: run.state as GrantState,
      applicant: run.applicant as GrantApplicant,
      startupName: run.profile?.startupName || '',
      idea: run.profile?.idea || (run.idea_report_id ? '' : run.venture),
      audience: run.profile?.audience || '',
      different: run.profile?.different || '',
    });
    setMatches(run.matches);
    setReport(run.report);
    setShowForm(false);
    writeWorkspace({
      ideaId: run.idea_report_id || undefined,
      grantRunId: run.id,
      venture: run.profile?.startupName || run.venture,
      startupName: run.profile?.startupName,
      idea: run.profile?.idea,
      audience: run.profile?.audience,
      different: run.profile?.different,
      stage: run.stage,
    });
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
      const displayName = (source?.startup_name || input.startupName).trim();
      const described = source
        ? [displayName, source.idea].filter(Boolean).join(' — ').slice(0, 400)
        : [displayName, input.idea.trim()].filter(Boolean).join(' — ').slice(0, 400);
      const venture = described.length >= 8 ? described : displayName;
      const stage = source?.stage || input.stage;
      const result = await grantsApi.match({
        ...input,
        venture,
        stage,
        startupName: (source?.startup_name || input.startupName).trim(),
        idea: (source?.idea || input.idea).trim(),
        audience: input.audience.trim(),
        different: input.different.trim(),
      }, sourceId);
      setMatches(result.matches);
      setReport(result.report);
      setShowForm(false);
      setRuns(await grantsApi.list().catch(() => null));
      writeWorkspace({
        ideaId: sourceId || undefined,
        grantRunId: result.id,
        venture: source?.startup_name || input.startupName.trim(),
        startupName: (source?.startup_name || input.startupName).trim(),
        idea: (source?.idea || input.idea).trim(),
        audience: input.audience.trim(),
        different: input.different.trim(),
        stage,
      });
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

  const patch = (next: Partial<GrantInput>) => {
    setInput(p => ({ ...p, ...next }));
    setMatches(null);
    setReport('');
  };

  const readyMatches = useMemo(() => matches?.filter(m => m.status === 'ready') ?? [], [matches]);
  const laterMatches = useMemo(() => matches?.filter(m => m.status === 'later') ?? [], [matches]);
  const validateHref = source
    ? `/idea?r=${source.id}`
    : `/idea?from=grants`;

  if (!entered) {
    return (
      <ToolLanding
        title="Grants"
        eyebrow="Grant matching"
        description="Find the funding your startup deserves."
        detail="Discover startup grants and government schemes tailored to your business, industry, and stage. Spend less time searching and more time building."
        ctaLabel="Match grants"
        onEnter={() => setEntered(true)}
      />
    );
  }

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

      <ToolChrome active="grants" account={displayName} onSignOut={() => void signOut()}>
        <a href="#match" className="text-white/40 hover:text-white transition-colors">New match</a>
      </ToolChrome>

      <main className="max-w-6xl mx-auto px-6 md:px-12 pt-8 pb-28">
        <section className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <PrismaHero
            compact
            title="Grants"
            description="Match schemes to one of your ideas. A saved validation skips those questions. Starting here asks them once."
            ctaLabel="Match grants"
            ctaHref="#match"
            secondary={{ label: 'Open Validate', href: '/idea' }}
          />
          <aside className="flex h-full min-h-[280px] max-h-[520px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="px-5 pt-5">
              <ContextCard source={source} input={input} validateHref={validateHref} asking={askingVenture} hasIdeas={Boolean(ideas?.length)} />
            </div>
            <div className="mx-5 mt-4 border-t border-white/10" />
            <div className="px-5 pt-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Saved shortlists</p>
            </div>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              {runs === null ? (
                <p className="text-sm text-white/30">Loading your matches…</p>
              ) : runs.length === 0 ? (
                <p className="text-sm text-white/40">Each match is saved here so you can reopen it.</p>
              ) : (
                <div>
                  {runs.map(item => (
                    <div key={item.id} className="flex items-start gap-3 border-b border-white/10 py-3 last:border-b-0">
                      <button type="button" onClick={() => openRun(item)} className="flex-1 min-w-0 text-left">
                        <span className="block truncate text-sm font-semibold tracking-tight">{item.profile?.startupName || item.venture}</span>
                        <span className="mt-1 block text-xs text-white/40">
                          {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {item.idea_report_id ? ' · from a validation' : item.profile ? ' · started on Grants' : ''}
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
            </div>
          </aside>
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

        <div className={hasResults ? 'mt-16' : 'mt-14'}>
          <section id="match" className={`mx-auto w-full max-w-5xl scroll-mt-8 ${hasResults && !showForm ? 'hidden lg:block' : ''}`}>
            <div className="mb-6 text-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-3">Grant match</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight">
              {hasResults
                ? <>Adjust and <span className="font-semibold">run again.</span></>
                : source
                  ? <>A few questions <span className="font-semibold">Grants still needs.</span></>
                  : ideas && ideas.length > 0 && !askingVenture
                    ? <>Start with one of <span className="font-semibold">your ideas.</span></>
                    : <>Start with the <span className="font-semibold">venture.</span></>}
            </h2>
            </div>

            <div className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10 grid gap-10 [&>*]:min-w-0">
              {ideas === null ? (
                <p className="text-sm text-white/30">Loading your ideas…</p>
              ) : ideas.length > 0 ? (
                <Field n="" label="Which idea?" hint={askingVenture ? 'This idea is not validated yet. The questions below are the same ones Validate asks.' : 'A saved validation already has the venture answers, so those questions stay hidden.'}>
                  <div className="flex flex-wrap gap-2">
                    {ideas.map(idea => {
                      const on = sourceId === idea.id;
                      const title = idea.startup_name?.trim() || idea.title || (idea.idea.length > 48 ? `${idea.idea.slice(0, 48)}…` : idea.idea);
                      return (
                        <button key={idea.id} type="button" onClick={() => chooseIdea(idea)} className={chip(on)}>
                          {title}
                        </button>
                      );
                    })}
                    <button type="button" onClick={describeOwn} className={chip(!source && askingVenture)}>
                      A new idea
                    </button>
                  </div>
                  {source && (
                    <a href={`/idea?r=${source.id}`} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                      <FileText size={14} /> Open this validation
                    </a>
                  )}
                </Field>
              ) : (
                <p className="text-sm text-white/40">
                  No validations yet, so Grants asks the same venture questions.{' '}
                  <a href="/idea" className="text-white underline underline-offset-2 hover:text-white/70">Validate first</a>
                  {' '}if you would rather answer them there.
                </p>
              )}

              {askingVenture && (
                <>
                  <Field n="01" label="Startup name" hint="A working name is fine. Validate will keep it.">
                    <input
                      value={input.startupName}
                      onChange={e => patch({ startupName: e.target.value })}
                      maxLength={80}
                      placeholder="e.g. Niva"
                      className={underline}
                    />
                    {touched && problems.startupName && <p className="text-xs text-red-500">{problems.startupName}</p>}
                  </Field>
                  <Field n="02" label="The idea" hint="What it is, and the problem it solves.">
                    <textarea
                      value={input.idea}
                      onChange={e => patch({ idea: e.target.value })}
                      rows={4}
                      maxLength={4000}
                      placeholder="e.g. An app that tells freelancers how much they can safely withdraw each week…"
                      className={underline}
                    />
                    {touched && problems.idea && <p className="text-xs text-red-500">{problems.idea}</p>}
                  </Field>
                  <Field n="03" label="Who is it for?" hint="Who they are, and where they are.">
                    <textarea
                      value={input.audience}
                      onChange={e => patch({ audience: e.target.value })}
                      rows={2}
                      maxLength={1500}
                      placeholder="e.g. Solo freelancers and creators in India with irregular income"
                      className={underline}
                    />
                    {touched && problems.audience && <p className="text-xs text-red-500">{problems.audience}</p>}
                  </Field>
                  <Field n="04" label="What is different?" hint="Why someone would pick this.">
                    <textarea
                      value={input.different}
                      onChange={e => patch({ different: e.target.value })}
                      rows={3}
                      maxLength={3000}
                      placeholder="e.g. One safe-to-withdraw number tied to real income, with automatic tax set-asides"
                      className={underline}
                    />
                    {touched && problems.different && <p className="text-xs text-red-500">{problems.different}</p>}
                  </Field>
                  <Field n="05" label="Stage" hint="Where it is today.">
                    <div className="flex flex-wrap gap-2">
                      {STAGE_OPTIONS.map(stage => (
                        <button key={stage} type="button" onClick={() => patch({ stage })} className={chip(input.stage === stage)}>
                          {stage}
                        </button>
                      ))}
                    </div>
                    {touched && problems.stage && <p className="text-xs text-red-500">{problems.stage}</p>}
                  </Field>
                </>
              )}

              {source && (
                <p className="text-sm text-white/45 leading-relaxed">
                  Startup, idea, audience, and stage come from <span className="text-white/80">{source.startup_name?.trim() || source.title || 'this validation'}</span>. Grants does not ask them again.
                </p>
              )}

              {showGrantQuestions && (
                <>
                  <Field n={num(grantStart)} label="Sector" hint="Closest fit.">
                    <div className="flex flex-wrap gap-2">
                      {GRANT_SECTORS.map(sector => (
                        <button key={sector} type="button" onClick={() => patch({ sector: sector as GrantSector })} className={chip(input.sector === sector)}>
                          {sector}
                        </button>
                      ))}
                    </div>
                    {touched && problems.sector && <p className="text-xs text-red-500">{problems.sector}</p>}
                  </Field>

                  <Field n={num(grantStart + 1)} label="Based in" hint="State schemes follow this. National schemes still show.">
                    <div className="flex flex-wrap gap-2">
                      {GRANT_STATES.map(state => (
                        <button key={state} type="button" onClick={() => patch({ state: state as GrantState })} className={chip(input.state === state)}>
                          {state}
                        </button>
                      ))}
                    </div>
                    {touched && problems.state && <p className="text-xs text-red-500">{problems.state}</p>}
                  </Field>

                  <Field n={num(grantStart + 2)} label="Who is applying?" hint="Some schemes are limited to a type of applicant.">
                    <div className="flex flex-wrap gap-2">
                      {GRANT_APPLICANTS.map(applicant => (
                        <button key={applicant.id} type="button" onClick={() => patch({ applicant: applicant.id as GrantApplicant })} className={chip(input.applicant === applicant.id)}>
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
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ContextCard({ source, input, validateHref, asking, hasIdeas }: { source: IdeaReportSummary | null; input: GrantInput; validateHref: string; asking: boolean; hasIdeas: boolean }) {
  if (source) {
    return (
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Shared with idea validation</p>
        <p className="mt-2 text-lg font-semibold tracking-tight">{source.startup_name?.trim() || source.title || source.idea}</p>
        <p className="mt-1 text-sm text-white/45">{source.stage}{source.verdict ? ` · ${source.verdict}` : ''}{source.iq != null ? ` · IQ ${Number(source.iq).toFixed(1)}` : ''}</p>
        <a href={`/idea?r=${source.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/70 transition-colors">
          Open the validation <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  if (!asking && hasIdeas) {
    return (
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Your ideas</p>
        <p className="mt-2 text-sm text-white/55 leading-relaxed">Pick a validation to skip the venture questions, or start a new idea here. Both tools share the same ideas, up to 3 on this account.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Started on Grants</p>
      <p className="mt-2 text-sm text-white/55 leading-relaxed">
        {input.startupName.trim() ? `${input.startupName.trim()} is not validated yet. The answers below carry over.` : 'Answer the venture questions once. Validate can reuse them.'}
      </p>
      <a
        href={validateHref}
        onClick={() => writeWorkspace({
          venture: input.startupName.trim() || input.idea.trim(),
          startupName: input.startupName.trim(),
          idea: input.idea.trim(),
          audience: input.audience.trim(),
          different: input.different.trim(),
          stage: input.stage || undefined,
        })}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/70 transition-colors"
      >
        Validate this idea <ArrowRight size={14} />
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
            <span className="mt-1 block text-sm font-semibold">{source.startup_name?.trim() || source.title || source.idea}</span>
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

      {reportParts(report).map((part, i) => (
        <article key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6">
          <GrantMarkdown text={part} />
        </article>
      ))}

      {cards.length === 0 && extraLinks.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Official pages</p>
          <div className="mt-2 grid gap-1">
            {extraLinks.map(link => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-sm hover:bg-black/5">
                <span className="min-w-0 truncate font-semibold">{link.label}</span>
                <span className="inline-flex shrink-0 items-center gap-1 text-white/50">Open <ArrowUpRight size={14} /></span>
              </a>
            ))}
          </div>
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

function reportParts(text: string): string[] {
  const clean = prepareGrantReport(text);
  if (!clean) return [];
  return clean.split(/\n\s*(?:---|\*\*\*)\s*\n/).map(part => part.trim()).filter(Boolean);
}

function GrantMarkdown({ text }: { text: string }) {
  return (
    <div className="vl-report text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h2 className="vl-report-title">{children}</h2>,
          h2: ({ children }) => <h2 className="vl-report-title">{children}</h2>,
          h3: ({ children }) => <h3 className="vl-report-title">{children}</h3>,
          h4: ({ children }) => <h3 className="vl-report-title">{children}</h3>,
          em: ({ children }) => <strong className="vl-report-title">{children}</strong>,
          strong: ({ children }) => <strong className="vl-report-title">{children}</strong>,
          a: ({ href, children }) => (
            isHttpUrl(href) ? (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            ) : <span>{children}</span>
          ),
        }}
      >
        {linkifyMarkdown(text)}
      </ReactMarkdown>
    </div>
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
        {n && <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">{n}</p>}
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

const num = (n: number) => String(n).padStart(2, '0');

const underline =
  'w-full bg-transparent border-0 border-b border-white/25 focus:border-white/80 outline-none resize-none text-lg font-light leading-relaxed placeholder:text-white/20 py-2 transition-colors';
