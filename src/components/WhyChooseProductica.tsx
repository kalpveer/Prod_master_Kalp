/* eslint-disable */
import { useRef, useState } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  TrendingUp,
  GraduationCap,
  FlaskConical,
  ArrowRight,
  X,
} from 'lucide-react';
import { HOME_ICP_BY_ID, type HomeIcpId } from '../data/icpHome';

// --- DATA FOR ECOSYSTEM NODES ---
interface EcosystemNode {
  id: string;
  name: string;
  statement: string;
  capabilities: string[];
  icon: React.ComponentType<any>;
  x: number; // percentage width
  y: number; // percentage height
  initialX: number; // relative slide-in offset
  initialY: number; // relative slide-in offset
}

const ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    id: 'founders',
    name: 'Founders',
    statement: 'Turn ideas into scalable ventures.',
    capabilities: [
      'AI-powered idea validation',
      'Customer and competitor intelligence',
      'GTM and investor readiness'
    ],
    icon: User,
    x: 50,
    y: 18,
    initialX: 0,
    initialY: -50
  },
  {
    id: 'incubators',
    name: 'Incubators',
    statement: 'Empower startup portfolios at scale.',
    capabilities: [
      'Venture-readiness diagnostics',
      'Portfolio health tracking',
      'Data-driven cohort guidance'
    ],
    icon: Building2,
    x: 15,
    y: 40,
    initialX: -50,
    initialY: 0
  },
  {
    id: 'investors',
    name: 'Investors & Angels',
    statement: 'De-risk early-stage deals and monitor portfolios.',
    capabilities: [
      'Structured startup due diligence',
      'Venture metrics benchmarking',
      'Investment readiness reporting'
    ],
    icon: TrendingUp,
    x: 85,
    y: 40,
    initialX: 50,
    initialY: 0
  },
  {
    id: 'universities',
    name: 'Universities',
    statement: 'Accelerate campus entrepreneurship and spin-outs.',
    capabilities: [
      'Commercialization pathway mapping',
      'Innovation ecosystem insights',
      'Founder readiness frameworks'
    ],
    icon: GraduationCap,
    x: 25,
    y: 82,
    initialX: -40,
    initialY: 40
  },
  {
    id: 'researchers',
    name: 'Researchers',
    statement: 'Bridge academic research and market demand.',
    capabilities: [
      'Productization potential analysis',
      'Market opportunity discovery',
      'Industry validation insights'
    ],
    icon: FlaskConical,
    x: 75,
    y: 82,
    initialX: 40,
    initialY: 40
  }
];


export default function WhyChooseProductica() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [popupId, setPopupId] = useState<HomeIcpId | null>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: mobileScroll } = useScroll({
    target: mobileRef,
    offset: ["start center", "end center"]
  });

  const openPopup = (id: string) => {
    setPopupId(id as HomeIcpId);
  };

  const closePopup = () => setPopupId(null);

  const renderCard = (node: EcosystemNode, idx: number, isAbsolute: boolean = false, isMobileMode: boolean = false) => {
    const isHovered = hoveredNode === node.id || popupId === node.id;
    const cardContent = (
      <motion.button
        type="button"
        onClick={() => openPopup(node.id)}
        onHoverStart={() => setHoveredNode(node.id)}
        onHoverEnd={() => setHoveredNode(null)}
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 4.2 + (idx % 3) * 0.7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: idx * 0.35
        }}
        whileHover={{
          scale: 1.01,
          y: -4,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.15)',
          transition: { duration: 0.2, y: { duration: 0.2 } }
        }}
        style={{ willChange: "transform, box-shadow" }}
        className={`block ${isMobileMode ? 'w-full p-3.5' : 'w-[230px] lg:w-[270px] p-5 lg:p-6'} bg-[#050505] border ${isHovered ? 'border-white/20' : 'border-white/[0.08]'
          } rounded-[22px] text-left shadow-2xl transition-colors duration-300 cursor-pointer`}
      >
        {/* Top Left Icon inside circular outline */}
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center shrink-0 mb-3">
          {(() => {
            const IconComponent = node.icon;
            return <IconComponent className="w-4.5 h-4.5 text-zinc-300" />;
          })()}
        </div>

        <h3 className={`${isMobileMode ? 'text-[15px]' : 'text-lg lg:text-[17px]'} font-bold text-white tracking-tight mb-1`}>
          {node.name}
        </h3>

        <p className={`${isMobileMode ? 'text-[11px]' : 'text-[13px] lg:text-[13px]'} text-white/65 italic mb-3 font-normal leading-snug`}>
          {node.statement}
        </p>

        <div className="w-5 h-px bg-white/10 mb-3" />

        <ul className={`${isMobileMode ? 'space-y-1' : 'space-y-1.5'}`}>
          {node.capabilities.map((cap, i) => (
            <li key={i} className={`flex items-start gap-2 ${isMobileMode ? 'text-[11px]' : 'text-[12px] lg:text-[12px]'} text-white/65 font-light leading-relaxed`}>
              <span className="w-1 h-1 rounded-full bg-white/40 shrink-0 mt-1.5" />
              <span>{cap}</span>
            </li>
          ))}
        </ul>
      </motion.button>
    );

    if (isAbsolute) {
      return (
        <motion.div
          key={node.id}
          className="absolute z-10"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            willChange: "transform, opacity"
          }}
          initial={{ opacity: 0, x: `-50%`, y: `-30%`, scale: 0.8 }}
          whileInView={{ opacity: 1, x: `-50%`, y: `-50%`, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: idx * 0.1 }}
      >
        {cardContent}
      </motion.div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        /* flow-particles animations removed to prevent flickering */
        @keyframes logo-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.03), inset 0 0 15px rgba(255, 255, 255, 0.03);
            border-color: rgba(255, 255, 255, 0.08);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 0 35px rgba(255, 255, 255, 0.08), inset 0 0 20px rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.15);
          }
        }
        @keyframes rotate-cw {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes rotate-ccw {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
        /* flow-particles classes removed */
        .animate-logo-pulse {
          animation: logo-pulse 4s ease-in-out infinite;
        }
        .animate-rotate-cw {
          animation: rotate-cw 40s linear infinite;
        }
        .animate-rotate-ccw {
          animation: rotate-ccw 55s linear infinite;
        }
      `}} />

      <section
        className="relative w-full bg-[#000000] text-white pt-[120px] pb-12 md:pb-[180px] px-6 md:px-16 overflow-hidden border-t border-[rgba(255,255,255,0.08)]"
        id="why-choose"
      >
        {/* Background grids and subtle monochrome gradients */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Very subtle white radial glow at the center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[120px] mix-blend-screen" />

          {/* Low opacity geometric plus marks at corner positions */}
          <div className="absolute top-[10%] left-[5%] text-white/5 font-mono text-xs select-none pointer-events-none">+</div>
          <div className="absolute top-[10%] right-[5%] text-white/5 font-mono text-xs select-none pointer-events-none">+</div>
          <div className="absolute bottom-[10%] left-[5%] text-white/5 font-mono text-xs select-none pointer-events-none">+</div>
          <div className="absolute bottom-[10%] right-[5%] text-white/5 font-mono text-xs select-none pointer-events-none">+</div>

          {/* Soft grain texture SVG noise overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none mix-blend-overlay">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>

          {/* Faint grid mesh */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center gap-4">

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full flex flex-col items-center text-center max-w-4xl"
          >
            <span className="text-[10px] font-mono tracking-[0.4em] text-white/50 uppercase block mb-4">
              WHY CHOOSE PRODUCTICA
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter leading-tight text-white block font-semibold">
              Why choose Productica
            </h2>
          </motion.div>



          {/* ── DESKTOP VIEW: Circular Interactive Orbit Visualization (>= 1024px) ── */}
          <div className="hidden lg:flex justify-center items-center relative w-full max-w-[960px] xl:max-w-[1050px] mx-auto min-h-[760px] h-[760px] xl:min-h-[860px] xl:h-[860px]">

            {/* Concentric Orbital Rings */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/[0.015] rounded-full pointer-events-none z-0" />
            <div
              className="absolute left-1/2 top-1/2 w-[55%] h-[55%] border border-dashed border-white/[0.02] rounded-full pointer-events-none z-0 animate-rotate-cw"
              style={{ transformOrigin: 'center center' }}
            />
            <div
              className="absolute left-1/2 top-1/2 w-[32%] h-[32%] border border-white/[0.025] rounded-full pointer-events-none z-0 animate-rotate-ccw"
              style={{ transformOrigin: 'center center' }}
            />

            {/* SVG Interactive Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
              {ECOSYSTEM_NODES.map((node, idx) => {
                const isHovered = hoveredNode === node.id;
                return (
                  <g key={node.id}>
                    {/* Faint static connection line */}
                    <motion.line
                      x1="50%"
                      y1="50%"
                      x2={`${node.x}%`}
                      y2={`${node.y}%`}
                      stroke={isHovered ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.06)"}
                      strokeWidth="0.75"
                      className="transition-all duration-300"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                    />
                    {/* Secondary subtle dashed line (static, no animation) */}
                    <motion.line
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2="50%"
                      y2="50%"
                      stroke={isHovered ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.04)"}
                      strokeWidth="0.5"
                      strokeDasharray="2 8"
                      className="transition-all duration-500"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, delay: 0.4 + idx * 0.1, ease: "easeOut" }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Central Productica Hub Node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
              whileInView={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-1/2 z-20"
            >
              <div
                className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-2xl relative backdrop-blur-xl animate-logo-pulse"
                style={{
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="absolute inset-0 rounded-full bg-white/[0.01] blur-xl pointer-events-none" />
                <img
                  src="/9.png"
                  alt="Productica Logo"
                  className="w-14 h-14 lg:w-16 lg:h-16 object-contain invert"
                />
              </div>
            </motion.div>

            {/* Floating Glassmorphic Cards around the Orbit */}
            {ECOSYSTEM_NODES.map((node, idx) => renderCard(node, idx, true))}
          </div>

          {/* ── TABLET VIEW: Grid Layout (768px to 1023px) ── */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-x-12 gap-y-16 max-w-4xl mx-auto mt-10 relative z-10 px-8">
            {/* Founders - takes full width row 1 */}
            <div className="col-span-2 flex justify-center">
              {renderCard(ECOSYSTEM_NODES[0], 0)}
            </div>

            {/* Incubators (col 1) & Investors (col 2) - Row 2 */}
            <div className="flex justify-end">
              {renderCard(ECOSYSTEM_NODES[1], 1)}
            </div>
            <div className="flex justify-start">
              {renderCard(ECOSYSTEM_NODES[2], 2)}
            </div>

            {/* Central Node - takes full width row 3 */}
            <div className="col-span-2 flex justify-center py-4">
              <div className="w-28 h-28 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center shadow-xl relative backdrop-blur-xl animate-logo-pulse">
                <div className="absolute inset-0 rounded-full bg-white/[0.02] blur-md pointer-events-none" />
                <img src="/9.png" alt="Productica Logo" className="w-12 h-12 object-contain invert" />
              </div>
            </div>

            {/* Universities (col 1) & Researchers (col 2) - Row 4 */}
            <div className="flex justify-end">
              {renderCard(ECOSYSTEM_NODES[3], 3)}
            </div>
            <div className="flex justify-start">
              {renderCard(ECOSYSTEM_NODES[4], 4)}
            </div>
          </div>

          {/* ── MOBILE VIEW: Connected Vertical Timeline with Center Hub ── */}
          <div className="block md:hidden w-full relative pt-12 pb-24 max-w-[380px] mx-auto overflow-hidden">
            
            {/* Logo Node (Top Center) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
              className="flex justify-center relative z-20"
            >
              <div className="w-16 h-16 rounded-full bg-[#050505] border border-white/20 flex items-center justify-center shadow-2xl relative backdrop-blur-xl animate-logo-pulse z-20">
                <div className="absolute inset-0 rounded-full bg-white/[0.02] blur-md pointer-events-none" />
                <img src="/9.png" alt="Productica Logo" className="w-8 h-8 object-contain invert relative z-10" />
              </div>
            </motion.div>

            {/* Timeline Container */}
            <div ref={mobileRef} className="relative -mt-4">
              {/* Base Gray Center Line */}
              <div className="absolute left-1/2 top-0 bottom-[100px] w-px bg-white/10 -translate-x-1/2" />
              
              {/* Animated White Center Line */}
              <motion.div 
                className="absolute left-1/2 top-0 bottom-[100px] w-[2px] bg-white -translate-x-1/2 origin-top z-10" 
                style={{ scaleY: mobileScroll }} 
              />

              <div className="grid grid-cols-2 gap-x-4 gap-y-12 relative z-20 px-2 pt-28">
                {/* 1. Founders (Left) */}
                <div className="col-start-1 flex justify-end relative">
                  <div className="absolute w-[16px] h-px right-[-8px] top-[32px] bg-white/10 pointer-events-none" />
                  <motion.div className="absolute w-[16px] h-[2px] right-[-8px] top-[32px] bg-white pointer-events-none origin-right z-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "-48% 0px -48% 0px" }} transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-48% 0px -48% 0px" }}
                    transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
                    className="w-full"
                  >
                    {renderCard(ECOSYSTEM_NODES[0], 0, false, true)}
                  </motion.div>
                </div>

                {/* 2. Investors & Angels (Right) */}
                <div className="col-start-2 flex justify-start relative mt-16">
                  <div className="absolute w-[16px] h-px left-[-8px] top-[32px] bg-white/10 pointer-events-none" />
                  <motion.div className="absolute w-[16px] h-[2px] left-[-8px] top-[32px] bg-white pointer-events-none origin-left z-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "-48% 0px -48% 0px" }} transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-48% 0px -48% 0px" }}
                    transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
                    className="w-full"
                  >
                    {renderCard(ECOSYSTEM_NODES[2], 2, false, true)}
                  </motion.div>
                </div>

                {/* 3. Incubators (Left) */}
                <div className="col-start-1 flex justify-end relative mt-4">
                  <div className="absolute w-[16px] h-px right-[-8px] top-[32px] bg-white/10 pointer-events-none" />
                  <motion.div className="absolute w-[16px] h-[2px] right-[-8px] top-[32px] bg-white pointer-events-none origin-right z-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "-48% 0px -48% 0px" }} transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-48% 0px -48% 0px" }}
                    transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
                    className="w-full"
                  >
                    {renderCard(ECOSYSTEM_NODES[1], 1, false, true)}
                  </motion.div>
                </div>

                {/* 4. Researchers (Right) */}
                <div className="col-start-2 flex justify-start relative mt-16">
                  <div className="absolute w-[16px] h-px left-[-8px] top-[32px] bg-white/10 pointer-events-none" />
                  <motion.div className="absolute w-[16px] h-[2px] left-[-8px] top-[32px] bg-white pointer-events-none origin-left z-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "-48% 0px -48% 0px" }} transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-48% 0px -48% 0px" }}
                    transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
                    className="w-full"
                  >
                    {renderCard(ECOSYSTEM_NODES[4], 4, false, true)}
                  </motion.div>
                </div>

                {/* 5. Universities (Center Below) */}
                <div className="col-span-2 flex justify-center relative pt-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-48% 0px -48% 0px" }}
                    transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
                    className="w-full max-w-[200px] relative z-20"
                  >
                    {renderCard(ECOSYSTEM_NODES[3], 3, false, true)}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* Small popup — stay on homepage; full page is the next step */}
      <AnimatePresence>
        {popupId && HOME_ICP_BY_ID[popupId] && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closePopup}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-lg rounded-3xl border border-white/15 bg-[#0a0a0a] p-6 md:p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={closePopup}
                className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/35 mb-2">
                {HOME_ICP_BY_ID[popupId].label}
              </p>
              <p className="text-lg md:text-xl font-light tracking-tight text-white leading-snug mb-5 pr-8">
                {HOME_ICP_BY_ID[popupId].reality}
              </p>
              <ul className="flex flex-col gap-2.5 mb-7">
                {HOME_ICP_BY_ID[popupId].outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-sm text-white/65 font-light">
                    <span className="w-1 h-1 rounded-full bg-white/40 mt-2 shrink-0" />
                    {o}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`/${popupId}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90"
                >
                  Open full {HOME_ICP_BY_ID[popupId].label.toLowerCase()} page
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={HOME_ICP_BY_ID[popupId].ctaHref}
                  onClick={closePopup}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/20 text-white/70 text-sm hover:text-white hover:border-white/40"
                >
                  {HOME_ICP_BY_ID[popupId].cta}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}