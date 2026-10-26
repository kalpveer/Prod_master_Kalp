import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import GeneratingScreen from './GeneratingScreen';
import ReportFrame from './ReportFrame';
import { ideaApi } from './ideaApi';
import { writeWorkspace } from '../workspace';
import { STALE_RUN_MS, type IdeaAnswers, type IdeaReport } from './types';

interface Props {
  id: string;
  onBack: () => void;
  onRetry: (answers: IdeaAnswers) => void;
}

const POLL_MS = 4000;

function Message({ title, body, onBack, action }: { title: string; body: string; onBack: () => void; action?: { label: string; run: () => void } }) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md">
        <AlertTriangle size={20} className="text-red-500 mb-4" />
        <h2 className="text-3xl font-light tracking-tighter">{title}</h2>
        <p className="mt-3 text-sm text-white/50">{body}</p>
        <div className="mt-8 flex items-center gap-5">
          {action && (
            <button onClick={action.run} className="bg-white text-black text-sm font-semibold rounded-full px-6 py-3 hover:bg-white/90 active:scale-[0.97] transition-all">
              {action.label}
            </button>
          )}
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={14} /> My validations
          </button>
        </div>
      </div>
    </div>
  );
}

// One saved report: follows it while it is being generated, then shows the finished HTML report.
export default function ReportView({ id, onBack, onRetry }: Props) {
  const [report, setReport] = useState<IdeaReport | null | undefined>(undefined); // undefined = loading, null = not found
  const [loadError, setLoadError] = useState('');
  const [now, setNow] = useState(() => Date.now()); // refreshed on every poll, used for the stale-run check

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const r = await ideaApi.get(id);
        if (!alive) return;
        setReport(r);
        setNow(Date.now());
        setLoadError('');
        if (r) writeWorkspace({ ideaId: r.id, venture: r.title || r.idea, stage: r.stage });
        if (r?.status === 'running') timer = setTimeout(load, POLL_MS);
      } catch (e) {
        if (!alive) return;
        setLoadError((e as Error).message);
        timer = setTimeout(load, POLL_MS * 2);
      }
    };
    void load();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [id]);

  if (report === undefined) {
    return loadError ? (
      <Message title="Could not load this report" body={loadError} onBack={onBack} />
    ) : (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (report === null) return <Message title="Report not found" body="It may have been deleted." onBack={onBack} />;

  const answers: IdeaAnswers = { idea: report.idea, audience: report.audience, different: report.different, stage: report.stage };
  const startedAt = new Date(report.created_at).getTime();

  if (report.status === 'running') {
    if (now - startedAt > STALE_RUN_MS) {
      return <Message title="This run did not finish" body="Something interrupted it. Your answers are saved, so you can try again." onBack={onBack} action={{ label: 'Edit and try again', run: () => onRetry(answers) }} />;
    }
    return <GeneratingScreen startedAt={startedAt} onBack={onBack} />;
  }

  if (report.status === 'failed' || !report.markdown) {
    return <Message title="We couldn’t finish this report" body={report.error || 'Please try again.'} onBack={onBack} action={{ label: 'Edit and try again', run: () => onRetry(answers) }} />;
  }

  return <ReportFrame markdown={report.markdown} grantsHref={`/grants?idea=${report.id}`} onBack={onBack} />;
}
