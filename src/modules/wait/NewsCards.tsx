import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export interface NewsItem {
  title: string;
  href: string;
  source: string;
  summary: string;
  image: string | null;
  published: string | null;
}

function when(iso: string | null) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 36) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NewsCards() {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    let alive = true;
    void fetch('/api/news')
      .then(r => r.json())
      .then(json => {
        if (alive && Array.isArray(json.items)) setItems(json.items);
      })
      .catch(() => {
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!items || items.length < 2) return;
    const t = setInterval(() => setI(n => (n + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items]);

  if (items === null) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">While you wait</p>
        <p className="mt-3 text-sm text-white/40">Loading India startup headlines…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">While you wait</p>
        <p className="mt-3 text-sm text-white/40">Headlines are unavailable right now. The report is still generating.</p>
      </div>
    );
  }

  const card = items[i];

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">While you wait</p>
          <p className="mt-1 text-sm text-white/50">India startup headlines · Microsoft News</p>
        </div>
        <p className="text-[10px] font-mono text-white/30">{String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</p>
      </div>

      <div className="relative h-[270px]">
        {[2, 1, 0].map(offset => (
          <div
            key={offset}
            className="absolute inset-x-0 top-0 rounded-2xl border border-white/10 bg-black"
            style={{
              transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.03})`,
              opacity: offset === 0 ? 1 : 0.35,
              zIndex: 3 - offset,
            }}
          />
        ))}
        <AnimatePresence mode="wait">
          <motion.a
            key={card.href}
            href={card.href}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-10 rounded-2xl border border-white/15 bg-[#0a0a0a] p-5 flex flex-col hover:border-white/30 transition-colors overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest text-white/40">
              <span>{card.source}</span>
              <span>{when(card.published)}</span>
            </div>
            <div className="mt-4 flex gap-4 min-h-0">
              {card.image && (
                <img
                  src={card.image}
                  alt=""
                  className="hidden sm:block w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0 bg-white/5"
                />
              )}
              <h3 className="text-lg md:text-xl font-semibold tracking-tight leading-snug">{card.title}</h3>
            </div>
            {card.summary && <p className="mt-3 text-sm text-white/45 leading-relaxed line-clamp-3">{card.summary}</p>}
            <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              Read headline <ArrowUpRight size={14} />
            </span>
          </motion.a>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {items.map((item, n) => (
          <button
            key={item.href}
            type="button"
            aria-label={`Headline ${n + 1}`}
            onClick={() => setI(n)}
            className={`h-1 flex-1 rounded-full ${n === i ? 'bg-white' : 'bg-white/15'}`}
          />
        ))}
      </div>
    </div>
  );
}
