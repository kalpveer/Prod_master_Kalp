import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

export default function ComingSoon() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    // 15th July 2026
    const targetDate = new Date('2026-07-15T00:00:00');

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center selection:bg-white selection:text-black font-sans">
      
      <Navbar 
        showBackButton={true} 
        backHref="#" 
        onBackClick={(e) => { e.preventDefault(); window.history.back(); }} 
      />



      <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white mb-12 uppercase text-center max-w-4xl px-4">
        We are launching that soon...
      </h1>

      <div className="bg-[#0a0a0a] rounded-2xl md:rounded-3xl p-8 md:p-12 flex flex-col items-center shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Subtle glow effect behind clock */}
        <div className="absolute inset-0 bg-white/[0.02] mix-blend-overlay pointer-events-none" />
        
        <div className="flex items-center gap-4 md:gap-8 relative z-10">
          <FlipCard value={formatNumber(timeLeft.days)} label="DAYS" />
          
          <div className="flex flex-col gap-3 md:gap-5 pb-6 md:pb-8">
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 rounded-full"></div>
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 rounded-full"></div>
          </div>
          
          <FlipCard value={formatNumber(timeLeft.hours)} label="HRS" />
          
          <div className="flex flex-col gap-3 md:gap-5 pb-6 md:pb-8">
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 rounded-full"></div>
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 rounded-full"></div>
          </div>

          <FlipCard value={formatNumber(timeLeft.minutes)} label="MINS" />
        </div>
      </div>

    </div>
  );
}

function FlipCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      <div className="relative bg-[#111] w-20 h-28 md:w-32 md:h-44 rounded-lg md:rounded-xl flex items-center justify-center shadow-2xl overflow-hidden border border-white/10">
        
        {/* Top half background */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#161616] z-0" />
        
        {/* Bottom half background */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#111] z-0" />
        
        {/* Text */}
        <span className="text-white text-5xl md:text-[5.5rem] font-medium tracking-tighter z-10" style={{ fontFamily: 'Inter, sans-serif' }}>
          {value}
        </span>
        
        {/* Overlay crack / line across middle */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/60 z-20" />
        <div className="absolute top-[calc(50%+1px)] left-0 w-full h-[1px] bg-white/5 z-20" />

        {/* Flip notches on sides */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 md:w-1.5 h-3 md:h-4 bg-[#0a0a0a] border-r border-y border-white/10 rounded-r-md z-30" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 md:w-1.5 h-3 md:h-4 bg-[#0a0a0a] border-l border-y border-white/10 rounded-l-md z-30" />
        
      </div>
      <span className="text-zinc-500 text-sm md:text-[15px] font-medium tracking-[0.2em] uppercase">
        {label}
      </span>
    </div>
  );
}
