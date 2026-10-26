import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import NewsCards from './NewsCards';

interface Props {
  eyebrow: string;
  title: ReactNode;
  note: string;
  phases: string[];
  startedAt: number;
  backLabel: string;
  onBack?: () => void;
}

export default function WaitNewsScreen({ eyebrow, title, note, phases, startedAt, backLabel, onBack }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const secs = Math.max(0, Math.floor((now - startedAt) / 1000));
  const shown = Math.min(Math.floor(secs / 24), phases.length - 1);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto selection:bg-white selection:text-black">
      {onBack && (
        <button onClick={onBack} className="absolute top-6 left-6 md:left-12 z-10 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={14} /> {backLabel}
        </button>
      )}

      <div className="min-h-full flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-5xl grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-4">{eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter leading-tight">{title}</h2>
            <ul className="mt-10 grid gap-4">
              {phases.map((p, i) => {
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
            <p className="mt-10 text-xs text-white/40 leading-relaxed">{note}</p>
            <p className="mt-2 text-[11px] font-mono text-white/25">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</p>
          </div>
          <NewsCards />
        </div>
      </div>
    </div>
  );
}
