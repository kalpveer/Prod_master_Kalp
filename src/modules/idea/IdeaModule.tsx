import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, FileText, Trash2 } from 'lucide-react';
import { PrismaHero } from '@/components/ui/prisma-hero';
import { useAuth } from '../../auth/useAuth';
import ToolChrome from '../ToolChrome';
import ToolLanding from '../ToolLanding';
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

export default function IdeaModule() {
  const { user, displayName, signOut } = useAuth();
  const [reports, setReports] = useState<IdeaReportSummary[] | null>(null);
  const [usedFree, setUsedFree] = useState<number | null>(null);
  const [listError, setListError] = useState('');
  const [openId, setOpenId] = useState<string | null>(reportFromUrl);
  const [busy, setBusy] = useState<FormBusy>(null);
  const [formError, setFormError] = useState('');
  const [prefill, setPrefill] = useState<Partial<IdeaAnswers> | undefined>();
  const [formKey, setFormKey] = useState(0);
  const [grantByIdea, setGrantByIdea] = useState<Record<string, string>>({});
  const [entered, setEntered] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('from') === 'grants' || Boolean(params.get('r'));
  });

  useEffect(() => {
    document.title = 'Validate · VentureLab';
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
    const venture = ws.venture?.trim() || '';
    const startupName = ws.startupName?.trim()
      || (venture && venture.length <= 80 && !ws.idea ? venture : '');
    const idea = ws.idea?.trim() || (venture.length > 80 ? venture : '');
    if (!startupName && !idea && !ws.audience && !ws.different && !ws.stage) return;
    setPrefill({
      startupName,
      idea,
      audience: ws.audience || '',
      different: ws.different || '',
      stage: ws.stage || '',
    });
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
      writeWorkspace({
        venture: answers.startupName,
        startupName: answers.startupName,
        idea: answers.idea,
        audience: answers.audience,
        different: answers.different,
        stage: answers.stage,
      });
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

  if (!entered) {
    return (
      <ToolLanding
        title="Validate"
        eyebrow="Idea validation"
        description="Big ideas deserve better than guesswork."
        detail="Validate your startup idea with AI-powered market insights, competitor analysis, and product-market fit intelligence. Know your opportunity before you build."
        ctaLabel="Start a validation"
        onEnter={() => setEntered(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <ToolChrome active="idea" account={displayName} onSignOut={() => void signOut()}>
        <a href="#validate" className="text-white/40 hover:text-white transition-colors">New validation</a>
        <a href="#history" className="text-white/40 hover:text-white transition-colors">History</a>
      </ToolChrome>

      <main className="max-w-6xl mx-auto px-6 md:px-12 pt-8 pb-28">
        <section className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <PrismaHero
            compact
            title="Validate"
            description="Name the startup. Get a scored report. Then match grants on the same venture."
            ctaLabel={remaining === 0 ? 'Your reports' : 'New validation'}
            ctaHref={remaining === 0 ? '#history' : '#validate'}
            secondary={{ label: 'Open Grants', href: '/grants' }}
          />
          <aside id="history" className="flex h-full min-h-[280px] max-h-[520px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] scroll-mt-8">
            <div className="px-5 pt-5">
              <Allowance used={used} />
            </div>
            <div className="mx-5 mt-4 border-t border-white/10" />
            <div className="px-5 pt-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Your validations</p>
              <p className="mt-1 text-sm text-white/40">Saved on this account.</p>
            </div>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              {listError && <p role="alert" className="mb-3 text-sm text-red-500">{listError}</p>}
              {reports === null ? (
                <p className="text-sm text-white/30">Loading your reports…</p>
              ) : reports.length === 0 ? (
                <p className="text-sm text-white/40">Finished reports show up here.</p>
              ) : (
                <div>
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
              <p className="mt-3 text-xs text-white/30">Deleting a report does not restore a free validation.</p>
            </div>
          </aside>
        </section>

        <section id="validate" className="mx-auto mt-14 w-full max-w-5xl scroll-mt-8">
          <div className="mb-6 text-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-3">New validation</p>
            <h2 className="text-xl font-semibold tracking-tight">
              {remaining === 0 ? 'Free validations used' : 'New validation'}
            </h2>
          </div>
          {remaining === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
              <p className="text-sm text-white/55 leading-relaxed">
                All {FREE_IDEA_LIMIT} free reports are saved. Open one to read it, or send it to Grants.
              </p>
              <a href="#history" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-white hover:text-white/70 transition-colors">
                Open your history <ArrowRight size={16} />
              </a>
            </div>
          ) : (
            <IdeaForm key={formKey} initial={prefill} busy={busy} error={formError} blocked={blocked} onSubmit={submit} />
          )}
        </section>
      </main>
    </div>
  );
}

function Allowance({ used }: { used: number | null }) {
  const spent = used === null ? 0 : Math.min(used, FREE_IDEA_LIMIT);
  const remaining = used === null ? null : Math.max(0, FREE_IDEA_LIMIT - used);

  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Free validations</p>
      <p className="mt-2 text-3xl font-light tracking-tight">
        {remaining === null ? (
          <span className="text-white/35 text-xl">Checking your account…</span>
        ) : (
          <>
            <span className="font-semibold">{remaining}</span>
            <span className="text-white/45"> left</span>
          </>
        )}
      </p>
      {used !== null && (
        <p className="mt-1 text-sm text-white/40">
          {used === 0
            ? `None used yet · ${FREE_IDEA_LIMIT} free on this account`
            : `${used} used · ${FREE_IDEA_LIMIT} free on this account`}
        </p>
      )}
      <div
        className="mt-4 flex items-center gap-2"
        aria-label={remaining === null ? 'Loading remaining validations' : `${remaining} left, ${spent} used of ${FREE_IDEA_LIMIT}`}
      >
        {Array.from({ length: FREE_IDEA_LIMIT }, (_, i) => {
          const taken = i < spent;
          return (
            <span
              key={i}
              className={`block h-1.5 flex-1 rounded-full ${taken ? 'bg-white/20' : 'bg-white'}`}
              title={taken ? 'Used' : 'Available'}
            />
          );
        })}
      </div>
    </div>
  );
}

function HistoryRow({ r, grantsHref, grantsDone, onOpen, onDelete }: { r: IdeaReportSummary; grantsHref?: string; grantsDone?: boolean; onOpen: () => void; onDelete: () => void }) {
  const stale = isStale(r);
  const status = stale ? 'failed' : r.status;
  const title = r.startup_name?.trim() || r.title || (r.idea.length > 70 ? `${r.idea.slice(0, 70)}…` : r.idea);
  const verdict = r.verdict?.toLowerCase() ?? '';

  return (
    <div className="border-b border-white/10 py-3 last:border-b-0">
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
