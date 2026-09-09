/* eslint-disable */
import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, CheckCircle2, AlertTriangle, FastForward, Navigation, Lightbulb, Users, Target, Search, DollarSign, Crosshair, BarChart, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { parseStackAiReport } from '../utils/reportParser';

function BentoCard({ title, icon: Icon, children, className = "", highlight = false }: { title: string, icon?: any, children: React.ReactNode, className?: string, highlight?: boolean }) {
  return (
    <div className={`break-inside-avoid mb-4 rounded-3xl border p-6 md:p-8 flex flex-col ${
      highlight 
        ? 'bg-neutral-950 text-white border-neutral-800 shadow-xl' 
        : 'bg-white border-black/10 text-black shadow-sm'
    } ${className}`}>
      <div className="flex items-center gap-2 mb-5">
        {Icon && <Icon size={16} className={highlight ? 'text-white/60' : 'text-black/40'} />}
        <h3 className={`text-[10px] font-mono font-bold uppercase tracking-widest ${highlight ? 'text-white/60' : 'text-black/40'}`}>{title}</h3>
      </div>
      <div className="flex-1 flex flex-col justify-start">
        {children}
      </div>
    </div>
  );
}

export default function ValidationReport({
  raw,
  onReset,
}: {
  raw: string;
  ideaName?: string;
  onReset: () => void;
}) {
  const [showRaw, setShowRaw] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const data = useMemo(() => parseStackAiReport(raw), [raw]);
  const isYes = data.decision?.toUpperCase().includes('YES') || data.decision?.toUpperCase().includes('PROCEED');

  const handleDownloadPdf = () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    const opt = {
      margin:       15, // 15mm margins
      filename:     'AI_Raw_Validation_Report.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    // Need a slight delay to ensure UI updates `isDownloading` state
    setTimeout(() => {
      html2pdf().set(opt).from(printRef.current!).save().then(() => {
        setIsDownloading(false);
      }).catch((err: any) => {
        console.error("PDF generation failed", err);
        setIsDownloading(false);
      });
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[92%] md:w-[88%] max-w-[1400px] mx-auto py-12 text-black"
    >
      {/* 0. HEADER SECTION */}
      <div className="mb-4 flex flex-col items-center justify-center gap-6 p-8 md:p-12 lg:p-16 rounded-3xl bg-white border border-black/10 shadow-sm relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 to-white pointer-events-none" />
        <div className="relative z-10 space-y-6 max-w-3xl flex flex-col items-center">
           
           {/* Top central confidence area */}
           <div className="flex flex-col items-center gap-3 mb-2">
             <div className="flex items-center gap-1.5 md:gap-2">
               {[...Array(10)].map((_, i) => (
                 <div key={i} className={`h-2 md:h-2.5 w-6 md:w-8 rounded-full ${i < (data.confidence || 0) ? (isYes ? 'bg-green-500' : 'bg-red-500') : 'bg-black/10'}`} />
               ))}
             </div>
             <span className="text-xs md:text-sm font-mono font-bold uppercase tracking-widest text-black/40">
               Confidence: {data.confidence}/10
             </span>
           </div>

           <div className="flex flex-wrap gap-3 items-center justify-center">
             <span className={`px-4 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 border shadow-sm max-w-xl text-center ${isYes ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
               {isYes ? <CheckCircle2 size={14} className="shrink-0"/> : <AlertTriangle size={14} className="shrink-0"/>} {data.decision}
             </span>
           </div>
           
           <div className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tighter text-black leading-snug prose max-w-none prose-p:mx-auto prose-p:my-0 prose-headings:my-0">
             <ReactMarkdown>{data.oneLine || "Analysis indicates significant pivots are required."}</ReactMarkdown>
           </div>
        </div>
      </div>

      {/* FULL WIDTH: HOW TO WIN */}
      {(data.winAngle || data.winOptions?.length > 0) && (
        <BentoCard title="How To Win" icon={Lightbulb} className="bg-neutral-950 text-white w-full mb-4 border-neutral-800 shadow-xl relative overflow-hidden" highlight={true}>
          {/* Subtle top-right accent glow */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/[0.01] rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full pt-4 items-stretch">
             
             {/* Left Column: The Strategic Angle */}
             <div className="flex-1 flex flex-col justify-start space-y-3 text-left">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40 block">The ONE Angle to Win</span>
                {data.winAngle && (
                  <div className="text-base md:text-lg leading-relaxed text-neutral-200 prose prose-invert max-w-none prose-p:my-2 prose-strong:text-white prose-em:text-white prose-ul:list-disc prose-ul:pl-5 prose-li:my-1.5 prose-strong:font-bold text-left">
                    <ReactMarkdown>{data.winAngle}</ReactMarkdown>
                  </div>
                )}
             </div>
             
             {/* Right Column: Required Checkpoint (Caution/Checkpoint block) */}
             {data.ideaDead && (
                <div className="w-full lg:w-[380px] bg-red-950/20 border border-red-900/30 rounded-3xl p-6 flex flex-col justify-start shrink-0 text-left relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                   <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-400/80 block mb-3 flex items-center gap-1.5 z-10">
                      <AlertTriangle size={12} className="text-red-500 animate-pulse shrink-0" />
                      Critical Condition
                   </span>
                   <div className="text-sm text-red-200/90 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-strong:text-red-100 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1.5 text-left z-10">
                      <ReactMarkdown>{data.ideaDead}</ReactMarkdown>
                   </div>
                </div>
             )}
          </div>
          
          {/* Win options displayed below if they exist */}
          {data.winOptions?.length > 0 && (
             <div className="w-full mt-8 pt-8 border-t border-white/5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-5 text-left">Strategic Win Paths</span>
                <div className="grid md:grid-cols-2 gap-4 w-full">
                  {data.winOptions?.map((opt, i) => (
                    <div key={i} className="flex flex-col text-left bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                      <span className="text-white/40 font-mono text-[9px] uppercase font-bold mb-3 bg-white/5 px-2 py-0.5 rounded w-max">Option 0{i+1}</span>
                      <div>
                        <span className="font-bold text-base block mb-2 text-white tracking-tight">{opt.title}</span>
                        <div className="text-sm text-neutral-400 prose prose-sm prose-invert leading-relaxed text-left"><ReactMarkdown>{opt.details}</ReactMarkdown></div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </BentoCard>
      )}

      {/* MASONRY GRID FOR DENSE CARDS */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
        
        {/* 1. CLARITY */}
        <BentoCard title="Core Clarity" icon={Target}>
          <div className="space-y-5">
            {data.realProblem && (
               <div>
                  <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Real Problem</span>
                  <div className="text-[15px] font-medium leading-relaxed prose prose-sm max-w-none prose-p:my-0"><ReactMarkdown>{data.realProblem}</ReactMarkdown></div>
               </div>
            )}
            {data.whoCares && (
               <div className="pt-4 border-t border-black/5">
                  <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Target Persona</span>
                  <div className="text-[14px] leading-relaxed prose prose-sm prose-p:my-1"><ReactMarkdown>{data.whoCares}</ReactMarkdown></div>
               </div>
            )}
            {data.whatTheyUse && (
               <div className="pt-4 border-t border-black/5">
                  <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Current Solution</span>
                  <div className="text-[14px] leading-relaxed prose prose-sm prose-p:my-1"><ReactMarkdown>{data.whatTheyUse}</ReactMarkdown></div>
               </div>
            )}
            {data.whyDifferent && (
               <div className="pt-4 border-t border-black/5">
                  <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Differentiation</span>
                  <div className="text-[14px] font-medium leading-relaxed prose prose-sm max-w-none prose-p:my-0"><ReactMarkdown>{data.whyDifferent}</ReactMarkdown></div>
               </div>
            )}
          </div>
        </BentoCard>

        {/* 2. MARKET TRUTH */}
        <BentoCard title="Market Reality" icon={BarChart}>
           <div className="space-y-6">
              {data.marketReality && (
                <div className="text-lg font-bold leading-snug tracking-tight prose max-w-none prose-p:my-0"><ReactMarkdown>{data.marketReality}</ReactMarkdown></div>
              )}
              {data.tam && (
                <div>
                  <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">TAM</span>
                  <div className="text-[14px] prose prose-sm"><ReactMarkdown>{data.tam}</ReactMarkdown></div>
                </div>
              )}
              {data.whoPays && (
                <div className="pt-4 border-t border-black/5">
                  <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Buyer Profile</span>
                  <div className="text-[14px] prose prose-sm"><ReactMarkdown>{data.whoPays}</ReactMarkdown></div>
                </div>
              )}
              {data.hardTruth && (
                <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100/50 flex flex-col justify-center mt-6">
                  <span className="text-[10px] font-mono font-bold uppercase text-red-600 block mb-2 flex items-center gap-1.5"><AlertTriangle size={14}/> The Hard Truth</span>
                  <div className="text-[14px] font-medium leading-relaxed text-black/90 italic tracking-tight"><ReactMarkdown>{data.hardTruth}</ReactMarkdown></div>
                </div>
              )}
           </div>
        </BentoCard>

        {/* 3. COMPETITION */}
        {data.competitors?.length > 0 && (
          <BentoCard title="Existing Competitors" icon={Search} className="bg-stone-50/50">
            <div className="grid gap-4">
               {data.competitors.slice(0, 4).map((comp, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-black/10 shadow-sm hover:shadow-md transition-shadow">
                     <span className="block font-bold text-base mb-1.5 tracking-tight border-b border-black/5 pb-2">{comp.name}</span>
                     <div className="text-[13px] text-black/70 prose prose-sm leading-relaxed"><ReactMarkdown>{comp.details}</ReactMarkdown></div>
                  </div>
               ))}
            </div>
            {data.whyYouLose && (
               <div className="mt-5 pt-5 border-t border-black/5">
                 <span className="text-[11px] font-bold uppercase text-red-600 block mb-2">Why you lose by default</span>
                 <div className="text-[14px] font-medium text-black/80 leading-relaxed"><ReactMarkdown>{data.whyYouLose}</ReactMarkdown></div>
               </div>
            )}
          </BentoCard>
        )}

        {/* 4. MONEY REALITY */}
        <BentoCard title="Monetization" icon={DollarSign} className="bg-stone-50/50">
           <div className="space-y-5">
              {data.moneyHowMuch && (
                <div>
                   <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Pricing Model</span>
                   <div className="text-[14px] font-medium prose prose-sm leading-relaxed"><ReactMarkdown>{data.moneyHowMuch}</ReactMarkdown></div>
                </div>
              )}
              {data.moneyWhyNot && (
                <div className="pt-4 border-t border-black/5">
                   <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Friction Points</span>
                   <div className="text-[14px] prose prose-sm leading-relaxed"><ReactMarkdown>{data.moneyWhyNot}</ReactMarkdown></div>
                </div>
              )}
              {data.moneyRisk && (
                <div className="pt-4 border-t border-black/10">
                   <span className="text-[11px] font-bold uppercase text-red-500 block mb-1.5 flex items-center gap-1.5"><AlertTriangle size={14}/> Biggest Risk</span>
                   <div className="text-[14px] font-medium text-red-700 leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-strong:text-red-800"><ReactMarkdown>{data.moneyRisk}</ReactMarkdown></div>
                </div>
              )}
           </div>
        </BentoCard>

        {/* 6. FAILURE PATTERNS */}
        <BentoCard title="Failure Patterns" icon={AlertTriangle}>
           <div className="space-y-5">
             {data.failurePattern && (
               <div>
                 <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Common Pattern</span>
                 <div className="text-[14px] prose prose-sm leading-relaxed"><ReactMarkdown>{data.failurePattern}</ReactMarkdown></div>
               </div>
             )}
             {data.trap && (
               <div className="pt-4 border-t border-black/5">
                 <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">The Trap</span>
                 <div className="text-[14px] prose prose-sm leading-relaxed"><ReactMarkdown>{data.trap}</ReactMarkdown></div>
               </div>
             )}
           </div>
        </BentoCard>

        {/* 7. FIRST 10 USERS */}
        <BentoCard title="First 10 Users" icon={Users}>
           <div className="space-y-5">
             {data.exactPeople && (
               <div>
                 <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Exact Profile</span>
                 <div className="text-[14px] font-medium prose prose-sm leading-relaxed"><ReactMarkdown>{data.exactPeople}</ReactMarkdown></div>
               </div>
             )}
             {data.whereFind && (
               <div className="pt-4 border-t border-black/5">
                 <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Where to find them</span>
                 <div className="text-[14px] prose prose-sm leading-relaxed"><ReactMarkdown>{data.whereFind}</ReactMarkdown></div>
               </div>
             )}
             {data.whySayYes && (
               <div className="pt-4 border-t border-black/5">
                 <span className="text-[11px] font-bold uppercase text-black/40 block mb-1.5">Pitch Hook</span>
                 <div className="text-[14px] prose prose-sm leading-relaxed"><ReactMarkdown>{data.whySayYes}</ReactMarkdown></div>
               </div>
             )}
           </div>
        </BentoCard>


        {/* 8. EXECUTION */}
        {data.steps?.length > 0 && (
          <BentoCard title="Execution: Next 72 Hours" icon={FastForward} className="bg-stone-50/50">
             <div className="space-y-4">
               {data.steps.map((st, i) => (
                 <div key={i} className="flex gap-3 bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                   <div className="w-5 h-5 shrink-0 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold font-mono text-black/40 mt-0.5">{i+1}</div>
                   <div className="min-w-0 flex-1">
                     <span className="font-bold text-[14px] tracking-tight block mb-1.5">{st.title === 'Step' || !st.title ? `Step ${i+1}` : st.title}</span>
                     <div className="text-[13px] text-black/70 prose prose-sm prose-p:my-0.5 leading-relaxed"><ReactMarkdown>{st.details}</ReactMarkdown></div>
                   </div>
                 </div>
               ))}
               {data.mustInclude && (
                 <div className="mt-4 bg-white p-4 rounded-xl border border-black/10">
                   <span className="text-[10px] font-mono font-bold uppercase text-black/50 block mb-1.5">Must Include</span>
                   <div className="text-[13px] font-medium prose prose-sm prose-p:my-0 leading-relaxed"><ReactMarkdown>{data.mustInclude}</ReactMarkdown></div>
                 </div>
               )}
             </div>
          </BentoCard>
        )}

        {/* 9. SIGNALS */}
        {(data.continueSignals?.length > 0 || data.stopSignals?.length > 0) && (
          <BentoCard title="Signals" icon={Navigation}>
             <div className="space-y-5">
               {data.continueSignals?.length > 0 && (
                 <div className="bg-green-50/50 rounded-2xl p-5 border border-green-100">
                    <span className="text-[11px] font-bold uppercase text-green-700 block mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"/> Continue If</span>
                    <ul className="space-y-2.5">
                      {data.continueSignals.map((s,i) => <li key={i} className="text-[13px] text-green-900 font-medium leading-relaxed pl-3 border-l-2 border-green-200">{s}</li>)}
                    </ul>
                 </div>
               )}
               {data.stopSignals?.length > 0 && (
                 <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100">
                    <span className="text-[11px] font-bold uppercase text-red-700 block mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"/> Stop If</span>
                    <ul className="space-y-2.5">
                      {data.stopSignals.map((s,i) => <li key={i} className="text-[13px] text-red-900 font-medium leading-relaxed pl-3 border-l-2 border-red-200">{s}</li>)}
                    </ul>
                 </div>
               )}
             </div>
          </BentoCard>
        )}

        {/* 10. FINAL SCOREBOARD */}
        <BentoCard title="Scorecard" icon={BarChart} className="bg-stone-50/50">
          <div className="grid grid-cols-2 gap-3">
             {[
               { label: "Survival", val: data.survivalProb },
               { label: "Market", val: data.marketScore },
               { label: "Competition", val: data.compScore },
               { label: "Monetization", val: data.monetizationScore },
             ].map((stat, idx) => (
               <div key={idx} className="bg-white rounded-2xl p-4 border border-black/10 flex flex-col justify-center items-center text-center shadow-sm">
                 <span className="text-[9px] font-mono font-bold text-black/40 uppercase tracking-widest mb-1.5">{stat.label}</span>
                 <span className="font-black text-xl lg:text-2xl text-black tracking-tighter">{stat.val?.split('/')[0] || '-'}<span className="text-black/30 text-sm lg:text-base">/10</span></span>
               </div>
             ))}
          </div>
        </BentoCard>

      </div>

      {/* 11. PIVOT STRATEGY FULL WIDTH */}
      {data.smarterVersion && (
        <BentoCard title="Pivot Strategy" icon={Crosshair} className="w-full mt-4 bg-stone-50/50">
           <div className="prose prose-sm max-w-none md:prose-base prose-p:leading-relaxed text-black/80 prose-strong:text-black">
              <ReactMarkdown>{data.smarterVersion}</ReactMarkdown>
           </div>
        </BentoCard>
      )}

      {/* FINAL VERDICT ACTION */}
      <div className="mt-8 bg-stone-50 border border-black/10 p-8 md:p-10 rounded-3xl flex flex-col lg:flex-row items-start lg:items-stretch gap-8 justify-between shadow-sm">
         <div className="flex-1 space-y-4 flex flex-col justify-center">
            <span className="text-[10px] font-mono font-bold uppercase text-black/40 block tracking-widest">Final Assessment</span>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter leading-snug prose max-w-none prose-p:my-0 italic"><ReactMarkdown>{data.finalVerdictText}</ReactMarkdown></div>
         </div>
         {(data.brutalTruth || data.whatShouldDo) && (
           <div className="flex-1 lg:border-l border-t lg:border-t-0 border-black/10 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-center space-y-5">
              {data.brutalTruth && (
                 <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-red-600 block mb-2 flex items-center gap-1.5"><AlertTriangle size={14}/> The Brutal Truth</span>
                    <div className="text-[14px] text-black/80 font-medium prose prose-sm max-w-none leading-relaxed prose-p:my-0"><ReactMarkdown>{data.brutalTruth}</ReactMarkdown></div>
                 </div>
              )}
              {data.whatShouldDo && (
                 <div className={data.brutalTruth ? "pt-5 border-t border-black/5" : ""}>
                    <span className="text-[10px] font-mono font-bold uppercase text-black/40 block mb-2">Action Plan</span>
                    <div className="text-[14px] text-black/70 prose prose-sm max-w-none leading-relaxed prose-p:my-0"><ReactMarkdown>{data.whatShouldDo}</ReactMarkdown></div>
                 </div>
              )}
           </div>
         )}
      </div>

      {/* Raw Output Actions */}
      <div className="pt-8">
         <div className="flex flex-wrap gap-4 items-center justify-center">
           <button style={{display: 'none'}} onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-2 group px-5 py-2.5 hover:bg-black/5 rounded-full transition-colors border border-transparent hover:border-black/5">
             <FileText size={14} className="text-black/40 group-hover:text-black transition-colors"/>
             <span className="text-[11px] font-bold font-mono tracking-widest uppercase text-black/60 group-hover:text-black transition-colors">Raw AI Output Source</span>
             <ChevronDown size={14} className={`text-black/40 transition-transform ${showRaw ? 'rotate-180' : ''}`} />
           </button>
           
           <button onClick={handleDownloadPdf} disabled={isDownloading} className="flex items-center gap-2 group px-6 py-2.5 bg-black text-white hover:bg-black/90 rounded-full transition-colors disabled:opacity-50">
             {isDownloading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
             ) : (
                <Download size={14} className="text-white/70 group-hover:text-white transition-colors" />
             )}
             <span className="text-[11px] font-bold font-mono tracking-widest uppercase text-white/90 group-hover:text-white transition-colors">
               {isDownloading ? 'Generating PDF...' : 'Download PDF'}
             </span>
           </button>
         </div>

         <AnimatePresence>
           {showRaw && (
             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
               <div className="p-6 md:p-8 bg-stone-50 border border-black/10 rounded-3xl mt-4 prose prose-sm prose-zinc max-w-none text-black/70 marker:text-black/30 shadow-inner">
                 <ReactMarkdown>{raw}</ReactMarkdown>
               </div>
             </motion.div>
           )}
         </AnimatePresence>
         
         {/* HIDDEN PRINT DIV FOR HTML2PDF */}
         <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '800px', backgroundColor: 'white' }}>
            <div ref={printRef} className="p-8 prose prose-slate max-w-none bg-white text-black">
               <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '16px', marginBottom: '24px', fontWeight: 900, textAlign: 'center' }}>AI Validation Report</h1>
               <ReactMarkdown>{raw}</ReactMarkdown>
            </div>
         </div>
      </div>

      {/* Footer Return */}
      <div className="flex justify-center pt-8 pb-12">
        <button
           onClick={onReset}
           className="group flex justify-center items-center gap-3 w-max mx-auto bg-black text-white hover:bg-black/90 px-8 py-4 rounded-full transition-all duration-300"
        >
           <span className="text-[11px] font-mono uppercase font-bold tracking-widest">Evaluate Another Idea</span>
           <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </motion.div>
  );
}
