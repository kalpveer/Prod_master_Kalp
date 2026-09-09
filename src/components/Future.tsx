/* eslint-disable */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Future() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in line by line
      gsap.fromTo('.future-line-1',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 50%',
          }
        }
      );

      gsap.fromTo('.future-line-2',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          delay: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 50%',
          }
        }
      );

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-white flex flex-col items-center justify-center">
      <div className="container mx-auto px-6 text-center max-w-5xl">
        <h2 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tighter text-black font-semibold !leading-tight flex flex-col items-center">
          <span className="future-line-1 opacity-0">The future of startups <br/> is not guessing.</span>
          <span className="future-line-2 opacity-0 text-black/40 mt-8 italic font-medium">It's understanding the market.</span>
        </h2>
      </div>
    </section>
  );
}
