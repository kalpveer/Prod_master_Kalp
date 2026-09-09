/* eslint-disable */
import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';

/* --- Holographic Blob Keyframes (injected once) --- */
const blobStyleId = 'holo-blob-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(blobStyleId)) {
  const style = document.createElement('style');
  style.id = blobStyleId;
  style.textContent = `
    @keyframes holoMorph {
      0%, 100% {
        border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
        transform: rotate(0deg) scale(1);
      }
      20% {
        border-radius: 55% 45% 40% 60% / 60% 35% 65% 40%;
        transform: rotate(36deg) scale(1.05);
      }
      40% {
        border-radius: 35% 65% 55% 45% / 40% 60% 40% 60%;
        transform: rotate(72deg) scale(0.97);
      }
      60% {
        border-radius: 60% 40% 45% 55% / 55% 45% 55% 45%;
        transform: rotate(144deg) scale(1.04);
      }
      80% {
        border-radius: 45% 55% 60% 40% / 35% 65% 35% 65%;
        transform: rotate(252deg) scale(0.98);
      }
    }
    @keyframes holoShift {
      0%, 100% {
        background-position: 0% 50%;
      }
      25% {
        background-position: 100% 25%;
      }
      50% {
        background-position: 50% 100%;
      }
      75% {
        background-position: 0% 75%;
      }
    }
    @keyframes holoGlow {
      0%, 100% {
        box-shadow: 0 0 15px rgba(120, 80, 255, 0.3), 0 0 30px rgba(0, 200, 255, 0.15), 0 0 5px rgba(255, 100, 200, 0.1);
      }
      33% {
        box-shadow: 0 0 20px rgba(0, 200, 255, 0.35), 0 0 40px rgba(120, 80, 255, 0.2), 0 0 8px rgba(255, 150, 220, 0.15);
      }
      66% {
        box-shadow: 0 0 18px rgba(255, 100, 200, 0.3), 0 0 35px rgba(120, 80, 255, 0.2), 0 0 6px rgba(0, 200, 255, 0.1);
      }
    }
    @keyframes holoFloat {
      0%, 100% {
        transform: translateY(-3px) scale(0.99);
      }
      50% {
        transform: translateY(3px) scale(1.03);
      }
    }
    @keyframes holoHighlight {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes caretBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// --- Prompt sets for each agent slide ---
const COFOUNDER_PROMPTS = [
  'Should I build this startup?',
  'Validate my SaaS idea.',
  'What problem am I really solving?',
  'Roast my startup idea.',
  'Help me find product-market fit.',
  'Is this worth building?',
  'Challenge my assumptions.',
  'Build a lean MVP roadmap.',
];
const CMO_PROMPTS = [
  'Write my GTM strategy.',
  'Position my startup.',
  'Who is my ideal customer?',
  'Create a launch campaign.',
  'Improve my messaging.',
  'Find my growth channels.',
  'Rewrite my landing page.',
  'Generate LinkedIn content.',
];
const STRATEGIST_PROMPTS = [
  'Prioritize my roadmap.',
  'What feature should I build next?',
  'Review my product strategy.',
  'Plan my MVP.',
  'Should I remove this feature?',
  'Improve user onboarding.',
  'Design my feedback loop.',
  'Define my success metrics.',
];
const INVESTOR_PROMPTS = [
  'Is my startup investor-ready?',
  'Calculate my runway.',
  'Review my unit economics.',
  'Improve my pitch deck.',
  'Estimate CAC and LTV.',
  'How much funding should I raise?',
  'Stress-test my financial model.',
  'Simulate investor questions.',
];

// --- Fisher-Yates shuffle ---
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


const AISearchBar = ({ prompts }: { prompts: string[] }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [_isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    shuffled: null as string[] | null,
    promptIndex: 0,
    charIndex: 0,
    phase: 'blink-before' as 'blink-before' | 'typing' | 'pause' | 'deleting' | 'blink-after',
    timerId: null as ReturnType<typeof setTimeout> | null,
    isVisible: false,
    mounted: true,
  });

  // Shuffle prompts once on mount
  if (stateRef.current.shuffled === null) {
    stateRef.current.shuffled = shuffleArray(prompts);
  }

  // IntersectionObserver for visibility
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const el = barRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          stateRef.current.isVisible = entry.isIntersecting;
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Main animation loop
  useEffect(() => {
    stateRef.current.mounted = true;

    function tick() {
      if (!stateRef.current.mounted) return;

      const s = stateRef.current;

      // If not visible, just keep polling
      if (!s.isVisible) {
        s.timerId = setTimeout(tick, 200);
        return;
      }

      const currentPrompt = s.shuffled![s.promptIndex % s.shuffled!.length];

      switch (s.phase) {
        case 'blink-before': {
          // Blink the caret for ~800ms, then start typing
          setIsTyping(false);
          setDisplayText('');
          s.timerId = setTimeout(() => {
            s.phase = 'typing';
            s.charIndex = 0;
            tick();
          }, 800);
          break;
        }

        case 'typing': {
          setIsTyping(true);
          if (s.charIndex <= currentPrompt.length) {
            setDisplayText(currentPrompt.slice(0, s.charIndex));
            s.charIndex++;
            // 40-60ms random per character
            const delay = 40 + Math.random() * 20;
            s.timerId = setTimeout(tick, delay);
          } else {
            // Done typing → pause
            s.phase = 'pause';
            setIsTyping(false);
            s.timerId = setTimeout(tick, 2000);
          }
          break;
        }

        case 'pause': {
          // After 2s pause, start deleting
          s.phase = 'deleting';
          s.charIndex = currentPrompt.length;
          tick();
          break;
        }

        case 'deleting': {
          setIsTyping(true);
          if (s.charIndex >= 0) {
            setDisplayText(currentPrompt.slice(0, s.charIndex));
            s.charIndex--;
            // 20-30ms random per character
            const delay = 20 + Math.random() * 10;
            s.timerId = setTimeout(tick, delay);
          } else {
            // Done deleting → blink, then next prompt
            s.phase = 'blink-after';
            setDisplayText('');
            setIsTyping(false);
            s.timerId = setTimeout(() => {
              s.promptIndex++;
              s.phase = 'blink-before';
              tick();
            }, 500);
          }
          break;
        }

        case 'blink-after': {
          // handled by the setTimeout above
          break;
        }
      }
    }

    // Start the loop
    tick();

    return () => {
      stateRef.current.mounted = false;
      if (stateRef.current.timerId) clearTimeout(stateRef.current.timerId);
    };
  }, []);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => {
      window.open('https://agents.productica.in/', '_blank');
      setIsPressed(false);
    }, 150);
  };

  return (
    <div 
      ref={barRef}
      className="mt-14 max-md:mt-4 group relative w-[90%] max-md:w-full h-[64px] max-md:h-[50px] rounded-full flex items-center px-4 cursor-pointer overflow-hidden transition-all duration-700 hover:-translate-y-[2px] hover:border-white/20 hover:shadow-[0_8px_32px_rgba(255,255,255,0.06)] select-none pointer-events-auto"
      style={{ 
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.5)',
        transform: isPressed ? 'scale(0.98)' : undefined,
        transition: isPressed ? 'transform 120ms ease' : undefined,
      }}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* Light sweep on hover */}
      <motion.div 
        className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      />

      {/* Ambient glow behind search bar */}
      <div className="absolute inset-0 bg-white/[0.01] rounded-full blur-xl group-hover:bg-white/[0.03] transition-colors duration-700" />

      {/* Holographic Blob Container */}
      <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center"
        style={{ animation: 'holoFloat 5s ease-in-out infinite' }}
      >
        {/* Ambient glow behind blob */}
        <div 
          className="absolute inset-[-6px] rounded-full blur-lg pointer-events-none transition-all duration-700 group-hover:inset-[-10px] group-hover:blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(100, 140, 255, 0.25), rgba(180, 80, 255, 0.15), transparent 70%)',
            animation: 'holoGlow 4s ease-in-out infinite',
          }}
        />

        {/* Main holographic blob */}
        <div
          className="relative w-full h-full overflow-hidden pointer-events-none"
          style={{
            animation: 'holoMorph 8s ease-in-out infinite, holoShift 6s ease-in-out infinite',
            background: `
              radial-gradient(ellipse at 30% 20%, rgba(120, 200, 255, 0.95) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 30%, rgba(200, 180, 255, 0.9) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 70%, rgba(255, 130, 200, 0.7) 0%, transparent 50%),
              radial-gradient(ellipse at 20% 60%, rgba(80, 160, 255, 0.8) 0%, transparent 45%),
              radial-gradient(ellipse at 80% 70%, rgba(160, 100, 255, 0.85) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.9) 0%, transparent 35%),
              linear-gradient(135deg, #6ec3f4 0%, #8a7cff 25%, #c77dff 50%, #ff6eb4 75%, #00c9ff 100%)
            `,
            backgroundSize: '200% 200%',
          }}
        >
          {/* Inner light/white core */}
          <div
            className="absolute inset-[20%] rounded-full blur-sm pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 40%, transparent 70%)',
            }}
          />

          {/* Rotating specular highlight */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 180deg, rgba(255,255,255,0.35) 240deg, rgba(200,220,255,0.25) 300deg, transparent 360deg)',
              animation: 'holoHighlight 10s linear infinite',
            }}
          />
        </div>
      </div>

      {/* Typewriter text + blinking caret */}
      <div className="ml-4 flex items-center z-10 overflow-hidden whitespace-nowrap min-w-0 flex-1">
        <span className="text-[14px] font-sans tracking-wide text-white/50 group-hover:text-white/90 transition-colors duration-700">
          {displayText}
        </span>
        <span
          className="inline-block w-[1.5px] h-[18px] ml-[1px] flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.6)',
            animation: isTyping ? 'none' : 'caretBlink 1s steps(2, start) infinite',
            opacity: isTyping ? 1 : undefined,
          }}
        />
      </div>
      
      {/* Enter arrow */}
      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-700 z-10 translate-x-2 group-hover:translate-x-0">
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
             <line x1="5" y1="12" x2="19" y2="12"></line>
             <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function AgenticPlatform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll progress across a 500vh tall pinning section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const zoomScale = isMobile ? 2.6 : 1.95;
  const offset = isMobile ? "30%" : "18%";

  // Smoothly transform the Canvas scale and translation based on scroll progress
  const canvasScale = useTransform(scrollYProgress, 
    [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 0.95, 1], 
    [1, 1,    zoomScale,  zoomScale,  zoomScale,  zoomScale,  zoomScale,  zoomScale,  zoomScale,  zoomScale,  1,    1]
  );
  
  const canvasX = useTransform(scrollYProgress, 
    [0, 0.08, 0.18, 0.28, 0.38,   0.48,   0.58,  0.68,  0.78,   0.88,   0.95, 1], 
    ["0%","0%",offset,offset,`-${offset}`,`-${offset}`, offset, offset,`-${offset}`,`-${offset}`, "0%", "0%"]
  );

  const canvasY = useTransform(scrollYProgress, 
    [0, 0.08, 0.18, 0.28, 0.38,   0.48,   0.58,   0.68,   0.78,   0.88,   0.95, 1], 
    ["0%","0%",offset,offset,offset, offset, `-${offset}`, `-${offset}`, `-${offset}`, `-${offset}`, "0%", "0%"]
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
        <motion.div 
          initial={{ opacity: 1, y: 0 }}
          animate={{ 
            opacity: stage === 0 ? 1 : 0, 
            y: stage === 0 ? 0 : -20,
            pointerEvents: stage === 0 ? "auto" : "none"
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute top-12 left-6 right-6 md:left-16 md:right-16 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-1 flex-1">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-semibold block">
              Productica Teams
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              Productica Teams for <span className="text-white/40">Venture Building.</span>
            </h2>
          </div>
          
          <div className="text-[10px] font-mono tracking-widest text-white/40 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full hidden md:block">
            ACTIVE AGENT WORKSPACE
          </div>
        </motion.div>

        {/* Left Side: Copy and details that crossfade */}
        <div className="absolute top-[52%] md:top-[12%] left-6 right-6 md:left-16 md:w-[26%] z-20 pointer-events-none max-md:bg-black/50 max-md:backdrop-blur-lg max-md:border max-md:border-white/10 max-md:p-5 max-md:-mx-5 max-md:rounded-2xl">
          <AnimatePresence mode="wait">
            {stage === 0 && (
              <motion.div
                key="stage-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4 pt-2 md:pt-20"
              >
                <h3 className="text-4xl font-light tracking-tight text-white leading-tight">
                  Meet Your Venture <br />Intelligence Board.
                </h3>
                <p className="text-sm text-white/70 leading-relaxed font-normal">
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
                className="space-y-6 max-md:space-y-4"
              >
                <span className="text-[12px] font-mono tracking-widest text-white/40 block">01 / VIRTUAL CO-FOUNDER</span>
                <h3 className="text-5xl max-md:text-3xl font-light tracking-tight text-white leading-tight">
                  Strategic Startup <br />Thinking Support
                </h3>

                {/* Feature List */}
                <div className="relative pl-5 space-y-0">
                  {/* Vertical connecting line */}
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/[0.08]" />
                  {[
                    { text: "Challenges assumptions", highlight: " before the market does." },
                    { text: "Always available", highlight: " for strategy, validation, and decision-making." },
                    { text: "Thinks like a founder", highlight: " without asking for equity." }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
                      className="group flex items-start gap-3 py-[10px] max-md:py-[6px] cursor-default"
                    >
                      <div className="relative mt-[7px] max-md:mt-[5px] flex-shrink-0">
                        <div className="w-[10px] h-[10px] rounded-full border border-white/20 group-hover:border-white/50 transition-all duration-300 flex items-center justify-center">
                          <div className="w-[4px] h-[4px] rounded-full bg-white/30 group-hover:bg-white/70 group-hover:shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-all duration-300" />
                        </div>
                      </div>
                      <span className="text-[17px] max-md:text-[14px] leading-relaxed max-md:leading-snug text-white/50 group-hover:text-white/80 transition-colors duration-300 font-light">
                        <span className="text-white/90 group-hover:text-white transition-colors duration-300">{item.text}</span>{item.highlight}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <AISearchBar prompts={COFOUNDER_PROMPTS} />
              </motion.div>
            )}

            {stage === 2 && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 max-md:space-y-4"
              >
                <span className="text-[12px] font-mono tracking-widest text-white/40 block">02 / VIRTUAL CMO</span>
                <h3 className="text-5xl max-md:text-3xl font-light tracking-tight text-white leading-tight">
                  Positioning & <br />GTM Strategy
                </h3>

                {/* Feature List */}
                <div className="relative pl-5 space-y-0">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/[0.08]" />
                  {[
                    { text: "Builds data-backed GTM strategies,", highlight: " not marketing fluff." },
                    { text: "Maintains a consistent brand voice", highlight: " across every channel." },
                    { text: "Turns ideas into campaigns", highlight: " that actually drive growth." }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
                      className="group flex items-start gap-3 py-[10px] max-md:py-[6px] cursor-default"
                    >
                      <div className="relative mt-[7px] max-md:mt-[5px] flex-shrink-0">
                        <div className="w-[10px] h-[10px] rounded-full border border-white/20 group-hover:border-white/50 transition-all duration-300 flex items-center justify-center">
                          <div className="w-[4px] h-[4px] rounded-full bg-white/30 group-hover:bg-white/70 group-hover:shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-all duration-300" />
                        </div>
                      </div>
                      <span className="text-[17px] max-md:text-[14px] leading-relaxed max-md:leading-snug text-white/50 group-hover:text-white/80 transition-colors duration-300 font-light">
                        <span className="text-white/90 group-hover:text-white transition-colors duration-300">{item.text}</span>{item.highlight}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <AISearchBar prompts={CMO_PROMPTS} />
              </motion.div>
            )}

            {stage === 3 && (
              <motion.div
                key="stage-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 max-md:space-y-4"
              >
                <span className="text-[12px] font-mono tracking-widest text-white/40 block">03 / PRODUCT STRATEGIST</span>
                <h3 className="text-5xl max-md:text-3xl font-light tracking-tight text-white leading-tight">
                  MVP Sizing & <br />Product Direction
                </h3>

                {/* Feature List */}
                <div className="relative pl-5 space-y-0">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/[0.08]" />
                  {[
                    { text: "Prioritizes features", highlight: " based on user value and business impact." },
                    { text: "Eliminates distractions", highlight: " and keeps the roadmap focused." },
                    { text: "Aligns product decisions", highlight: " with long-term growth goals." }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
                      className="group flex items-start gap-3 py-[10px] max-md:py-[6px] cursor-default"
                    >
                      <div className="relative mt-[7px] max-md:mt-[5px] flex-shrink-0">
                        <div className="w-[10px] h-[10px] rounded-full border border-white/20 group-hover:border-white/50 transition-all duration-300 flex items-center justify-center">
                          <div className="w-[4px] h-[4px] rounded-full bg-white/30 group-hover:bg-white/70 group-hover:shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-all duration-300" />
                        </div>
                      </div>
                      <span className="text-[17px] max-md:text-[14px] leading-relaxed max-md:leading-snug text-white/50 group-hover:text-white/80 transition-colors duration-300 font-light">
                        <span className="text-white/90 group-hover:text-white transition-colors duration-300">{item.text}</span>{item.highlight}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <AISearchBar prompts={STRATEGIST_PROMPTS} />
              </motion.div>
            )}

            {stage === 4 && (
              <motion.div
                key="stage-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 max-md:space-y-4"
              >
                <span className="text-[12px] font-mono tracking-widest text-white/40 block">04 / INVESTOR & CFO</span>
                <h3 className="text-5xl max-md:text-3xl font-light tracking-tight text-white leading-tight">
                  Simulating <br />Investor Scrutiny
                </h3>

                {/* Feature List */}
                <div className="relative pl-5 space-y-0">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/[0.08]" />
                  {[
                    { text: "Analyzes unit economics", highlight: " and financial health in real time." },
                    { text: "Prepares investor-ready insights,", highlight: " metrics, and narratives." },
                    { text: "Helps you make capital-efficient decisions", highlight: " with confidence." }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
                      className="group flex items-start gap-3 py-[10px] max-md:py-[6px] cursor-default"
                    >
                      <div className="relative mt-[7px] max-md:mt-[5px] flex-shrink-0">
                        <div className="w-[10px] h-[10px] rounded-full border border-white/20 group-hover:border-white/50 transition-all duration-300 flex items-center justify-center">
                          <div className="w-[4px] h-[4px] rounded-full bg-white/30 group-hover:bg-white/70 group-hover:shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-all duration-300" />
                        </div>
                      </div>
                      <span className="text-[17px] max-md:text-[14px] leading-relaxed max-md:leading-snug text-white/50 group-hover:text-white/80 transition-colors duration-300 font-light">
                        <span className="text-white/90 group-hover:text-white transition-colors duration-300">{item.text}</span>{item.highlight}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <AISearchBar prompts={INVESTOR_PROMPTS} />
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
                <p className="text-sm text-white/70 leading-relaxed font-normal">
                  Helps founders understand pricing logic, startup runway, unit economics, financial assumptions, and venture scalability.
                </p>
                <div className="pt-4">
                  <a 
                    href="https://agents.productica.in" 
                    target="_blank"
                    rel="noopener noreferrer"
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
        <div className="absolute top-[12%] h-[38%] left-0 right-0 md:top-auto md:bottom-auto md:left-auto md:right-16 md:w-[38%] md:h-[60%] flex items-center justify-center z-10">
          <div className="w-full h-full flex items-center justify-center max-md:scale-[0.70] max-md:-translate-y-4">
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
              <div className={`relative border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden bg-[#020202] transition-all duration-500 ${stage === 1 ? 'border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.05)]' : (stage === 5 ? 'border-white/20' : '')}`}>
                {/* Background GIF */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <img 
                    src="/Cofounder.gif" 
                    alt="Co-Founder Agent" 
                    className={`w-full h-full object-cover object-[center_15%] transition-opacity duration-500 ${
                      stage === 1 ? 'opacity-[0.75]' : 'opacity-[0.15]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-black/40" />
                </div>

                <div className="relative z-10">
                  <span className="text-[8px] font-mono tracking-widest text-white/50 block font-semibold">01 / VIRTUAL CO-FOUNDER</span>
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[7px] font-mono text-white/40">ENGINE STATUS</span>
                  <span className={`text-[7px] font-mono transition-colors duration-300 ${stage === 1 ? 'text-emerald-400 font-bold' : 'text-white/20'}`}>
                    {stage === 1 ? '● ACTIVE' : '○ STANDBY'}
                  </span>
                </div>
              </div>

              {/* TOP RIGHT Cell: Customer Segments (Virtual CMO focus) */}
              <div className={`relative border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden bg-[#020202] transition-all duration-500 ${stage === 2 ? 'border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.05)]' : (stage === 5 ? 'border-white/20' : '')}`}>
                {/* Background GIF */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <img 
                    src="/marketing.gif" 
                    alt="CMO Agent" 
                    className={`w-full h-full object-cover object-[center_15%] transition-opacity duration-500 ${
                      stage === 2 ? 'opacity-[0.75]' : 'opacity-[0.15]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-black/40" />
                </div>

                <div className="relative z-10">
                  <span className="text-[8px] font-mono tracking-widest text-white/50 block font-semibold">02 / VIRTUAL CMO</span>
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[7px] font-mono text-white/40">GTM STATUS</span>
                  <span className={`text-[7px] font-mono transition-colors duration-300 ${stage === 2 ? 'text-emerald-400 font-bold' : 'text-white/20'}`}>
                    {stage === 2 ? '● ACTIVE' : '○ STANDBY'}
                  </span>
                </div>
              </div>

              {/* BOTTOM LEFT Cell: Customer Channels (Virtual Product Strategist focus) */}
              <div className={`relative border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden bg-[#020202] transition-all duration-500 ${stage === 3 ? 'border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.05)]' : (stage === 5 ? 'border-white/20' : '')}`}>
                {/* Background GIF */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <img 
                    src="/Ultraplan.gif" 
                    alt="Product Strategist Agent" 
                    className={`w-full h-full object-cover object-[center_15%] transition-opacity duration-500 ${
                      stage === 3 ? 'opacity-[0.75]' : 'opacity-[0.15]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-black/40" />
                </div>

                <div className="relative z-10">
                  <span className="text-[8px] font-mono tracking-widest text-white/50 block font-semibold">03 / PRODUCT STRATEGIST</span>
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[7px] font-mono text-white/40">ROADMAP STATUS</span>
                  <span className={`text-[7px] font-mono transition-colors duration-300 ${stage === 3 ? 'text-emerald-400 font-bold' : 'text-white/20'}`}>
                    {stage === 3 ? '● ACTIVE' : '○ STANDBY'}
                  </span>
                </div>
              </div>

              {/* BOTTOM RIGHT Cell: Revenue Streams (Virtual Investor & CFO focus) */}
              <div className={`relative border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden bg-[#020202] transition-all duration-500 ${(stage === 4 || stage === 5) ? 'border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.05)]' : ''}`}>
                {/* Background GIF */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <img 
                    src="/Investor.gif" 
                    alt="Investor & CFO Agent" 
                    className={`w-full h-full object-cover object-[center_15%] transition-opacity duration-500 ${
                      (stage === 4 || stage === 5) ? 'opacity-[0.75]' : 'opacity-[0.15]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-black/40" />
                </div>

                <div className="relative z-10">
                  <span className="text-[8px] font-mono tracking-widest text-white/50 block font-semibold">04 / INVESTOR & CFO</span>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[7px] font-mono text-white/40">MODEL STATUS</span>
                  <span className={`text-[7px] font-mono transition-colors duration-300 ${(stage === 4 || stage === 5) ? 'text-emerald-400 font-bold' : 'text-white/20'}`}>
                    {(stage === 4 || stage === 5) ? '● ACTIVE' : '○ STANDBY'}
                  </span>
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
