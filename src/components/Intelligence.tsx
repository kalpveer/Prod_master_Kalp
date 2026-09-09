/* eslint-disable */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Timeframe = '1D' | '30D' | '1Y';
type Tab = 'Cohort Intelligence' | 'Founder Diagnostics' | 'Venture Scorecards';

export default function Intelligence() {
  const [activeTab, setActiveTab] = useState<Tab>('Cohort Intelligence');
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  // High-end minimalist data models
  const dataModels = {
    'Cohort Intelligence': {
      '1D': { 
        stats: [{ label: 'Average Readiness', val: '72%', trend: '+4%' }, { label: 'Tracked Ventures', val: '24', trend: '0' }, { label: 'Ecosystem Velocity', val: '1.2x', trend: '+5%' }],
        primaryPath: "M0,30 C20,30 30,20 50,20 C70,20 80,10 100,5",
        secondaryPath: "M0,35 C20,35 30,30 50,25 C70,20 80,15 100,15"
      },
      '30D': {
        stats: [{ label: 'Average Readiness', val: '78%', trend: '+8%' }, { label: 'Tracked Ventures', val: '24', trend: '0' }, { label: 'Ecosystem Velocity', val: '1.8x', trend: '+15%' }],
        primaryPath: "M0,40 C15,20 30,35 50,15 C70,-5 80,10 100,0",
        secondaryPath: "M0,40 C15,30 30,35 50,25 C70,10 80,15 100,5"
      },
      '1Y': {
        stats: [{ label: 'Average Readiness', val: '84%', trend: '+14%' }, { label: 'Tracked Ventures', val: '48', trend: '+24' }, { label: 'Ecosystem Velocity', val: '2.4x', trend: '+35%' }],
        primaryPath: "M0,40 C10,35 20,40 30,20 C40,0 50,30 60,10 C70,-10 80,15 100,0",
        secondaryPath: "M0,40 C10,38 20,40 30,25 C40,10 50,30 60,15 C70,5 80,20 100,5"
      }
    },
    'Founder Diagnostics': {
      '1D': {
        stats: [{ label: 'Alignment Index', val: '85%', trend: '+1%' }, { label: 'Assessments Done', val: '4', trend: '+2' }, { label: 'Coaching Signals', val: '2', trend: '0' }],
        primaryPath: "M0,20 C30,20 40,15 50,10 C60,5 70,5 100,5",
        secondaryPath: "M0,25 C30,25 40,20 50,15 C60,10 70,10 100,10"
      },
      '30D': {
        stats: [{ label: 'Alignment Index', val: '88%', trend: '+4%' }, { label: 'Assessments Done', val: '124', trend: '+42' }, { label: 'Coaching Signals', val: '18', trend: '+5' }],
        primaryPath: "M0,35 C20,10 40,30 50,15 C60,0 80,20 100,5",
        secondaryPath: "M0,35 C20,15 40,30 50,20 C60,10 80,20 100,10"
      },
      '1Y': {
        stats: [{ label: 'Alignment Index', val: '92%', trend: '+8%' }, { label: 'Assessments Done', val: '1.4K', trend: '+240%' }, { label: 'Coaching Signals', val: '142', trend: '+84%' }],
        primaryPath: "M0,40 C30,0 50,40 70,0 C80,20 90,0 100,5",
        secondaryPath: "M0,40 C30,10 50,40 70,10 C80,25 90,10 100,15"
      }
    },
    'Venture Scorecards': {
      '1D': {
        stats: [{ label: 'Investor Ready', val: '62%', trend: '0%' }, { label: 'Active Diagnostics', val: '12', trend: '+1' }, { label: 'GTM Maturity', val: '68%', trend: '+2%' }],
        primaryPath: "M0,40 C50,40 50,0 100,0",
        secondaryPath: "M0,40 C50,40 50,10 100,10"
      },
      '30D': {
        stats: [{ label: 'Investor Ready', val: '68%', trend: '+6%' }, { label: 'Active Diagnostics', val: '342', trend: '+45' }, { label: 'GTM Maturity', val: '72%', trend: '+4%' }],
        primaryPath: "M0,40 C30,30 40,40 60,20 C80,0 90,20 100,0",
        secondaryPath: "M0,40 C30,35 40,40 60,25 C80,10 90,20 100,5"
      },
      '1Y': {
        stats: [{ label: 'Investor Ready', val: '75%', trend: '+12%' }, { label: 'Active Diagnostics', val: '4.2K', trend: '+180%' }, { label: 'GTM Maturity', val: '81%', trend: '+9%' }],
        primaryPath: "M0,40 C20,40 20,0 40,0 C60,0 60,40 80,40 C100,40 100,0 100,0",
        secondaryPath: "M0,40 C20,40 20,10 40,10 C60,10 60,40 80,40 C100,40 100,10 100,10"
      }
    }
  };

  const currentData = dataModels[activeTab][timeframe];

  return (
    <section className="relative w-full bg-black py-32 px-6 md:px-12 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-20 max-w-3xl">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6 font-mono font-semibold"
          >
            Venture Intelligence for Ecosystems
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter leading-[1.05] mb-6"
          >
            Venture Intelligence <br />
            <span className="text-white/40">for Ecosystems.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed mt-4"
          >
            Institutional dashboards designed for incubators, accelerators, universities, innovation cells, and startup ecosystems.
          </motion.p>
        </div>

        {/* The Interactive Dashboard Workspace */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-5xl relative"
        >
          {/* Extremely subtle, sophisticated ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

          <div className="relative w-full bg-[#030303] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            
            {/* Top Gloss Overlay */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 flex flex-col gap-4 md:gap-8 shrink-0 z-10 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-2 md:mb-4">Ecosystem Layers</div>
                  <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {(Object.keys(dataModels) as Tab[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap md:w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 font-light ${
                          activeTab === tab 
                            ? 'bg-white/10 text-white' 
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-4">Diagnostics Layers</div>
                  <div className="space-y-1 text-xs font-mono text-white/20 px-3 cursor-not-allowed">
                    <div className="py-2 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                      Ecosystem Benchmarking
                    </div>
                    <div className="py-2 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                      Startup Risk Mapping
                    </div>
                    <div className="py-2 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                      Mentor Intervention Insights
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Stage */}
            <div className="flex-1 p-6 md:p-10 flex flex-col gap-10 z-10">
              
              {/* Header & Timeframe Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-light tracking-tight">{activeTab}</h3>
                  <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Live Aggregation Model</p>
                </div>
                
                <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
                  {(['1D', '30D', '1Y'] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all duration-300 ${
                        timeframe === tf 
                          ? 'bg-white text-black font-bold shadow-md' 
                          : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimalist Stat Cards */}
              <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                <AnimatePresence mode="wait">
                  {currentData.stats.map((stat, i) => (
                    <motion.div
                      key={`${activeTab}-${timeframe}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      onMouseEnter={() => setHoveredStat(i)}
                      onMouseLeave={() => setHoveredStat(null)}
                      className={`shrink-0 w-[85%] md:w-auto snap-center border border-white/10 rounded-xl p-5 relative overflow-hidden transition-colors duration-500 cursor-default ${
                        hoveredStat === i ? 'bg-white/5' : 'bg-white/[0.01]'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">{stat.label}</div>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-light tracking-tight">{stat.val}</div>
                        <div className="text-xs font-mono text-white/70 mb-1">{stat.trend}</div>
                      </div>
                      
                      {/* Mini hover sparkline */}
                      <div className={`absolute bottom-0 left-0 right-0 h-8 transition-opacity duration-500 ${hoveredStat === i ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Main Chart Area */}
              <div className="flex-1 min-h-[260px] border border-white/10 rounded-xl relative bg-white/[0.01] overflow-hidden group">
                
                {/* Minimal Grid Matrix */}
                <div className="absolute inset-0 flex justify-between px-8 pointer-events-none opacity-20">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <div key={i} className="h-full border-l border-white/10 border-dashed" />
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col justify-between py-8 pointer-events-none opacity-20">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="w-full border-t border-white/10 border-dashed" />
                  ))}
                </div>

                {/* The SVG Data Lines */}
                <div className="absolute inset-0 px-4 py-8">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="primary-fade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Secondary Ghost Line */}
                    <motion.path 
                      animate={{ d: currentData.secondaryPath }}
                      transition={{ type: "spring", stiffness: 40, damping: 15 }}
                      fill="none" 
                      stroke="rgba(255,255,255,0.2)" 
                      strokeWidth="1" 
                      vectorEffect="non-scaling-stroke"
                    />

                    {/* Fill Gradient under Primary Line */}
                    <motion.path 
                      animate={{ d: `${currentData.primaryPath} L100,40 L0,40 Z` }}
                      transition={{ type: "spring", stiffness: 45, damping: 15 }}
                      fill="url(#primary-fade)"
                    />

                    {/* Primary Crisp Line */}
                    <motion.path 
                      animate={{ d: currentData.primaryPath }}
                      transition={{ type: "spring", stiffness: 45, damping: 15 }}
                      fill="none" 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                      vectorEffect="non-scaling-stroke"
                      className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    />
                  </svg>
                </div>

                {/* Interactive Scrubber Line (appears on hover) */}
                <div className="absolute top-0 bottom-0 w-px bg-white/30 left-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]" />
                </div>

              </div>

            </div>
          </div>
        </motion.div>

        {/* Footer text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center max-w-2xl mt-12"
        >
          <p className="text-sm text-white/70 leading-relaxed font-normal">
            A frictionless command center. Don’t just incubate startups. Diagnose them intelligently. Designed with an ultra-minimal wireframe aesthetic to keep your focus strictly on venture-readiness tracking and founder diagnostics.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
