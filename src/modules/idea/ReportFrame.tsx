import { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react';
import { parseIdeaReport } from './report/parseReport';
import { buildReportDocument } from './report/buildReportHtml';

interface Props {
  markdown: string;
  grantsHref: string;
  onBack: () => void;
}

// The report is a self-contained HTML document rendered in an isolated iframe, so it keeps
// the exact template look and is unaffected by the site's Tailwind/global styles.
export default function ReportFrame({ markdown, grantsHref, onBack }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);

  const { doc, warnings } = useMemo(() => {
    const { data, warnings } = parseIdeaReport(markdown);
    return { doc: buildReportDocument(data, { grantsHref }), warnings };
  }, [markdown]);

  useEffect(() => {
    if (warnings.length) console.warn('[idea-report] parse warnings:', warnings);
  }, [warnings]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="h-12 flex-none flex items-center justify-between px-4 md:px-8 border-b border-white/10 text-white">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={14} /> My validations
        </button>
        <div className="flex items-center gap-2">
          <a href={grantsHref} className="flex items-center gap-2 text-xs font-semibold rounded-full bg-white text-black px-4 py-1.5 hover:bg-white/90 transition-colors">
            Check grants <ArrowRight size={14} />
          </a>
          <button
            onClick={() => ref.current?.contentWindow?.print()}
            className="flex items-center gap-2 text-xs font-semibold rounded-full border border-white/15 px-4 py-1.5 text-white/70 hover:text-white hover:border-white/30 transition-colors"
          >
            <Printer size={14} /> Save as PDF
          </button>
        </div>
      </div>
      <iframe ref={ref} title="Idea validation report" srcDoc={doc} className="flex-1 w-full border-0 bg-white" />
    </div>
  );
}
