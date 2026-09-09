/* eslint-disable */
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';

export default function AgenticPlatform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<number>(0);

  // Track scroll progress across a 500vh tall pinning section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smoothly transform the Canvas scale and translation based on scroll progress
  const canvasScale = useTransform(scrollYProgress, 
    [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 0.95, 1], 
    [1, 1,    2.2,  2.2,  2.2,  2.2,  2.2,  2.2,  2.2,  2.2,  1,    1]
  );
  
  const canvasX = useTransform(scrollYProgress, 
    [0, 0.08, 0.18, 0.28, 0.38,   0.48,   0.58,  0.68,  0.78,   0.88,   0.95, 1], 
    ["0%","0%","30%","30%","-30%","-30%", "30%", "30%","-30%", "-30%", "0%", "0%"]
  );

  const canvasY = useTransform(scrollYProgress, 
    [0, 0.08, 0.18, 0.28, 0.38,   0.48,   0.58,   0.68,   0.78,   0.88,   0.95, 1], 
    ["0%","0%","30%","30%","30%", "30%", "-30%", "-30%", "-30%", "-30%", "0%", "0%"]
  );

  // Listen to scroll changes to update text blocks and highlighted states
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.13) {
      setStage(0); // Intro / Full Canvas
    } else if (latest < 0.33) {
      setStage(1); // Zoom into top-left (Virtual Co-Founder)
    } else if (latest < 0.53) {
      setStage(2); // Zoom into top-right (Marketing)
    } else if (latest < 0.73) {
      setStage(3); // Zoom into bottom-left (Ultraplan)
    } else if (latest < 0.91) {
      setStage(4); // Zoom into bottom-right (Live Canvas)
    } else {
      setStage(5); // Zoom out / Synthesized Canvas
    }
  });

  return (
    <div ref={containerRef} className="relative w-full h-[500vh] bg-black text-white">
      {/* Sticky viewport container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {/* Ambient background grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Cinematic Header overlay */}
        <div className="absolute top-12 left-6 right-6 md:left-16 md:right-16 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1 flex-1">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-semibold block">
              Venture Intelligence Agents
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              AI Agents Built for <span className="text-white/40">Venture Building.</span>
            </h2>
          </div>
          
          <div className="text-[10px] font-mono tracking-widest text-white/40 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full hidden md:block">
            ACTIVE AGENT WORKSPACE
          </div>
        </div>

        {/* Left Side: Copy and details that crossfade */}
        <div className="absolute top-[18%] md:top-[35%] left-6 right-6 md:left-16 md:w-[35%] z-20 pointer-events-none">
          <AnimatePresence mode="wait">
            {stage === 0 && (
              <motion.div
                key="stage-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h3 className="text-4xl font-light tracking-tight text-white leading-tight">
                  Meet Your Venture <br />Intelligence Board.
                </h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  Deploy a synchronized team of AI agents designed to support founders across validation, GTM strategy, investor readiness, startup decision-making, and venture growth.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono pt-4">
                  <span>↓ SCROLL DOWN TO INITIALIZE AGENTS</span>
                </div>
              </motion.div>
            )}

            {stage === 1 && (
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-mono tracking-widest text-white/40 block">01 / VIRTUAL CO-FOUNDER</span>
                <h3 className="text-4xl font-light tracking-tight text-white leading-tight">
                  Strategic Startup <br />Thinking Support
                </h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  Provides key clarity for validation, execution priorities, startup decisions, founder clarity, and strategic venture direction.
                </p>
                <div className="pt-2">
                  <span className="inline-block text-[9px] uppercase tracking-wider text-white bg-white/10 border border-white/10 px-3 py-1 rounded-full font-mono font-bold">
                    DEPLOYING CO-FOUNDER ENGINE
                  </span>
                </div>
              </motion.div>
            )}

            {stage === 2 && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-mono tracking-widest text-white/40 block">02 / VIRTUAL CMO</span>
                <h3 className="text-4xl font-light tracking-tight text-white leading-tight">
                  Positioning & <br />GTM Strategy
                </h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  Supports startup positioning, GTM strategy, messaging clarity, acquisition thinking, and targeted market communication.
                </p>
                <div className="pt-2">
                  <span className="inline-block text-[9px] uppercase tracking-wider text-white bg-white/10 border border-white/10 px-3 py-1 rounded-full font-mono font-bold">
                    GTM CHANNELS ACTIVE
                  </span>
                </div>
              </motion.div>
            )}

            {stage === 3 && (
              <motion.div
                key="stage-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-mono tracking-widest text-white/40 block">03 / VIRTUAL PRODUCT STRATEGIST</span>
                <h3 className="text-4xl font-light tracking-tight text-white leading-tight">
                  MVP Sizing & <br />Product Direction
                </h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  Supports MVP prioritization, startup product direction, feature clarity, startup feedback loops, and product-market fit thinking.
                </p>
                <div className="pt-2">
                  <span className="inline-block text-[9px] uppercase tracking-wider text-white bg-white/10 border border-white/10 px-3 py-1 rounded-full font-mono font-bold">
                    ROADMAP MATRIX STABLE
                  </span>
                </div>
              </motion.div>
            )}

            {stage === 4 && (
              <motion.div
                key="stage-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-mono tracking-widest text-white/40 block">04 / VIRTUAL INVESTOR</span>
                <h3 className="text-4xl font-light tracking-tight text-white leading-tight">
                  Simulating <br />Investor Scrutiny
                </h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  Simulates investor-style questioning, identifies startup weaknesses, challenges assumptions, and improves fundraising preparedness.
                </p>
                <div className="pt-2">
                  <span className="inline-block text-[9px] uppercase tracking-wider text-white bg-white/10 border border-white/10 px-3 py-1 rounded-full font-mono font-bold">
                    INVESTOR READY MATRIX ACTIVE
                  </span>
                </div>
              </motion.div>
            )}

            {stage === 5 && (
              <motion.div
                key="stage-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-mono tracking-widest text-white/40 block">05 / VIRTUAL CFO</span>
                <h3 className="text-4xl font-light tracking-tight text-white leading-tight">
                  Pricing Logic & <br />Unit Economics
                </h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  Helps founders understand pricing logic, startup runway, unit economics, financial assumptions, and venture scalability.
                </p>
                <div className="pt-4">
                  <a 
                    href="#validate" 
                    className="inline-flex items-center gap-3 text-xs md:text-sm uppercase tracking-widest text-white bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50 px-6 py-3 md:px-8 md:py-4 rounded-full font-mono font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 pointer-events-auto group cursor-pointer"
                  >
                    Get Venture Intelligence
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: The Immersive zooming Canvas elements */}
        <div className="absolute top-[40%] bottom-0 left-0 right-0 md:top-auto md:bottom-auto md:left-auto md:right-16 md:w-[45%] md:h-[60%] flex items-center justify-center z-10">
          <div className="w-full h-full flex items-center justify-center max-md:scale-[0.55]">
            <motion.div 
              style={{ 
                scale: canvasScale,
                x: canvasX,
                y: canvasY
              }}
              className="w-[90%] md:w-full max-w-[520px] aspect-[1.3/1] bg-[#030303]/90 border border-white/10 rounded-2xl p-4 md:p-6 relative flex flex-col justify-between shadow-[0_0_80px_rgba(255,255,255,0.01)]"
            >
            {/* Top Gloss Highlights */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-t-2xl" />

            {/* The 2x2 Canvas Grid */}
            <div className="grid grid-cols-2 gap-4 h-full w-full">
              
              {/* TOP LEFT Cell: Value Proposition (Virtual Co-Founder focus) */}
              <div className={`relative border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden bg-white/[0.01] transition-all duration-300 ${stage === 1 ? 'border-white/40 bg-white/[0.03] shadow-[0_0_20px_rgba(255,255,255,0.03)]' : (stage === 5 ? 'border-white/20 bg-white/[0.02]' : '')}`}>
                <div className="space-y-1">
                  <span className="text-[8px] font-mono tracking-widest text-white/40 block font-semibold">VIRTUAL CO-FOUNDER</span>
                  <span className="text-[9px] text-white/80 block leading-tight font-medium">Strategic thinking & validation.</span>
                </div>
                
                <AnimatePresence>
                  {stage === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-1 pt-2 border-t border-white/10"
                    >
                      <span className="text-[7px] font-mono text-white/70 block">• Validates startup assumptions.</span>
                      <span className="text-[7px] font-mono text-white/70 block">• Sets execution priorities.</span>
                      <span className="text-[7px] font-mono text-white/70 block">• Clarifies venture direction.</span>
                      <span className="text-[7px] font-mono text-white/30 block">Co-Founder Engine Active</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* TOP RIGHT Cell: Customer Segments (Virtual CMO focus) */}
              <div className={`relative border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden bg-white/[0.01] transition-all duration-300 ${stage === 2 ? 'border-white/40 bg-white/[0.03] shadow-[0_0_20px_rgba(255,255,255,0.03)]' : (stage === 5 ? 'border-white/20 bg-white/[0.02]' : '')}`}>
                <div className="space-y-1 z-10">
                  <span className="text-[8px] font-mono tracking-widest text-white/40 block font-semibold">VIRTUAL CMO</span>
                  <span className="text-[9px] text-white/80 block leading-tight font-medium">Startup positioning & GTM.</span>
                </div>
                
                <AnimatePresence>
                  {stage === 2 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-1 pt-2 border-t border-white/10 z-10"
                    >
                      <span className="text-[7px] font-mono text-white/70 block">• Directs GTM strategy.</span>
                      <span className="text-[7px] font-mono text-white/70 block">• Clarifies messaging hooks.</span>
                      <span className="text-[7px] font-mono text-white/70 block">• Uncovers acquisition channels.</span>
                      <span className="text-[7px] font-mono text-white/30 block">GTM Channels Active</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* BOTTOM LEFT Cell: Customer Channels (Virtual Product Strategist focus) */}
              <div className={`relative border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden bg-white/[0.01] transition-all duration-300 ${stage === 3 ? 'border-white/40 bg-white/[0.03] shadow-[0_0_20px_rgba(255,255,255,0.03)]' : (stage === 5 ? 'border-white/20 bg-white/[0.02]' : '')}`}>
                <div className="space-y-1 z-10">
                  <span className="text-[8px] font-mono tracking-widest text-white/40 block font-semibold">PRODUCT STRATEGIST</span>
                  <span className="text-[9px] text-white/80 block leading-tight font-medium">MVP & product direction.</span>
                </div>
                
                <AnimatePresence>
                  {stage === 3 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-1 pt-2 border-t border-white/10 z-10"
                    >
                      <span className="text-[7px] font-mono text-white/70 block">• Prioritizes MVP features.</span>
                      <span className="text-[7px] font-mono text-white/70 block">• Refines product-market fit.</span>
                      <span className="text-[7px] font-mono text-white/70 block">• Structures feedback loops.</span>
                      <span className="text-[7px] font-mono text-white/30 block">Product Roadmap Stable</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* BOTTOM RIGHT Cell: Revenue Streams (Virtual Investor & CFO focus) */}
              <div className={`relative border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden bg-white/[0.01] transition-all duration-300 ${(stage === 4 || stage === 5) ? 'border-white/40 bg-white/[0.03] shadow-[0_0_20px_rgba(255,255,255,0.03)]' : ''}`}>
                <div className="space-y-1 z-10">
                  <span className="text-[8px] font-mono tracking-widest text-white/40 block font-semibold">INVESTOR & CFO</span>
                  {stage !== 4 && stage !== 5 && (
                    <span className="text-[9px] text-white/80 block leading-tight font-medium">Investor readiness & financial modeling.</span>
                  )}
                </div>

                {/* Analyst line graph renders directly inside this block */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center p-2 pt-6">
                  <AnimatePresence>
                    {(stage === 4 || stage === 5) && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full relative"
                      >
                        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <motion.path 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            d="M0,35 C25,35 35,10 50,10 C65,10 75,30 100,25" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.7)" 
                            strokeWidth="1.5" 
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                        <div className="absolute bottom-1 right-2 text-[6px] font-mono text-white/60">
                          {stage === 4 ? "Investor Scrutiny Active" : "Unit Economics Modeled"}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="text-[7px] font-mono text-white/20 z-10">
                  {stage !== 4 && stage !== 5 && "Fundraising & Financial Engine Ready"}
                </div>
              </div>

            </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Scroll Indicator dots at bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${stage === s ? 'bg-white scale-125' : 'bg-white/20'}`} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}
