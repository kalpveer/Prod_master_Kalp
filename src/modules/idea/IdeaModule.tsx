import { useCallback, useEffect, useState } from 'react';
import { FileText, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import IdeaForm, { type FormBusy } from './IdeaForm';
import ReportView from './ReportView';
import { ideaApi } from './ideaApi';
import { STALE_RUN_MS, type IdeaAnswers, type IdeaReportSummary } from './types';

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
  const { user, signOut } = useAuth();
  const [reports, setReports] = useState<IdeaReportSummary[] | null>(null);
  const [listError, setListError] = useState('');
  const [openId, setOpenId] = useState<string | null>(reportFromUrl);
  const [busy, setBusy] = useState<FormBusy>(null);
  const [formError, setFormError] = useState('');
  const [prefill, setPrefill] = useState<Partial<IdeaAnswers> | undefined>();
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    document.title = 'Idea Validation · Productica';
  }, []);

  // keep the open report in the URL so a refresh or the browser back button behaves
  useEffect(() => {
    const sync = () => setOpenId(reportFromUrl());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const open = (id: string) => {
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
      setReports(await ideaApi.list());
      setListError('');
    } catch (e) {
      setListError((e as Error).message);
    }
  }, []);

  // reload the list whenever we are back on it, and keep it fresh while something is generating
  const running = reports?.some(r => r.status === 'running' && !isStale(r)) ?? false;
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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <header className="flex items-center justify-between gap-4 px-6 md:px-12 py-6">
        <a href="/" className="text-lg font-semibold tracking-tight">Productica</a>
        <div className="flex items-center gap-4 min-w-0">
          <span className="hidden sm:block text-xs text-white/40 truncate">{user?.email}</span>
          <button onClick={() => void signOut()} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-12 pt-10 md:pt-16 pb-28">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-5">Syncoro IQ · Venture Diagnostic</p>
        <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-[1.02]">
          Is your idea <span className="font-semibold">worth building?</span>
        </h1>
        <p className="mt-5 text-base md:text-lg text-white/50 max-w-xl">
          Answer four questions, add your deck if you have one, and get an evidence-scored validation report. It is saved to your account.
        </p>

        <div className="mt-12">
          <IdeaForm key={formKey} initial={prefill} busy={busy} error={formError} onSubmit={submit} />
        </div>

        <section className="mt-24">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-6">Your validations</p>
          {listError && <p role="alert" className="mb-4 text-sm text-red-500">{listError}</p>}
          {reports === null ? (
            <p className="text-sm text-white/30">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-white/40">Nothing yet. Your reports will appear here.</p>
          ) : (
            <div className="grid gap-3">
              {reports.map(r => <HistoryRow key={r.id} r={r} onOpen={() => open(r.id)} onDelete={() => void remove(r)} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function HistoryRow({ r, onOpen, onDelete }: { r: IdeaReportSummary; onOpen: () => void; onDelete: () => void }) {
  const stale = isStale(r);
  const status = stale ? 'failed' : r.status;
  const title = r.title || (r.idea.length > 70 ? `${r.idea.slice(0, 70)}…` : r.idea);
  const verdict = r.verdict?.toLowerCase() ?? '';

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25 transition-colors px-5 py-4">
      <button onClick={onOpen} className="flex-1 min-w-0 text-left">
        <span className="block text-base md:text-lg font-semibold tracking-tight truncate">{title}</span>
        <span className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
          <span className="truncate">
            {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {r.stage}
          </span>
          {r.deck_name && <FileText size={12} className="flex-none" aria-label="Includes pitch deck" />}
        </span>
      </button>

      {status === 'done' && r.iq != null && <span className="hidden sm:block text-sm font-mono text-white/60">IQ {Number(r.iq).toFixed(1)}</span>}
      {status === 'done' && r.verdict && (
        <span className={`text-[10px] font-mono uppercase tracking-widest border rounded-md px-2 py-1 ${VERDICT_STYLE[verdict] || 'text-white/60 border-white/20'}`}>{r.verdict}</span>
      )}
      {status === 'running' && (
        <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Generating
        </span>
      )}
      {status === 'failed' && <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 border border-red-400/30 rounded-md px-2 py-1">Failed</span>}

      <button onClick={onDelete} aria-label="Delete report" className="text-white/20 hover:text-red-400 transition-colors">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
