/* eslint-disable */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// --- SPIS BENTO DASHBOARD COMPONENT ---
function SPISBentoDashboard() {
  const stripRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stripProgress } = useScroll({
    target: stripRef,
    offset: ["start end", "end center"]
  });
  const stripClipPath = useTransform(stripProgress, [0, 1], ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"]);

  const spisItems = [
    { title: "Venture-building frameworks", desc: "Evaluates idea feasibility and market readiness using structured institutional risk-mapping." },
    { title: "Startup diagnostics", desc: "Identifies core operational weaknesses, founder blind spots, and early venture execution risks." },
    { title: "GTM intelligence", desc: "Maps clear customer acquisition pathways, positioning strength, and distribution viability." },
    { title: "Startup scoring systems", desc: "Quantifies venture progress against proven metrics rather than arbitrary milestones." }
  ];

  return (
    <section
      id="spis"
      className="relative w-full border-t border-[#E8E8E8] overflow-hidden"
      style={{ background: '#F8F8F6' }}
    >
      {/* Subtle radial background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.015) 0%, transparent 70%)' }}
        />
        {/* Very subtle paper texture grid */}
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28 lg:py-32">

        {/* ── DESKTOP LAYOUT: Left intro (40%) + Right bento grid (60%) ── */}
        <div className="hidden lg:flex gap-8">

          {/* Left Featured Card — visually dominant */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-[40%] shrink-0"
          >
            <div
              className="h-full rounded-2xl border border-[#E8E8E8] p-10 xl:p-12 flex flex-col justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #FFFFFF 0%, #F8F8F6 100%)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.03)'
              }}
            >
              {/* Geometric accent — large faint circle */}
              <div className="absolute -right-24 -bottom-24 w-[320px] h-[320px] rounded-full border border-black/[0.03] pointer-events-none" />
              <div className="absolute -right-16 -bottom-16 w-[240px] h-[240px] rounded-full border border-black/[0.02] pointer-events-none" />

              <span className="text-[10px] font-mono tracking-[0.4em] text-black/40 uppercase mb-6 block relative z-10">
                [ Intelligence Engine ]
              </span>
              <h2 className="text-4xl xl:text-5xl font-light tracking-tighter leading-[1.05] mb-5 text-black relative z-10">
                The Syncoro Productica{' '}
                <span className="text-black/35">Intelligence System.</span>
              </h2>
              <div className="w-10 h-px bg-black/10 mb-5 relative z-10" />
              <p className="text-black/55 text-base xl:text-lg leading-relaxed font-light relative z-10 max-w-sm">
                SPIS powers Productica's reports, agents, dashboards, and startup evaluation algorithms from the ground up.
              </p>
            </div>
          </motion.div>

          {/* Right Bento Grid — 2 columns × 3 rows */}
          <div className="w-[60%] grid grid-cols-2 gap-6">
            {spisItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.1 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl border border-[#E8E8E8] p-7 xl:p-8 flex flex-col justify-between overflow-hidden cursor-default"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)',
                  transition: 'transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease',
                  minHeight: '220px',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.06)';
                  el.style.borderColor = '#D0D0D0';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)';
                  el.style.borderColor = '#E8E8E8';
                }}
              >
                {/* Geometric background element */}
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-black/[0.015] group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                {/* Construction crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-px bg-black/[0.04] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-5 bg-black/[0.04] pointer-events-none" />

                {/* Header row */}
                <div className="flex justify-between items-start relative z-10 mb-5">
                  <span className="text-xs font-mono text-black/35">({idx + 1})</span>
                  <span className="text-[9px] font-mono tracking-[0.2em] text-black/20 uppercase">SPIS Module</span>
                </div>

                {/* Description */}
                <div className="relative z-10 flex-grow flex items-center mb-5 pr-2">
                  <p className="text-[13px] text-black/45 leading-relaxed font-light font-mono">
                    {item.desc}
                  </p>
                </div>

                {/* Divider + Title */}
                <div className="relative z-10">
                  <div className="w-8 h-px bg-black/15 mb-4" />
                  <h3 className="text-xl xl:text-2xl font-medium tracking-tight text-black/70 group-hover:text-black capitalize leading-snug transition-colors duration-300">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            ))}

            {/* Final Summary Card — spans full bottom row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="col-span-2 rounded-2xl p-8 xl:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden"
              style={{
                background: '#0A0A0A',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                minHeight: '160px',
              }}
            >
              {/* Subtle grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              />

              <h3 className="text-xl xl:text-2xl font-light tracking-tight leading-relaxed text-white/90 relative z-10 max-w-3xl">
                This enables Productica to generate structured, contextual startup intelligence. It replaces generic AI outputs.
              </h3>
            </motion.div>
          </div>
        </div>

        {/* ── TABLET LAYOUT: Intro full-width, 2-col modules ── */}
        <div className="hidden md:block lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl border border-[#E8E8E8] p-8 mb-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #FFFFFF 0%, #F8F8F6 100%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.03)'
            }}
          >
            <div className="absolute -right-16 -bottom-16 w-[200px] h-[200px] rounded-full border border-black/[0.03] pointer-events-none" />
            <span className="text-[10px] font-mono tracking-[0.4em] text-black/40 uppercase mb-4 block">
              [ Intelligence Engine ]
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter leading-[1.05] mb-4 text-black">
              The Syncoro Productica{' '}
              <span className="text-black/35">Intelligence System.</span>
            </h2>
            <div className="w-10 h-px bg-black/10 mb-4" />
            <p className="text-black/55 text-base md:text-lg leading-relaxed font-light max-w-lg">
              SPIS powers Productica's reports, agents, dashboards, and startup evaluation algorithms from the ground up.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {spisItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group rounded-2xl border border-[#E8E8E8] bg-white p-6 flex flex-col justify-between relative overflow-hidden"
                style={{ minHeight: '200px', boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)' }}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-black/[0.015] pointer-events-none" />
                <div className="flex justify-between items-start relative z-10 mb-4">
                  <span className="text-xs font-mono text-black/35">({idx + 1})</span>
                  <span className="text-[9px] font-mono tracking-[0.2em] text-black/20 uppercase">SPIS Module</span>
                </div>
                <p className="text-[12px] text-black/45 leading-relaxed font-light font-mono mb-4 relative z-10">{item.desc}</p>
                <div className="relative z-10">
                  <div className="w-8 h-px bg-black/15 mb-3" />
                  <h3 className="text-xl font-medium tracking-tight text-black/70 capitalize leading-snug">{item.title}</h3>
                </div>
              </motion.div>
            ))}

            {/* Summary card */}
            <div
              className="col-span-2 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
              style={{ background: '#0A0A0A', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', minHeight: '140px' }}
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <h3 className="text-lg md:text-xl font-light tracking-tight leading-relaxed text-white/90 relative z-10 max-w-2xl">
                This enables Productica to generate structured, contextual startup intelligence.<br className="hidden md:block" /> It replaces generic AI outputs.
              </h3>
            </div>
          </div>
        </div>

        {/* ── MOBILE LAYOUT: Single column stacked ── */}
        <div className="block md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-[#E8E8E8] p-6 mb-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #FFFFFF 0%, #F8F8F6 100%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.03)'
            }}
          >
            <span className="text-[10px] font-mono tracking-[0.4em] text-black/40 uppercase mb-4 block">
              [ Intelligence Engine ]
            </span>
            <h2 className="text-3xl font-light tracking-tighter leading-[1.1] mb-3 text-black">
              The Syncoro Productica{' '}
              <span className="text-black/35">Intelligence System.</span>
            </h2>
            <div className="w-8 h-px bg-black/10 mb-3" />
            <p className="text-black/55 text-sm leading-relaxed font-light">
              SPIS powers Productica's reports, agents, dashboards, and startup evaluation algorithms from the ground up.
            </p>
          </motion.div>

          <div className="flex flex-col gap-5">
            {spisItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="rounded-2xl border border-[#E8E8E8] bg-white p-5 flex flex-col justify-between relative overflow-hidden"
                style={{ minHeight: '180px', boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)' }}
              >
                <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-black/[0.015] pointer-events-none" />
                <div className="flex justify-between items-start relative z-10 mb-4">
                  <span className="text-xs font-mono text-black/35">({idx + 1})</span>
                  <span className="text-[9px] font-mono tracking-[0.2em] text-black/20 uppercase">SPIS Module</span>
                </div>
                <p className="text-[12px] text-black/45 leading-relaxed font-light font-mono mb-4 relative z-10">{item.desc}</p>
                <div className="relative z-10">
                  <div className="w-8 h-px bg-black/15 mb-3" />
                  <h3 className="text-lg font-medium tracking-tight text-black/70 capitalize leading-snug">{item.title}</h3>
                </div>
              </motion.div>
            ))}

            {/* Summary card */}
            <div
              className="rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
              style={{ background: '#0A0A0A', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', minHeight: '120px' }}
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <h3 className="text-base md:text-lg font-light tracking-tight leading-relaxed text-white/90 relative z-10 max-w-lg">
                This enables Productica to generate structured, contextual startup intelligence.<br />It replaces generic AI outputs.
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Black Quote Strip — reveals left-to-right via clipPath */}
      <div ref={stripRef} className="w-full relative overflow-hidden py-1">
        <motion.div
          style={{ clipPath: stripClipPath }}
          className="w-full bg-black py-6 md:py-8"
        >
          <p className="text-base md:text-xl xl:text-2xl italic font-light text-center px-6 max-w-4xl mx-auto text-white/90">
            "The reports are outputs. SPIS is the intelligence infrastructure behind them."
          </p>
        </motion.div>
      </div>

      {/* Light whitespace below the strip */}
      <div className="w-full bg-[#F5F5F3] h-10 md:h-16" />

    </section>
  );
}

export default function EcosystemDifference() {
  // Homepage no longer renders the "Who Productica Serves" orbit —
  // that identity split lives in WhyChooseProductica (after Agents).
  // This component keeps SPIS / intelligence stack proof only.
  return <SPISBentoDashboard />;
}
