import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import ToolChrome from '../ToolChrome';
import { readWorkspace, writeWorkspace } from '../workspace';
import { grantsApi } from '../grants/grantsApi';
import IdeaForm, { type FormBusy } from './IdeaForm';
import ReportView from './ReportView';
import { ideaApi } from './ideaApi';
import { FREE_IDEA_LIMIT, STALE_RUN_MS, type IdeaAnswers, type IdeaReportSummary } from './types';

const BASE = '/idea';
const reportFromUrl = () => new URLSearchParams(window.location.search).get('r');

const VERDICT_STYLE: Record<string, string> = {
  build: 'text-emerald-400 border-emerald-400/30',
  'test first': 'text-amber-300 border-amber-300/30',
  pivot: 'text-orange-400 border-orange-400/30',
  park: 'text-red-400 border-red-400/30',
};

const isStale = (r: IdeaReportSummary) => r.status === 'running' && Date.now() - new Date(r.created_at).getTime() > STALE_RUN_MS;

const STEPS = [
  { n: '01', title: 'Tell us the idea', body: 'Four short answers. Add a deck only if you already have one.' },
  { n: '02', title: 'Read the verdict', body: 'A scored report with a clear build, test, pivot, or park call.' },
  { n: '03', title: 'Check grants next', body: 'The same report opens grant matching, so both tools stay on one venture.' },
];

export default function IdeaModule() {
  const { user, signOut } = useAuth();
  const [reports, setReports] = useState<IdeaReportSummary[] | null>(null);
  const [usedFree, setUsedFree] = useState<number | null>(null);
  const [listError, setListError] = useState('');
  const [openId, setOpenId] = useState<string | null>(reportFromUrl);
  const [busy, setBusy] = useState<FormBusy>(null);
  const [formError, setFormError] = useState('');
  const [prefill, setPrefill] = useState<Partial<IdeaAnswers> | undefined>();
  const [formKey, setFormKey] = useState(0);
  const [grantByIdea, setGrantByIdea] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = 'Idea Validation · Productica';
  }, []);

  // keep the open report in the URL so a refresh or the browser back button behaves
  useEffect(() => {
    const sync = () => setOpenId(reportFromUrl());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'grants' || reportFromUrl()) return;
    const ws = readWorkspace();
    if (!ws.venture) return;
    setPrefill({ idea: ws.venture, stage: ws.stage });
    setFormKey(k => k + 1);
  }, []);

  const open = (id: string) => {
    writeWorkspace({ ideaId: id });
    window.history.pushState(null, '', `${BASE}?r=${id}`);
    setOpenId(id);
    window.scrollTo(0, 0);
  };
  const close = useCallback(() => {
    window.history.pushState(null, '', BASE);
    setOpenId(null);
    window.scrollTo(0, 0);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [list, quota] = await Promise.all([
        ideaApi.list(),
        ideaApi.quota().catch(() => null),
      ]);
      setReports(list);
      if (quota) setUsedFree(quota.used);
      setListError('');
      const grantRuns = await grantsApi.list().catch(() => []);
      const map: Record<string, string> = {};
      for (const run of grantRuns) {
        if (run.idea_report_id && !map[run.idea_report_id]) map[run.idea_report_id] = run.id;
      }
      setGrantByIdea(map);
    } catch (e) {
      setListError((e as Error).message);
    }
  }, []);

  // reload the list whenever we are back on it, and keep it fresh while something is generating
  const running = reports?.some(r => r.status === 'running' && !isStale(r)) ?? false;
  const finished = usedFree ?? (reports ? reports.filter(r => r.status === 'done').length : null);
  const used = finished === null ? null : finished + (running ? 1 : 0);
  const remaining = used === null ? null : Math.max(0, FREE_IDEA_LIMIT - used);
  useEffect(() => {
    if (openId) return;
    void refresh();
  }, [openId, refresh]);
  useEffect(() => {
    if (openId || !running) return;
    const t = setInterval(() => void refresh(), 5000);
    return () => clearInterval(t);
  }, [openId, running, refresh]);

  const submit = async (answers: IdeaAnswers, deckFile: File | null) => {
    if (!user) return;
    setFormError('');
    let deck: Awaited<ReturnType<typeof ideaApi.uploadDeck>> | null = null;
    try {
      if (deckFile) {
        setBusy('uploading');
        deck = await ideaApi.uploadDeck(deckFile, user.id);
      }
      setBusy('starting');
      const { id } = await ideaApi.generate(answers, deck);
      setPrefill(undefined);
      setFormKey(k => k + 1);
      open(id);
    } catch (e) {
      if (deck) void ideaApi.discardDeck(deck.path);
      setFormError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (r: IdeaReportSummary) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      const full = await ideaApi.get(r.id);
      await ideaApi.remove({ id: r.id, deck_path: full?.deck_path });
      void refresh();
    } catch (e) {
      setListError((e as Error).message);
    }
  };

  if (openId) {
    return (
      <ReportView
        key={openId}
        id={openId}
        onBack={close}
        onRetry={answers => {
          setPrefill(answers);
          setFormKey(k => k + 1);
          close();
        }}
      />
    );
  }

  const blocked = running
    ? 'A report is already generating. It will appear in your history when it is ready.'
    : undefined;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <ToolChrome active="idea" email={user?.email} onSignOut={() => void signOut()}>
        <a href="#validate" className="text-white/40 hover:text-white transition-colors">New validation</a>
        <a href="#history" className="text-white/40 hover:text-white transition-colors">History</a>
      </ToolChrome>

      <main className="max-w-6xl mx-auto px-6 md:px-12 pt-10 md:pt-14 pb-28">
        <section>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-5">Syncoro IQ · Venture Diagnostic</p>
          <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-8 lg:gap-16 lg:items-end">
            <div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-[1.02]">
                Is your idea <span className="font-semibold">worth building?</span>
              </h1>
              <p className="mt-5 text-base md:text-lg text-white/50 max-w-xl">
                Three free validations on this account. Answer four questions, get an evidence-scored report, and reopen it whenever you come back.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href={remaining === 0 ? '#history' : '#validate'} className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-6 py-3 hover:bg-white/90 active:scale-[0.97] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {remaining === 0 ? 'See your reports' : 'Validate an idea'} <ArrowRight size={16} />
                </a>
                <a href="/grants" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-white/70 hover:text-white hover:border-white/30 transition-colors">
                  Check grants
                </a>
              </div>
            </div>
            <Allowance used={used} />
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-3">
            {STEPS.map(step => (
              <div key={step.n} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">{step.n}</p>
                <p className="mt-2 text-base font-semibold tracking-tight">{step.title}</p>
                <p className="mt-1.5 text-sm text-white/45 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] gap-10 lg:gap-12 items-start">
          <section id="validate" className="order-2 lg:order-1 scroll-mt-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-3">New validation</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-6">
              {remaining === 0 ? <>Your free reports are <span className="font-semibold">saved here.</span></> : <>Start with the <span className="font-semibold">idea itself.</span></>}
            </h2>
            {remaining === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
                <p className="text-base md:text-lg text-white/55 leading-relaxed max-w-lg">
                  You’ve used all {FREE_IDEA_LIMIT} free validations on this account. Open any report in your history to read the verdict, the IQ score, and the full write-up.
                </p>
                <a href="#history" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-white hover:text-white/70 transition-colors">
                  Open your history <ArrowRight size={16} />
                </a>
              </div>
            ) : (
              <>
                {remaining !== null && (
                  <p className="mb-4 text-sm text-white/40">
                    This uses 1 of your {remaining} remaining free {remaining === 1 ? 'validation' : 'validations'}.
                  </p>
                )}
                <IdeaForm key={formKey} initial={prefill} busy={busy} error={formError} blocked={blocked} onSubmit={submit} />
              </>
            )}
          </section>

          <section id="history" className="order-1 lg:order-2 lg:sticky lg:top-6 scroll-mt-8">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Your validations</p>
                <p className="mt-2 text-sm text-white/40">Up to {FREE_IDEA_LIMIT} free reports on this account.</p>
              </div>
              {remaining !== null && (
                <p className="text-xs font-mono uppercase tracking-widest text-white/50">{remaining} left</p>
              )}
            </div>
            {listError && <p role="alert" className="mb-4 text-sm text-red-500">{listError}</p>}
            {reports === null ? (
              <p className="text-sm text-white/30">Loading your reports…</p>
            ) : reports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 px-5 py-8">
                <p className="text-base font-semibold tracking-tight">No reports yet</p>
                <p className="mt-2 text-sm text-white/40 leading-relaxed">
                  Your three free validations will show up here, with the verdict and the date, so you can reopen them later.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {reports.map(r => (
                  <HistoryRow
                    key={r.id}
                    r={r}
                    grantsHref={r.status === 'done' ? `/grants?idea=${r.id}` : undefined}
                    grantsDone={Boolean(grantByIdea[r.id])}
                    onOpen={() => open(r.id)}
                    onDelete={() => void remove(r)}
                  />
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-white/30 leading-relaxed">A finished report uses one free validation. Deleting it does not give the validation back. A failed run does not use one.</p>
            <a href="/grants" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/70 transition-colors">
              Take a report into grant matching <ArrowRight size={14} />
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}

function Allowance({ used }: { used: number | null }) {
  const filled = used === null ? 0 : Math.min(used, FREE_IDEA_LIMIT);
  const remaining = used === null ? null : Math.max(0, FREE_IDEA_LIMIT - used);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Free validations left</p>
      <p className="mt-2 text-3xl font-light tracking-tight">
        {remaining === null ? (
          <span className="text-white/35 text-xl">Checking your account…</span>
        ) : (
          <>
            <span className="font-semibold">{remaining}</span>
            <span className="text-white/35"> / {FREE_IDEA_LIMIT}</span>
          </>
        )}
      </p>
      <div className="mt-4 flex items-center gap-2" aria-label={remaining === null ? 'Loading remaining validations' : `${remaining} of ${FREE_IDEA_LIMIT} free validations left`}>
        {Array.from({ length: FREE_IDEA_LIMIT }, (_, i) => (
          <span key={i} className="grid flex-1 gap-1.5">
            <span className={`block h-1.5 rounded-full ${i < filled ? 'bg-white' : 'bg-white/15'}`} />
            <span className="text-[10px] font-mono text-white/30">{String(i + 1).padStart(2, '0')}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HistoryRow({ r, grantsHref, grantsDone, onOpen, onDelete }: { r: IdeaReportSummary; grantsHref?: string; grantsDone?: boolean; onOpen: () => void; onDelete: () => void }) {
  const stale = isStale(r);
  const status = stale ? 'failed' : r.status;
  const title = r.title || (r.idea.length > 70 ? `${r.idea.slice(0, 70)}…` : r.idea);
  const verdict = r.verdict?.toLowerCase() ?? '';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25 transition-colors px-4 py-4">
      <div className="flex items-start gap-3">
        <button onClick={onOpen} className="flex-1 min-w-0 text-left">
          <span className="block text-base font-semibold tracking-tight">{title}</span>
          <span className="mt-1 flex items-center gap-2 text-xs text-white/40">
            <span className="truncate">
              {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {r.stage}
            </span>
            {r.deck_name && <FileText size={12} className="flex-none" aria-label="Includes pitch deck" />}
          </span>
          <span className="mt-3 flex flex-wrap items-center gap-2">
            {status === 'done' && r.iq != null && <span className="text-xs font-mono text-white/60">IQ {Number(r.iq).toFixed(1)}</span>}
            {status === 'done' && r.verdict && (
              <span className={`text-[10px] font-mono uppercase tracking-widest border rounded-md px-2 py-1 ${VERDICT_STYLE[verdict] || 'text-white/60 border-white/20'}`}>{r.verdict}</span>
            )}
            {status === 'done' && <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Open report</span>}
            {status === 'done' && grantsDone && <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Grants matched</span>}
            {status === 'running' && (
              <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Generating
              </span>
            )}
            {status === 'failed' && <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 border border-red-400/30 rounded-md px-2 py-1">Failed · doesn’t use a free validation</span>}
          </span>
        </button>
        <div className="flex flex-col items-end gap-2">
          {grantsHref && (
            <a href={grantsHref} onClick={e => e.stopPropagation()} className="text-[10px] font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              Grants
            </a>
          )}
          <button onClick={onDelete} aria-label="Delete report" className="text-white/20 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
