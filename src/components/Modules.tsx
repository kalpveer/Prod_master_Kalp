/* eslint-disable */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Target, 
  PieChart, 
  CheckSquare, 
  Rocket, 
  Presentation,
  ArrowRight
} from 'lucide-react';

const MODULES = [
  {
    id: '01',
    title: 'Idea Validation Intelligence',
    description: 'Evaluate startup ideas using venture-readiness frameworks, customer clarity analysis, market relevance systems, execution feasibility logic, and startup risk evaluation.',
    icon: Lightbulb,
    features: ['Venture-Readiness Frameworks', 'Customer Clarity Analysis', 'Startup Risk Evaluation']
  },
  {
    id: '02',
    title: 'Market & Competitor Intelligence',
    description: 'Understand market opportunities, positioning gaps, competitive blind spots, customer behavior shifts, category dynamics, and venture differentiation opportunities.',
    icon: Target,
    features: ['Positioning Gap Analysis', 'Competitive Blind Spots', 'Venture Differentiation']
  },
  {
    id: '03',
    title: 'Go-To-Market Intelligence',
    description: 'Identify customer acquisition pathways, positioning clarity, distribution opportunities, pricing logic, early adopter segments, and startup GTM risks.',
    icon: Rocket,
    features: ['Acquisition Pathways', 'Distribution & Pricing Logic', 'Startup GTM Risks']
  },
  {
    id: '04',
    title: 'Product-Market Fit Readiness',
    description: 'Analyze startup traction quality, retention behavior, customer pain intensity, repeat usage signals, and venture readiness for scaling.',
    icon: PieChart,
    features: ['Traction Quality Analysis', 'Retention Behavior Signals', 'Scale Readiness Mapping']
  },
  {
    id: '05',
    title: 'Investor Readiness Intelligence',
    description: 'Evaluate startup narratives, market strength, traction quality, defensibility, business-model clarity, and likely investor concerns before fundraising.',
    icon: Presentation,
    features: ['Narrative & Defensibility', 'Business-Model Clarity', 'Investor Concern Predictor']
  },
  {
    id: '06',
    title: 'Startup Health Diagnostics',
    description: 'Assess founder readiness, GTM maturity, execution gaps, startup risks, operational clarity, and strategic weaknesses across the venture lifecycle.',
    icon: CheckSquare,
    features: ['Founder Readiness Matrix', 'Execution Gap Assessment', 'Strategic Weakness Auditing']
  }
];

export default function Modules() {
  const [activeModule, setActiveModule] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="py-24 bg-black text-white relative border-t border-white/10" id="modules">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-sm font-mono tracking-[0.2em] text-white/50 mb-4 uppercase">
            [ Architecture ]
          </h2>
          <p className="text-4xl md:text-6xl font-light tracking-tight">
            The Venture <br />
            <span className="font-serif italic text-white/70">Intelligence</span> Stack.
          </p>
          <p className="mt-6 text-white/50 text-base md:text-lg max-w-xl font-light leading-relaxed">
            Structured intelligence systems designed to help ventures validate faster, think more clearly, and build with stronger strategic direction.
          </p>
        </div>

        {/* Command Center Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          {/* Left: Interactive List */}
          <div className="lg:w-1/2 flex flex-col space-y-2">
            {MODULES.map((mod, index) => {
              const isActive = activeModule === index;
              return (
                <div key={mod.id} className="flex flex-col">
                  <button
                    onClick={() => setActiveModule(index)}
                    className={`group relative text-left py-5 px-6 transition-all duration-300 border-l border-white/10 ${
                      isActive ? 'bg-white/5 border-white border-l-2' : 'hover:bg-white/[0.02] hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <span className={`font-mono text-xs tracking-wider transition-colors ${isActive ? 'text-white' : 'text-white/30'}`}>
                          {mod.id}
                        </span>
                        <span className={`text-xl md:text-2xl font-light transition-all ${isActive ? 'text-white translate-x-2' : 'text-white/60 group-hover:text-white/80'}`}>
                          {mod.title}
                        </span>
                      </div>
                      {isActive && !isMobile && (
                        <motion.div
                          layoutId="active-indicator"
                          className="text-white"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <ArrowRight size={18} />
                        </motion.div>
                      )}
                    </div>
                  </button>

                  {/* Mobile Stack Card (Exact Design) */}
                  <AnimatePresence>
                    {isMobile && isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="relative bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-xl flex flex-col mt-2 mb-4 mx-2">
                          {/* Top: Icon & Number */}
                          <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center">
                              {(() => {
                                const Icon = mod.icon;
                                return <Icon size={24} strokeWidth={1.5} />;
                              })()}
                            </div>
                            <span className="font-mono text-sm text-white/30">
                              // {mod.id}
                            </span>
                          </div>

                          {/* Middle: Title & Description */}
                          <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-light mb-4">
                              {mod.title}
                            </h3>
                            <p className="text-white/60 text-base md:text-lg leading-relaxed font-light mb-8">
                              {mod.description}
                            </p>
                          </div>

                          {/* Bottom: Feature List */}
                          <div className="mt-auto">
                            <div className="w-full h-px bg-gradient-to-r from-white/20 to-transparent mb-6" />
                            <ul className="space-y-3">
                              {mod.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm font-mono text-white/50">
                                  <span className="w-1 h-1 bg-white/30 rounded-full" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right: Display Portal (Sticky) */}
          <div className="hidden lg:block lg:w-1/2 relative lg:sticky lg:top-32 h-[450px] md:h-[500px]">
            <div className="absolute inset-0 bg-white/5 border border-white/10 backdrop-blur-sm p-6 md:p-12 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col h-full"
                >
                  {/* Top: Icon & Number */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center">
                      {(() => {
                        const Icon = MODULES[activeModule].icon;
                        return <Icon size={24} strokeWidth={1.5} />;
                      })()}
                    </div>
                    <span className="font-mono text-sm text-white/30">
                      // {MODULES[activeModule].id}
                    </span>
                  </div>

                  {/* Middle: Title & Description */}
                  <div className="flex-1">
                    <h3 className="text-3xl font-light mb-4">
                      {MODULES[activeModule].title}
                    </h3>
                    <p className="text-white/60 text-lg leading-relaxed font-light mb-8 max-w-md">
                      {MODULES[activeModule].description}
                    </p>
                  </div>

                  {/* Bottom: Feature List */}
                  <div className="mt-auto">
                    <div className="w-full h-px bg-gradient-to-r from-white/20 to-transparent mb-6" />
                    <ul className="space-y-3">
                      {MODULES[activeModule].features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm font-mono text-white/50">
                          <span className="w-1 h-1 bg-white/30 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Ambient Glow behind the portal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}
