import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';

const PHASES = [
  'Reading your idea',
  'Scoring the Syncoro IQ',
  'Mapping buyers and competitors',
  'Sizing the market without the hype',
  'Running the pre-mortem',
  'Assembling your report',
];

interface Props {
  /** When the run started (ms), so the timer and progress survive leaving and coming back. */
  startedAt: number;
  onBack: () => void;
}

// A run takes 1-3 minutes and continues on the server whether or not this screen is open.
export default function GeneratingScreen({ startedAt, onBack }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const secs = Math.max(0, Math.floor((now - startedAt) / 1000));
  const shown = Math.min(Math.floor(secs / 24), PHASES.length - 1);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center px-6 selection:bg-white selection:text-black">
      <button onClick={onBack} className="absolute top-6 left-6 md:left-12 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">
        <ArrowLeft size={14} /> My validations
      </button>
      <div className="w-full max-w-md">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-4">Generating</p>
        <h2 className="text-3xl md:text-4xl font-light tracking-tighter leading-tight">
          Building your <span className="font-semibold">validation report.</span>
        </h2>
        <ul className="mt-10 grid gap-4">
          {PHASES.map((p, i) => {
            const done = i < shown;
            const active = i === shown;
            return (
              <li key={p} className={`flex items-center gap-3 text-sm transition-colors ${done ? 'text-white/60' : active ? 'text-white' : 'text-white/20'}`}>
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${done ? 'bg-white text-black border-white' : active ? 'border-white/60' : 'border-white/15'}`}>
                  {done ? <Check size={12} /> : active ? <motion.span className="w-1.5 h-1.5 rounded-full bg-white" animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} /> : null}
                </span>
                {p}
              </li>
            );
          })}
        </ul>
        <p className="mt-10 text-xs text-white/40 leading-relaxed">
          This usually takes 1–3 minutes. You can leave this page — the report keeps generating and will be waiting in your history.
        </p>
        <p className="mt-2 text-[11px] font-mono text-white/25">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</p>
      </div>
    </div>
  );
}
