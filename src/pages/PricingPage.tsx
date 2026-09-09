/* eslint-disable */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus, Plus, Check, ArrowRight, Zap, Users, TrendingUp,
  BarChart2, Lightbulb, Target, DollarSign, Rocket, Activity, BrainCircuit,
  Sparkles, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { generateRecommendedJourney } from '../data/moduleDependencies';
import { JOURNEYS, type Journey } from '../data/journeys';
import {
  DASHBOARD_CREDIT_PACKS,
  DASHBOARD_BILLING_URL,
  CREDIT_FX_NOTE,
  formatUsd,
} from '../data/dashboardCreditPacks';
import {
  AGENT_USE_CASES,
  AGENT_DISPLAY_NAMES,
  AGENT_CREDIT_PACKS,
  AGENT_CREDIT_FX_NOTE,
  AGENTS_BUY_CREDITS_URL,
  ULTRAPLANNER_PRICE,
  formatInrPrimary,
  formatUltraPlannerFee,
  estimateCustomGoalCredits,
  type AgentId,
} from '../data/agentCredits';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

export const CREDIT_PACKAGES = AGENT_CREDIT_PACKS.map((p) => ({
  credits: p.credits,
  price: p.usdPrice,
  name: p.name,
  inrRange: p.inrRange,
  inrWasRange: p.inrWasRange,
}));

export const DASHBOARD_MODULES = [
  { id: 'idea-validation',       name: 'Idea Validation Advanced',   icon: Lightbulb,  credits: 2 },
  { id: 'market-research',       name: 'Market Research',            icon: BarChart2,  credits: 5 },
  { id: 'competitor-analysis',   name: 'Competition Analysis',       icon: TrendingUp, credits: 7 },
  { id: 'icp',                   name: 'ICP',                        icon: Target,     credits: 4 },
  { id: 'business-model-canvas', name: 'BMC',                        icon: Activity,   credits: 3 },
  { id: 'go-to-market',          name: 'GTM',                        icon: Rocket,     credits: 6 },
  { id: 'finance-estimation',    name: 'Finance Estimation',         icon: DollarSign, credits: 4 },
  { id: 'pitch-investor-hub',    name: 'Pitch Hub & Investor',       icon: Users,      credits: 6 },
  { id: 'startup-health',        name: 'Startup Health Diagnostics', icon: Zap,        credits: 3 },
];

const MODULE_NAME_MAP = Object.fromEntries(DASHBOARD_MODULES.map(m => [m.id, m.name]));
const MODULE_ICON_MAP = Object.fromEntries(DASHBOARD_MODULES.map(m => [m.id, m.icon]));
const MODULE_CREDIT_MAP = Object.fromEntries(DASHBOARD_MODULES.map(m => [m.id, m.credits]));

function sumModuleCredits(moduleIds: string[]): number {
  return moduleIds.reduce((sum, id) => sum + (MODULE_CREDIT_MAP[id] ?? 0), 0);
}

const AGENT_LIST = [
  {
    id: 'co-founder',
    name: 'Co-Founder',
    icon: BrainCircuit,
    tagline: 'Your strategic thinking partner',
    paid: false as const,
    price: null as number | null,
    useCases: ['Brainstorming', 'Product refinement', 'Product feedback', 'Pitch readiness'],
    capabilities: [
      'Challenge assumptions and pressure-test ideas',
      'Shape product direction with structured critique',
      'Prep founder narratives for investors and teams',
      'Turn vague goals into actionable next steps',
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: TrendingUp,
    tagline: 'Your growth and messaging engine',
    paid: false as const,
    price: null as number | null,
    useCases: ['Marketing plan', 'Campaign strategy', 'Positioning'],
    capabilities: [
      'Build go-to-market and campaign plans',
      'Craft messaging for your ICP and channels',
      'Map funnels, content themes, and launch beats',
      'Translate product value into clear marketing angles',
    ],
  },
  {
    id: 'ultraplan',
    name: 'UltraPlanner',
    icon: Rocket,
    tagline: 'Compliance, documentation & startup planning',
    paid: true as const,
    price: 6.99,
    useCases: ['Company compliance readiness', 'Documentation', 'Startup planning'],
    capabilities: [
      'Handle compliance readiness and company ops checks',
      'Draft and structure startup documentation',
      'Build execution plans, SOPs, and planning checklists',
      'Keep founders aligned on process, ownership, and next steps',
    ],
  },
] as const;

const AGENT_IMAGES: Record<AgentId, string> = {
  'co-founder': '/Cofounder.gif',
  'marketing':  '/marketing.gif',
  'ultraplan':  '/Ultraplan.gif',
};

const AGENT_NAME_MAP = AGENT_DISPLAY_NAMES;
const AGENT_META_MAP = Object.fromEntries(AGENT_LIST.map(a => [a.id, a])) as Record<
  AgentId,
  (typeof AGENT_LIST)[number]
>;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block tabular-nums"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDED JOURNEY — Horizontal Roadmap with Effortless Scrolling & Zero Overlap
// ─────────────────────────────────────────────────────────────────────────────

// Canvas geometry constants for horizontal roadmap
const NODE_W    = 170;  // card width (px)
const NODE_STEP = 210;  // horizontal interval between step centers (px)
const ROW_Y_TOP = 20;   // y-top for upper cards
const ROW_Y_BOT = 224;  // y-top for lower cards
const CANVAS_H  = 340;  // total canvas height (px)

function RecommendedJourney({
  selectedModuleIds,
  extraPromptCredits,
  onSelectFlow,
}: {
  selectedModuleIds: Set<string>;
  extraPromptCredits: number;
  onSelectFlow: (moduleIds: string[]) => void;
}) {
  const journey = useMemo(
    () => generateRecommendedJourney(Array.from(selectedModuleIds)),
    [selectedModuleIds]
  );

  const flowModuleCredits = sumModuleCredits(journey);
  const flowRequiredPromptCredits = journey.length;
  const flowTotalCredits = flowModuleCredits + flowRequiredPromptCredits + extraPromptCredits;
  const allFlowSelected = journey.length > 0 && journey.every(id => selectedModuleIds.has(id));

  const handleSelectFlow = useCallback(() => {
    onSelectFlow(journey);
  }, [journey, onSelectFlow]);


  const [svgPath, setSvgPath] = useState('');
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build smooth cubic-Bézier S-curve connecting ONLY the circular milestone dots on the track
  const buildPath = useCallback(() => {
    if (journey.length === 0) return;
    const pts = journey.map((_, idx) => {
      const isTop = idx % 2 === 0;
      return {
        x: 130 + idx * NODE_STEP,
        y: isTop ? 155 : 185, // milestone dot centers
      };
    });

    if (pts.length === 1) {
      setSvgPath(`M 40 170 L ${pts[0].x} 170 L ${pts[0].x + 80} 170`);
      return;
    }

    let d = `M 40 170`;
    for (let i = 0; i < pts.length; i++) {
      const p = i === 0 ? { x: 40, y: 170 } : pts[i - 1];
      const c = pts[i];
      const midX = (p.x + c.x) / 2;
      d += ` C ${midX} ${p.y}, ${midX} ${c.y}, ${c.x} ${c.y}`;
    }
    const last = pts[pts.length - 1];
    const endX = last.x + 80;
    const midX = (last.x + endX) / 2;
    d += ` C ${midX} ${last.y}, ${midX} 170, ${endX} 170`;

    setSvgPath(d);
  }, [journey]);

  // Update left/right navigation button states
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 20);
    setCanScrollRight(
      el.scrollWidth > el.clientWidth &&
        el.scrollLeft + el.clientWidth < el.scrollWidth - 20
    );
  }, []);

  const scrollCanvas = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -420 : 420;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      buildPath();
      updateScrollButtons();
    }, 50);
    window.addEventListener('resize', buildPath);
    return () => { clearTimeout(t); window.removeEventListener('resize', buildPath); };
  }, [buildPath, updateScrollButtons]);

  // Drag-to-scroll state for smooth mouse dragging without page scroll jitter
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeftStart.current = scrollRef.current?.scrollLeft || 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeaveOrUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
    updateScrollButtons();
  };

  // Passive scroll listener for updateScrollButtons (no wheel hijacking)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    updateScrollButtons();
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
    };
  }, [updateScrollButtons, journey.length]);

  if (selectedModuleIds.size === 0) return null;

  // Generous right padding (200px after last step) so the final card & COMPLETE marker are never clipped
  const totalW = Math.max(760, 130 + (journey.length - 1) * NODE_STEP + 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-2xl overflow-hidden shadow-2xl scroll-mt-28"
      id="recommended-flow"
    >
      {/* ── Header with Interactive Scroll Controls ── */}
      <div className="px-6 md:px-10 pt-8 pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70">
              Recommended Flow
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            Your Optimal Startup Roadmap
          </h3>
          <p className="text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
            We recommend completing these modules in order. Each step builds upon insights from the previous one.
          </p>
        </div>

        {/* Scroll navigation arrows + total step counter */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          {journey.length > 3 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollCanvas('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-xl border transition-all ${
                  canScrollLeft
                    ? 'bg-white/15 border-white/25 text-white hover:bg-white/25 cursor-pointer shadow-md'
                    : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCanvas('right')}
                disabled={!canScrollRight}
                className={`p-2 rounded-xl border transition-all ${
                  canScrollRight
                    ? 'bg-white/15 border-white/25 text-white hover:bg-white/25 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <span className="text-xs text-white/60 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 font-mono">
            {journey.length} {journey.length === 1 ? 'Step' : 'Steps'} Total
          </span>
          <button
            type="button"
            onClick={handleSelectFlow}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.45)] shrink-0"
          >
            {allFlowSelected
              ? `Flow Selected (${flowTotalCredits} Cr)`
              : `Buy Estimated Flow (${flowTotalCredits} ${flowTotalCredits === 1 ? 'Credit' : 'Credits'})`}
            {allFlowSelected ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Horizontal Scrollable Roadmap Canvas ── */}
      <div className="relative">
        {/* Floating Left Navigation Button & Fade Overlay */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0e] via-[#0a0a0e]/70 to-transparent z-20 pointer-events-none flex items-center pl-4"
            >
              <button
                onClick={() => scrollCanvas('left')}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-xl pointer-events-auto transition-all hover:scale-110 active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Right Navigation Button & Fade Overlay */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#0a0a0e] via-[#0a0a0e]/70 to-transparent z-20 pointer-events-none flex items-center justify-end pr-4"
            >
              <button
                onClick={() => scrollCanvas('right')}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-xl pointer-events-auto transition-all hover:scale-110 active:scale-95 animate-pulse"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className="overflow-x-auto overflow-y-hidden px-6 md:px-10 py-6 cursor-grab active:cursor-grabbing select-none"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'auto' }}
        >
          <div
            ref={wrapRef}
            className="relative select-none"
            style={{ width: totalW, height: CANVAS_H }}
          >
            {/* ── SVG Bézier Track Layer ── */}
            <svg
              className="absolute inset-0 pointer-events-none overflow-visible"
              style={{ width: totalW, height: CANVAS_H, zIndex: 0 }}
            >
              <defs>
                <filter id="rj-glow-clean" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Ghost track rail */}
              {svgPath && (
                <path
                  d={svgPath}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Animated dashed white stroke with glow */}
              {svgPath && (
                <motion.path
                  d={svgPath}
                  fill="none"
                  stroke="rgba(255,255,255,0.65)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.15 }}
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}
                />
              )}
            </svg>

            {/* ── START ORB (Left Edge) ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
              style={{ left: 40, top: 170 }}
            >
              <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#fff]"
                />
              </div>
              <span className="absolute top-12 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 whitespace-nowrap font-medium">
                START
              </span>
            </motion.div>

            {/* ── Step Nodes & Cards ── */}
            {journey.map((moduleId, idx) => {
              const isSelected = selectedModuleIds.has(moduleId);
              const isLast     = idx === journey.length - 1;
              const isTop      = idx % 2 === 0;
              const cardY      = isTop ? ROW_Y_TOP : ROW_Y_BOT;
              const dotY       = isTop ? 155 : 185;
              const leftPx     = 130 + idx * NODE_STEP;
              const cardDelay  = 0.08 + idx * 0.07;
              const Icon       = MODULE_ICON_MAP[moduleId] || Sparkles;

              return (
                <div key={moduleId}>
                  {/* Milestone Dot on Track */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: cardDelay + 0.1 }}
                    className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                    style={{ left: leftPx, top: dotY }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected && isLast
                          ? 'border-white bg-black shadow-[0_0_15px_rgba(255,255,255,0.8)]'
                          : isSelected
                          ? 'border-white/80 bg-black'
                          : 'border-white/25 bg-black'
                      }`}
                    >
                      <div
                        className={`rounded-full transition-all ${
                          isSelected && isLast
                            ? 'w-2.5 h-2.5 bg-white shadow-[0_0_8px_#fff]'
                            : isSelected
                            ? 'w-2 h-2 bg-white'
                            : 'w-1 h-1 bg-white/40'
                        }`}
                      />
                    </div>
                    {isSelected && isLast && (
                      <motion.div
                        animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2.2 }}
                        className="absolute inset-0 rounded-full bg-white/40 pointer-events-none"
                      />
                    )}
                  </motion.div>

                  {/* Vertical Connector Stem from Card to Milestone Dot */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.35, delay: cardDelay }}
                    className="absolute -translate-x-1/2 origin-top pointer-events-none"
                    style={{
                      left: leftPx,
                      top: isTop ? ROW_Y_TOP + 96 : dotY + 10,
                      width: 1,
                      height: isTop
                        ? dotY - 10 - (ROW_Y_TOP + 96)
                        : ROW_Y_BOT - (dotY + 10),
                      background: isSelected
                        ? 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.15))'
                        : 'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
                    }}
                  />

                  {/* Step Card — Zero Overlap with Curve */}
                  <motion.div
                    initial={{ opacity: 0, y: isTop ? -14 : 14, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.42, delay: cardDelay, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute -translate-x-1/2"
                    style={{ left: leftPx, top: cardY, width: NODE_W }}
                  >
                    <div
                      className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-300 ${
                        isSelected && isLast
                          ? 'bg-gradient-to-b from-white/[0.16] to-white/[0.05] border-white/55 text-white shadow-[0_0_35px_rgba(255,255,255,0.18)] ring-1 ring-white/25'
                          : isSelected
                          ? 'bg-gradient-to-b from-white/[0.11] to-white/[0.03] border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]'
                          : 'bg-[#111115]/90 border-white/10 text-white/50 hover:border-white/20'
                      }`}
                      style={{ height: 96 }}
                    >
                      {/* Top Row: Icon + Step Badge */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-white/15 border-white/25 text-white shadow-sm'
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white text-black font-bold'
                              : 'bg-white/10 text-white/40 font-medium'
                          }`}
                        >
                          STEP {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Bottom Row: Title + Status */}
                      <div>
                        <h4
                          className={`text-xs font-semibold leading-snug truncate ${
                            isSelected ? 'text-white' : 'text-white/60'
                          }`}
                        >
                          {MODULE_NAME_MAP[moduleId]}
                        </h4>
                        <div className="flex items-center justify-between gap-1 mt-1">
                          {isSelected && isLast ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold tracking-wide">
                              ★ Destination
                            </span>
                          ) : isSelected ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-white/80 font-medium tracking-wide">
                              ✓ Selected
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/35">
                              Recommended
                            </span>
                          )}
                          <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-white/60' : 'text-white/30'}`}>
                            {MODULE_CREDIT_MAP[moduleId] ?? 0} Cr
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}

            {/* ── COMPLETE MARKER (Right Edge) ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
              style={{ left: 130 + (journey.length - 1) * NODE_STEP + 80, top: 170 }}
            >
              <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/50" />
              </div>
              <span className="absolute top-11 text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 whitespace-nowrap font-medium">
                COMPLETE
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Footer / Select Flow Action Banner ── */}
      <div className="px-6 md:px-10 py-5 border-t border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <p className="text-sm font-semibold text-white tracking-tight">
            Ready to execute this {journey.length}-step Recommended Flow?
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            Breakdown: <span className="text-white font-mono font-medium">{journey.length} Modules ({flowModuleCredits} Cr)</span> + <span className="text-white font-mono font-medium">{journey.length} Required Prompts ({flowRequiredPromptCredits} Cr)</span>{extraPromptCredits > 0 ? ` + ${extraPromptCredits} Extra Prompt Cr` : ''} = <span className="text-white font-mono font-bold text-white/90">{flowTotalCredits} Total Credits</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSelectFlow}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-white to-neutral-200 text-black text-sm font-bold uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] shrink-0"
          >
            {allFlowSelected
              ? `Flow Selected (${flowTotalCredits} ${flowTotalCredits === 1 ? 'Credit' : 'Credits'})`
              : `Buy Estimated Flow (${flowTotalCredits} ${flowTotalCredits === 1 ? 'Credit' : 'Credits'})`}
            {allFlowSelected ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

function DashboardPlatform() {
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [promptCredits, setPromptCredits]     = useState(1);
  const [activeJourney, setActiveJourney]     = useState<string | null>(null);

  const selectedModuleList = useMemo(
    () => Array.from(selectedModules),
    [selectedModules]
  );

  const selectedModulesCount = selectedModuleList.length;
  const moduleCredits = sumModuleCredits(selectedModuleList);
  const requiredPromptCredits = selectedModulesCount; // 1 prompt per selected module
  const extraPromptCredits = promptCredits;
  const totalCredits = moduleCredits + requiredPromptCredits + extraPromptCredits;

  const toggleModule = useCallback((id: string) => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setActiveJourney(null);
  }, []);

  const applyJourney = useCallback((journey: Journey) => {
    setSelectedModules(new Set(journey.moduleIds));
    setActiveJourney(journey.id);
    setTimeout(() => {
      const el =
        document.getElementById('recommended-flow') ||
        document.getElementById('credit-calculator');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, []);

  const selectRecommendedFlow = useCallback((moduleIds: string[]) => {
    setSelectedModules(new Set(moduleIds));
    setActiveJourney(null);
    setTimeout(() => {
      document.getElementById('credit-calculator')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  }, []);

  const changePrompt = (delta: number) =>
    setPromptCredits(p => Math.max(0, p + delta));

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-28"
    >
      {/* ── Header ── */}
      <div className="text-center max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-light tracking-tighter text-white mb-5 leading-[1.05]"
        >
          Unlock only<br />
          <span className="font-semibold">what you need.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/50 text-lg leading-relaxed"
        >
          Purchase credits and spend them only on the modules you want.<br />
          Each module has its own credit cost.
        </motion.p>
      </div>

      {/* ── Credit packs ── */}
      <section id="dashboard-credit-packs" aria-label="Productica One credit packs" className="scroll-mt-28">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium mb-3">
            Productica One
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-3">
            Buy <span className="font-semibold">credits</span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Priced in USD, with indicative INR in brackets. Checkout on app.productica.in/billing.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {DASHBOARD_CREDIT_PACKS.map((pack, i) => (
            <motion.a
              key={pack.id}
              href={DASHBOARD_BILLING_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative flex flex-col gap-5 p-6 rounded-2xl border transition-colors ${
                pack.popular
                  ? 'border-white/40 bg-white/[0.07]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white text-black text-[9px] font-semibold tracking-[0.14em] uppercase">
                  Most popular
                </span>
              )}
              <div>
                <p className="text-3xl font-semibold text-white tracking-tight">
                  {pack.credits.toLocaleString()}{' '}
                  <span className="text-sm font-medium text-white/45">credits</span>
                </p>
                <p className="text-sm text-white/45 mt-2 leading-relaxed">{pack.description}</p>
              </div>
              <p className="text-2xl font-semibold text-white tabular-nums">
                {formatUsd(pack.usdPrice)}{' '}
                <span className="text-sm font-medium text-white/45">({pack.inrRange})</span>
              </p>
              <ul className="flex flex-col gap-2">
                {pack.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/55">
                    <Check className="w-3.5 h-3.5 text-white/70 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <span
                className={`mt-auto inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold ${
                  pack.popular
                    ? 'bg-white text-black'
                    : 'border border-white/20 text-white/70'
                }`}
              >
                Buy now <ArrowRight className="w-4 h-4" />
              </span>
            </motion.a>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-white/35 leading-relaxed max-w-2xl mx-auto">
          {CREDIT_FX_NOTE}
        </p>
      </section>

      {/* ── 1. Templates ── */}
      <section id="templates" aria-label="Templates" className="scroll-mt-28">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-3">
            <span className="font-semibold">Templates</span>
          </h2>
          <p className="text-white/50 text-base">
            One-click module bundles designed around common founder goals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {JOURNEYS.map((journey, i) => {
            const modules  = DASHBOARD_MODULES.filter(m => journey.moduleIds.includes(m.id));
            const isActive = activeJourney === journey.id;
            const templateCredits = sumModuleCredits(journey.moduleIds);

            return (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`flex flex-col p-6 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'border-white/40 bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.10)]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-white/8 border border-white/10 text-white/40 font-mono">
                    {journey.moduleIds.length} modules
                  </span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs px-2 py-0.5 rounded-md bg-white/15 border border-white/25 text-white/70 font-medium"
                    >
                      ✓ Active
                    </motion.span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-white mb-1.5 leading-snug">
                  {journey.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed mb-5">{journey.description}</p>

                {/* Flow list */}
                <div className="flex flex-col gap-0 mb-5 flex-grow">
                  {modules.map((mod, idx) => (
                    <div key={mod.id} className="flex flex-col items-start">
                      <span className="text-xs text-white/60 bg-white/6 border border-white/10 px-2.5 py-1 rounded-lg">
                        {mod.name} · {mod.credits} Cr
                      </span>
                      {idx < modules.length - 1 && (
                        <div className="w-px h-3 bg-white/15 ml-3 my-0.5" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs mb-4 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
                  <span className="text-white/40">Total Credits</span>
                  <span className="text-white font-bold text-sm">{templateCredits}</span>
                </div>

                <motion.button
                  onClick={() => applyJourney(journey)}
                  whileTap={{ scale: 0.97 }}
                  aria-label={`Use template: ${journey.title}`}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                    isActive
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white border border-white/10'
                  }`}
                >
                  {isActive ? '✓ Template Applied' : 'Use This Template'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── 2. Recommended Flow (only when modules selected) ── */}
      <AnimatePresence>
        {selectedModules.size > 0 && (
          <RecommendedJourney
            key="recommended-flow"
            selectedModuleIds={selectedModules}
            extraPromptCredits={extraPromptCredits}
            onSelectFlow={selectRecommendedFlow}
          />
        )}
      </AnimatePresence>

      {/* ── 3. Credit Calculator ── */}
      <section id="credit-calculator" aria-label="Credit calculator" className="scroll-mt-28">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-3">
            Estimate Your <span className="font-semibold">Credits</span>
          </h2>
          <p className="text-white/50 text-base">
            Select the modules you need and we'll calculate your total credits.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Left — selectable module cards */}
          <div className="flex flex-col gap-4">
            <div
              role="group"
              aria-label="Select dashboard modules"
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {DASHBOARD_MODULES.map((mod) => {
                const Icon = mod.icon;
                const isSelected = selectedModules.has(mod.id);
                return (
                  <motion.button
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    aria-pressed={isSelected}
                    aria-label={`${mod.name}, ${mod.credits} ${mod.credits === 1 ? 'credit' : 'credits'}`}
                    className={`relative flex flex-col gap-3 p-4 rounded-xl border text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      isSelected
                        ? 'border-white/40 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/6 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-white/20' : 'bg-white/8'}`}>
                        <Icon className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-white' : 'text-white/50'}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border tabular-nums ${
                          isSelected
                            ? 'bg-white/15 border-white/25 text-white/80'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}>
                          {mod.credits} Cr
                        </span>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
                            >
                              <Check className="w-2.5 h-2.5 text-black" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className={`text-xs font-medium leading-snug transition-colors ${isSelected ? 'text-white' : 'text-white/60'}`}>
                      {mod.name}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Prompt Credits row */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.03]">
              <div>
                <p className="text-sm font-medium text-white/80 mb-0.5">Prompt Credits</p>
                <p className="text-xs text-white/40 max-w-[220px] leading-relaxed">
                  Continue chatting with AI after unlocking reports. Each prompt costs 1 credit.
                </p>
              </div>
              <div className="flex items-center gap-3" role="group" aria-label="Prompt credits selector">
                <button
                  onClick={() => changePrompt(-1)}
                  aria-label="Decrease prompt credits"
                  disabled={promptCredits <= 0}
                  className="w-8 h-8 rounded-lg border border-white/15 bg-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-white font-semibold w-6 text-center tabular-nums text-sm" aria-live="polite" aria-atomic="true">
                  {promptCredits}
                </span>
                <button
                  onClick={() => changePrompt(1)}
                  aria-label="Increase prompt credits"
                  className="w-8 h-8 rounded-lg border border-white/15 bg-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right — summary card (sticky) */}
          <div className="sticky top-28">
            <motion.div layout className="p-6 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-white/30 mb-6 font-medium">Summary</p>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Modules ({selectedModulesCount})</span>
                  <span className="text-white font-medium" aria-live="polite">
                    <AnimatedNumber value={moduleCredits} /> {moduleCredits === 1 ? 'Credit' : 'Credits'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Required Prompts ({selectedModulesCount})</span>
                  <span className="text-white font-medium" aria-live="polite">
                    <AnimatedNumber value={requiredPromptCredits} /> {requiredPromptCredits === 1 ? 'Credit' : 'Credits'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Extra Prompt Credits</span>
                  <span className="text-white font-medium" aria-live="polite">
                    <AnimatedNumber value={extraPromptCredits} /> {extraPromptCredits === 1 ? 'Credit' : 'Credits'}
                  </span>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-white/70 font-medium">Total Credits</span>
                  <span className="text-2xl font-semibold text-white" aria-live="polite" aria-atomic="true">
                    <AnimatedNumber value={totalCredits} />
                  </span>
                </div>
              </div>

              <motion.div
                key={totalCredits}
                initial={{ opacity: 0.6, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-xl bg-white/[0.06] border border-white/10 text-center mb-4"
              >
                <p className="text-xs text-white/40 leading-relaxed">
                  Turn your startup idea into a complete business blueprint with{' '}
                  <span className="text-white font-semibold">
                    <AnimatedNumber value={selectedModulesCount} /> {selectedModulesCount === 1 ? 'module' : 'modules'}
                  </span>{' '}
                  ({moduleCredits} module + {requiredPromptCredits} prompt credits).
                </p>
              </motion.div>

              <a
                href={DASHBOARD_BILLING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  sessionStorage.setItem(
                    'productica_estimated_flow',
                    JSON.stringify({
                      modules: selectedModuleList,
                      moduleCredits,
                      requiredPromptCredits,
                      extraPromptCredits,
                      totalCredits,
                      timestamp: Date.now(),
                    })
                  );
                }}
                className="flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] focus-visible:ring-2 focus-visible:ring-white/60 outline-none"
              >
                Buy Estimated Flow ({totalCredits} {totalCredits === 1 ? 'Credit' : 'Credits'}) <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://app.productica.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-white/60 text-sm font-medium hover:text-white hover:border-white/30 active:scale-[0.98] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
              >
                Explore Productica One
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <DashboardCTA totalCredits={totalCredits} />
    </motion.div>
  );
}

function DashboardCTA({ totalCredits }: { totalCredits: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      aria-label="Call to action"
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] backdrop-blur-2xl p-10 md:p-14 text-center"
    >
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white blur-[120px]" />
      </div>
      <div className="relative z-10">
        <p className="text-2xl md:text-3xl font-light text-white/80 tracking-tight mb-3">
          Turn your startup idea into a complete business blueprint in only{' '}
          <span className="font-semibold text-white inline-flex overflow-hidden">
            <AnimatedNumber value={totalCredits} />
            &nbsp;{totalCredits === 1 ? 'Credit' : 'Credits'}.
          </span>
        </p>
        <p className="text-white/40 text-base mb-8 max-w-lg mx-auto">
          No subscriptions. No lock-in. Buy exactly the credits you need and spend them when you're ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={DASHBOARD_BILLING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-8 py-3.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-white/90 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-white/10"
          >
            Buy Credits
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="https://app.productica.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 text-sm font-medium text-white/50 hover:text-white transition-colors duration-200 tracking-wide"
          >
            Explore Productica One →
          </a>
        </div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENTS PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

function AgentsPlatform() {
  const [selectedUseCases, setSelectedUseCases] = useState<Set<string>>(new Set());
  const [customGoal, setCustomGoal] = useState('');

  const customEstimate = useMemo(
    () => estimateCustomGoalCredits(customGoal),
    [customGoal]
  );

  const selectedUseCaseList = useMemo(
    () => AGENT_USE_CASES.filter(u => selectedUseCases.has(u.id)),
    [selectedUseCases]
  );

  const presetMin = selectedUseCaseList.reduce((sum, u) => sum + u.minCredits, 0);
  const presetMax = selectedUseCaseList.reduce((sum, u) => sum + u.maxCredits, 0);
  const customMin = customEstimate?.minCredits ?? 0;
  const customMax = customEstimate?.maxCredits ?? 0;
  const totalMin = presetMin + customMin;
  const totalMax = presetMax + customMax;
  const hasEstimate = selectedUseCaseList.length > 0 || !!customEstimate;
  const needsUltraPlanner =
    selectedUseCaseList.some(u => u.agentId === 'ultraplan') ||
    customEstimate?.agentId === 'ultraplan';
  const ultraPlannerPrice = AGENT_META_MAP.ultraplan.price ?? ULTRAPLANNER_PRICE;

  const toggleUseCase = useCallback((id: string) => {
    setSelectedUseCases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return (
    <motion.div
      key="agents"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-24"
    >
      {/* ── Header ── */}
      <div className="text-center max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-light tracking-tighter text-white mb-5 leading-[1.05]"
        >
          Work with<br />
          <span className="font-semibold">Productica Teams.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/50 text-lg leading-relaxed"
        >
          Pick the outcomes you need — credits are estimated by use case, not by agent seat.
        </motion.p>
      </div>

      {/* ── Credit bundles ── */}
      <section aria-label="Productica Teams credit bundles">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium mb-3">
            Credit Bundles
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-3">
            Buy <span className="font-semibold">credits</span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Priced in INR (indicative), with USD in brackets. Checkout on agents.productica.in.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {AGENT_CREDIT_PACKS.map((pack, i) => (
            <motion.a
              key={pack.id}
              href={AGENTS_BUY_CREDITS_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex flex-col justify-between gap-6 p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06] transition-colors"
            >
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/35 mb-3">
                  {pack.name}
                </p>
                <p className="text-3xl font-semibold text-white tracking-tight">
                  {pack.credits}{' '}
                  <span className="text-sm font-medium text-white/45">credits</span>
                </p>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-white/30 line-through mb-1 tabular-nums">
                    {formatInrPrimary(pack.inrWasRange, pack.usdWas)}
                  </p>
                  <p className="text-xl font-semibold text-white tabular-nums">
                    {pack.inrRange}{' '}
                    <span className="text-sm font-medium text-white/45">({formatUsd(pack.usdPrice)})</span>
                  </p>
                </div>
                <span className="text-xs text-white/40 inline-flex items-center gap-1">
                  Buy <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-white/35 leading-relaxed max-w-2xl mx-auto">
          {AGENT_CREDIT_FX_NOTE}
        </p>
      </section>

      {/* ── Available Agents — use cases & capabilities ── */}
      <section aria-label="Available AI agents">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium mb-3">
            Productica Teams
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-3">
            Meet your <span className="font-semibold">team</span>
          </h2>
          <p className="text-white/50 text-base">
            Each agent specializes in different founder outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {AGENT_LIST.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex flex-col gap-5 p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={AGENT_IMAGES[agent.id]}
                      alt={agent.name}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        (e.currentTarget.nextSibling as HTMLElement)?.classList.remove('hidden');
                      }}
                    />
                    <Icon className="w-5 h-5 text-white/60 hidden" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-semibold text-white">{agent.name}</p>
                      {agent.paid && agent.price != null && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-black tracking-wide">
                          Paid · ${agent.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{agent.tagline}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/30 font-medium mb-2">
                    Use Cases
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.useCases.map(useCase => (
                      <span
                        key={useCase}
                        className="text-[11px] px-2 py-1 rounded-md bg-white/6 border border-white/10 text-white/60"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/30 font-medium mb-2">
                    Capabilities
                  </p>
                  <ul className="flex flex-col gap-2">
                    {agent.capabilities.map(capability => (
                      <li key={capability} className="flex items-start gap-2 text-xs text-white/55 leading-relaxed">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-white/40 shrink-0" />
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Build Your Team — use-case calculator ── */}
      <section id="agent-calculator" aria-label="Agent credit calculator" className="scroll-mt-28">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-3">
            Build Your <span className="font-semibold">Team</span>
          </h2>
          <p className="text-white/50 text-base">
            Select the outcomes you want — we'll estimate credits and match the right agent.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="flex flex-col gap-4">
            <div
              role="group"
              aria-label="Select agent use cases"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {AGENT_USE_CASES.map(useCase => {
                const isSelected = selectedUseCases.has(useCase.id);
                return (
                  <motion.button
                    key={useCase.id}
                    type="button"
                    onClick={() => toggleUseCase(useCase.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    aria-pressed={isSelected}
                    className={`relative flex flex-col gap-3 p-4 rounded-xl border text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      isSelected
                        ? 'border-white/40 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/6 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-semibold leading-snug ${isSelected ? 'text-white' : 'text-white/75'}`}>
                          {useCase.name}
                        </p>
                        <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                          {useCase.description}
                        </p>
                      </div>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0"
                          >
                            <Check className="w-2.5 h-2.5 text-black" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? 'bg-white/15 border-white/25 text-white/80'
                          : 'bg-white/5 border-white/10 text-white/40'
                      }`}>
                        {AGENT_NAME_MAP[useCase.agentId]}
                        {AGENT_META_MAP[useCase.agentId].paid && AGENT_META_MAP[useCase.agentId].price != null
                          ? ` · $${AGENT_META_MAP[useCase.agentId].price!.toFixed(2)}`
                          : ''}
                      </span>
                      <span className={`text-xs font-mono tabular-nums ${isSelected ? 'text-white/80' : 'text-white/45'}`}>
                        {useCase.minCredits}–{useCase.maxCredits} Cr
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Custom goal */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
              <label htmlFor="custom-agent-goal" className="block">
                <p className="text-sm font-medium text-white/80 mb-0.5">What do you want to achieve?</p>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">
                  Describe a custom goal — we'll estimate credits from similar use cases.
                </p>
              </label>
              <textarea
                id="custom-agent-goal"
                value={customGoal}
                onChange={e => setCustomGoal(e.target.value)}
                rows={3}
                placeholder="e.g. Help me prepare a seed pitch and refine my pricing story…"
                className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors"
              />
              <AnimatePresence>
                {customEstimate && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-white/45">
                      Estimated for{' '}
                      <span className="text-white/75 font-medium">
                        {AGENT_NAME_MAP[customEstimate.agentId]}
                      </span>
                      {AGENT_META_MAP[customEstimate.agentId].paid &&
                        AGENT_META_MAP[customEstimate.agentId].price != null && (
                          <span className="text-white/55">
                            {' '}· ${AGENT_META_MAP[customEstimate.agentId].price!.toFixed(2)}
                          </span>
                        )}
                      {customEstimate.matchedUseCase && (
                        <span className="text-white/35">
                          {' '}· similar to {customEstimate.matchedUseCase}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-white/80 tabular-nums">
                      {customEstimate.minCredits}–{customEstimate.maxCredits} Cr
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary */}
          <div className="sticky top-28">
            <motion.div layout className="p-6 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-white/30 mb-6 font-medium">Summary</p>

              <div className="flex flex-col gap-3 mb-6 min-h-[120px]">
                {!hasEstimate && (
                  <p className="text-sm text-white/35 leading-relaxed">
                    Select use cases or describe a custom goal to estimate your credits.
                  </p>
                )}

                {selectedUseCaseList.map(useCase => (
                  <div key={useCase.id} className="flex justify-between items-start gap-3 text-sm">
                    <div>
                      <p className="text-white/80">{useCase.name}</p>
                      <p className="text-[11px] text-white/35 mt-0.5">{AGENT_NAME_MAP[useCase.agentId]}</p>
                    </div>
                    <span className="text-white/55 text-xs font-mono tabular-nums shrink-0">
                      {useCase.minCredits}–{useCase.maxCredits}
                    </span>
                  </div>
                ))}

                {customEstimate && (
                  <div className="flex justify-between items-start gap-3 text-sm">
                    <div>
                      <p className="text-white/80">Custom goal</p>
                      <p className="text-[11px] text-white/35 mt-0.5">
                        {AGENT_NAME_MAP[customEstimate.agentId]}
                      </p>
                    </div>
                    <span className="text-white/55 text-xs font-mono tabular-nums shrink-0">
                      {customEstimate.minCredits}–{customEstimate.maxCredits}
                    </span>
                  </div>
                )}

                {hasEstimate && (
                  <>
                    {needsUltraPlanner && (
                      <div className="flex justify-between items-center text-sm gap-3">
                        <span className="text-white/50">UltraPlanner Agent</span>
                        <span className="text-white/80 font-medium tabular-nums text-right">{formatUltraPlannerFee()}</span>
                      </div>
                    )}
                    <div className="h-px bg-white/10 my-1" />
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 font-medium">Estimated Credits</span>
                      <span className="text-2xl font-semibold text-white tabular-nums" aria-live="polite">
                        {totalMin === totalMax ? (
                          <AnimatedNumber value={totalMin} />
                        ) : (
                          <>
                            <AnimatedNumber value={totalMin} />
                            <span className="text-white/40 mx-1">–</span>
                            <AnimatedNumber value={totalMax} />
                          </>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <a
                href={AGENTS_BUY_CREDITS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  sessionStorage.setItem(
                    'productica_agent_estimate',
                    JSON.stringify({
                      useCases: selectedUseCaseList.map(u => u.id),
                      customGoal: customGoal.trim() || null,
                      customEstimate,
                      needsUltraPlanner,
                      ultraPlannerPrice: needsUltraPlanner ? ultraPlannerPrice : null,
                      totalMin,
                      totalMax,
                      timestamp: Date.now(),
                    })
                  );
                }}
                className="flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] focus-visible:ring-2 focus-visible:ring-white/60 outline-none"
              >
                {hasEstimate
                  ? `Buy Credits (${totalMin === totalMax ? totalMin : `${totalMin}–${totalMax}`})`
                  : 'Buy Credits'}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://agents.productica.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-white/60 text-sm font-medium hover:text-white hover:border-white/30 active:scale-[0.98] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
              >
                Explore Productica Teams
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] backdrop-blur-2xl p-10 md:p-14 text-center"
      >
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white blur-[120px]" />
        </div>
        <div className="relative z-10">
          <p className="text-2xl md:text-3xl font-light text-white/80 tracking-tight mb-3">
            Build your startup faster with your personal{' '}
            <span className="font-semibold text-white">AI startup team.</span>
          </p>
          <p className="text-white/40 text-base mb-8 max-w-lg mx-auto">
            Estimate by outcome, then buy only the credits your use cases need.
          </p>
          <a
            href={AGENTS_BUY_CREDITS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-white/90 active:scale-[0.97] transition-all"
          >
            Buy Credits
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </motion.section>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

type PlatformTab = 'dashboard' | 'agents';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<PlatformTab>('agents');

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.history.length > 2) {
      window.history.back();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar showBackButton backHref="/" onBackClick={handleBackClick} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ── Platform Toggle ── */}
        <div className="flex justify-center mb-20">
          <div
            role="tablist"
            aria-label="Platform selection"
            className="inline-flex items-center gap-1 p-1 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl"
          >
            {(['agents', 'dashboard'] as PlatformTab[]).map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  activeTab === tab ? 'text-black' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-white"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === 'agents' ? 'Productica Teams' : 'Productica One'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'agents' ? (
            <AgentsPlatform key="agents" />
          ) : (
            <DashboardPlatform key="dashboard" />
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
