import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Link2 } from 'lucide-react';
import { markWorkspaceOpen } from '../venture/landingGate';
import { parseIdeaReport } from './report/parseReport';
import { buildReportDocument } from './report/buildReportHtml';
import InputsPanel from './InputsPanel';
import { ideaApi } from './ideaApi';
import type { IdeaAnswers } from './types';

interface Props {
  markdown: string;
  grantsHref?: string;
  reportId?: string;
  answers?: IdeaAnswers;
  deckName?: string | null;
  shareOnly?: boolean;
  onBack?: () => void;
}

export default function ReportFrame({
  markdown,
  grantsHref,
  reportId,
  answers,
  deckName,
  shareOnly,
  onBack,
}: Props) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [showInputs, setShowInputs] = useState(!shareOnly);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'working' | 'copied' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [shareError, setShareError] = useState('');

  const { doc, warnings } = useMemo(() => {
    const { data, warnings } = parseIdeaReport(markdown);
    return { doc: buildReportDocument(data, { grantsHref: shareOnly ? undefined : grantsHref }), warnings };
  }, [markdown, grantsHref, shareOnly]);

  useEffect(() => {
    if (warnings.length) console.warn('[idea-report] parse warnings:', warnings);
  }, [warnings]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    lenis?.stop();
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, []);

  const copyText = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  const openShare = async () => {
    if (!reportId) return;
    if (shareOpen && shareUrl) {
      setShareOpen(false);
      return;
    }
    setShareOpen(true);
    if (shareUrl) return;
    setShareState('working');
    setShareError('');
    try {
      const token = await ideaApi.enableShare(reportId);
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
      await copyText(url);
      setShareState('copied');
    } catch (e) {
      setShareState('error');
      setShareError((e as Error).message || 'Could not create a share link.');
    }
  };

  const hasAnswers = Boolean(answers && (answers.idea || answers.startupName));

  return (
    <div className="vl-overlay fixed inset-0 z-50 flex flex-col">
      <div className="vl-overlay__top h-12 flex-none flex items-center justify-between gap-3 px-4 md:px-8">
        {shareOnly ? (
          <span className="text-xs tracking-wide" style={{ color: 'var(--vl-muted)' }}>VentureLab report</span>
        ) : (
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--vl-muted)' }}>
            <ArrowLeft size={14} /> Validate
          </button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          {hasAnswers && (
            <button
              type="button"
              onClick={() => setShowInputs(v => !v)}
              className={`vl-overlay__chip text-xs font-medium rounded-full px-4 py-1.5 transition-colors ${showInputs ? 'is-on' : ''}`}
            >
              {showInputs ? 'Hide your answers' : 'Your answers'}
            </button>
          )}
          {!shareOnly && reportId && (
            <button
              type="button"
              onClick={() => void openShare()}
              disabled={shareState === 'working'}
              className="vl-overlay__chip flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-1.5 transition-colors disabled:opacity-50"
            >
              {shareState === 'copied' ? <Check size={14} /> : <Link2 size={14} />}
              {shareState === 'working' ? 'Creating link…' : shareOpen ? 'Share link' : 'Share'}
            </button>
          )}
          {!shareOnly && grantsHref && (
            <a href={grantsHref} onClick={markWorkspaceOpen} className="vl-overlay__chip flex shrink-0 items-center gap-2 text-xs font-semibold rounded-full px-4 py-1.5">
              Grants <ArrowRight size={14} />
            </a>
          )}
        </div>
      </div>
      {shareError && <p className="px-4 md:px-8 py-2 text-xs text-red-500">{shareError}</p>}
      {shareOpen && !shareOnly && (
        <div className="vl-overlay__share flex-none px-4 md:px-8 py-3">
          <p className="text-xs font-medium">Anyone with this link can read the report. No sign-in needed.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={shareUrl || (shareState === 'working' ? 'Creating a link…' : '')}
              onFocus={e => e.currentTarget.select()}
              className="vl-overlay__field min-w-0 flex-1 rounded-lg px-3 py-2 text-xs outline-none"
            />
            <button
              type="button"
              disabled={!shareUrl}
              onClick={() => {
                if (!shareUrl) return;
                void copyText(shareUrl).then(() => setShareState('copied'));
              }}
              className="vl-overlay__chip flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
            >
              {shareState === 'copied' ? <Check size={13} /> : <Link2 size={13} />}
              {shareState === 'copied' ? 'Copied' : 'Copy'}
            </button>
            <button type="button" onClick={() => setShareOpen(false)} className="text-xs" style={{ color: 'var(--vl-muted)' }}>
              Hide
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0 flex">
        {hasAnswers && showInputs && answers && (
          <InputsPanel answers={answers} deckName={deckName} />
        )}
        <iframe ref={ref} title="Idea validation report" srcDoc={doc} className="flex-1 w-full border-0" style={{ background: '#fff' }} />
      </div>
    </div>
  );
}
