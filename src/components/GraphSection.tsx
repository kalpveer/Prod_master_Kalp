/* eslint-disable */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GraphSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!pathRef.current) return;
      
      const length = pathRef.current.getTotalLength();
      
      // Setup initial state
      gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
      
      // Animate line
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
          end: 'bottom 80%',
          scrub: 1,
        }
      });
      
      // Animate points
      const points = gsap.utils.toArray<SVGCircleElement>('.data-point');
      points.forEach((point, i) => {
        gsap.fromTo(point, 
          { r: 0, opacity: 0 },
          { 
            r: 4, 
            opacity: 1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: containerRef.current,
              start: `top+=${i * 10}% 60%`,
              end: `top+=${(i + 1) * 10}% 60%`,
              scrub: 1,
            }
          }
        );
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full bg-white py-40 flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl flex flex-col items-center">
        
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-24 text-center">
          Signals become <span className="font-bold underline decoration-2 underline-offset-8">Insight</span>.
        </h2>
        
        <div className="relative w-full max-w-3xl aspect-[2/1] border-l border-b border-black/10 p-4">
          
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pl-4 pb-4">
            <div className="w-full h-px bg-black/5"></div>
            <div className="w-full h-px bg-black/5"></div>
            <div className="w-full h-px bg-black/5"></div>
            <div className="w-full h-px bg-black/5"></div>
          </div>
          
          {/* Graph SVG */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 500" preserveAspectRatio="none">
            <defs>
              <linearGradient id="line-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="black" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* Smooth curved path with gradient stroke */}
            <path 
              ref={pathRef}
              d="M 0,450 C 150,450 200,300 350,250 C 500,200 650,400 800,150 C 900,50 950,50 1000,0" 
              fill="none" 
              stroke="url(#line-gradient)" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            
            {/* Data points */}
            <circle cx="0" cy="450" className="data-point" fill="white" stroke="black" strokeWidth="2" />
            <circle cx="350" cy="250" className="data-point" fill="white" stroke="black" strokeWidth="2" />
            <circle cx="800" cy="150" className="data-point" fill="black" />
            <circle cx="1000" cy="0" className="data-point" fill="black" />
          </svg>
          
          {/* Labels */}
          <div className="absolute -bottom-10 left-0 text-xs font-mono text-black/40">Launch</div>
          <div className="absolute -bottom-10 right-0 text-xs font-mono text-black/40">Scale</div>
          <div className="absolute -left-12 top-0 text-xs font-mono text-black/40">Growth</div>
        </div>
      </div>
    </section>
  );
}
