import { motion } from 'framer-motion';
import { Building2, TrendingUp, Lightbulb, Zap, Search, BarChart3 } from 'lucide-react';

export default function Incubators() {
  return (
    <section className="relative w-full py-32 bg-black text-white overflow-hidden border-t border-zinc-900">
      {/* Background radial gradients for premium depth */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-zinc-800/10 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-zinc-900/30 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Top Split Layout: Intro & Compact Right Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading, Subheading, and Concise Description */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Empower your Startup Portfolio</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Productica for <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 font-extrabold">Incubators.</span>
            </h2>
            
            <h3 className="text-xl md:text-2xl font-semibold text-zinc-200 leading-snug max-w-xl">
              Turn promising ideas into scalable startups.
            </h3>
            
            <p className="text-zinc-400 font-light leading-relaxed text-base md:text-lg max-w-2xl">
              Empower every founder in your portfolio with AI-powered validation, market intelligence, and go-to-market strategy. Help startups build products customers actually want and reach product-market fit faster.
            </p>
          </motion.div>

          {/* Right Column: Redesigned and reduced height feature cards */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-5 grid grid-cols-1 gap-4"
          >
            <div className="p-5 bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-xl flex gap-5 hover:border-white/10 hover:bg-zinc-950/60 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="text-base font-semibold text-white mb-1">Reduce Guesswork</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">Eliminate unvalidated assumptions early. Replace gut feelings with rigorous, structured validation loops.</p>
              </div>
            </div>

            <div className="p-5 bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-xl flex gap-5 hover:border-white/10 hover:bg-zinc-950/60 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="text-base font-semibold text-white mb-1">Accelerate Product-Market Fit</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">Equip your cohort with the GTM strategy and investor-readiness matrices needed to scale and raise efficiently.</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Feature Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-16 border-t border-white/5">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -6, borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(9, 9, 11, 0.6)' }}
            className="p-6 bg-zinc-950/30 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col justify-between h-56 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 font-mono tracking-tight">
                95% Faster
              </span>
            </div>
            <div className="space-y-2 mt-4">
              <h4 className="text-lg font-semibold text-white">Idea Validation</h4>
              <p className="text-sm text-zinc-400 leading-relaxed font-light">
                Test assumptions, customer needs, and market demand in minutes.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -6, borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(9, 9, 11, 0.6)' }}
            className="p-6 bg-zinc-950/30 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col justify-between h-56 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 font-mono tracking-tight">
                10x Smarter
              </span>
            </div>
            <div className="space-y-2 mt-4">
              <h4 className="text-lg font-semibold text-white">Market Research</h4>
              <p className="text-sm text-zinc-400 leading-relaxed font-light">
                Generate competitor insights and discover growth opportunities instantly.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -6, borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(9, 9, 11, 0.6)' }}
            className="p-6 bg-zinc-950/30 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col justify-between h-56 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 font-mono tracking-tight">
                1 Unified Platform
              </span>
            </div>
            <div className="space-y-2 mt-4">
              <h4 className="text-lg font-semibold text-white">Portfolio Intelligence</h4>
              <p className="text-sm text-zinc-400 leading-relaxed font-light">
                Track startup progress and provide better guidance with data-driven insights.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
