/* eslint-disable */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ReactiveTypography() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
        }
      });

      // Initial state
      gsap.set('.word-build', { opacity: 0 });
      gsap.set('.word-what', { x: -50, opacity: 0 });
      gsap.set('.word-people', { scale: 0.8, opacity: 0 });
      gsap.set('.word-dot', { opacity: 0, scale: 0 });

      // Animate word by word
      tl.to('.word-build', { opacity: 1, duration: 1 })
        .to('.word-what', { x: 0, opacity: 1, duration: 1 }, "-=0.2")
        .to('.word-people', { scale: 1, opacity: 1, duration: 1 }, "-=0.2")
        .to('.word-dot', { opacity: 1, scale: 1, ease: 'back.out(2)', duration: 0.5 });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-black text-white flex items-center justify-center overflow-hidden">

      {/* Static Top Lockup */}
      <div className="absolute top-12 left-0 right-0 w-full flex items-center justify-center z-10 opacity-70">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <img
            src="/9.png"
            alt="Productica"
            className="h-8 md:h-12 object-contain invert"
          />
          <div className="hidden md:block w-[1px] h-8 md:h-10 bg-white/20"></div>
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-white/55 text-[10px] md:text-sm uppercase tracking-[0.3em] font-medium italic">
              backedBy
            </span>
            <a href="https://www.syncoro.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img
                src="/Syncoro Logo - PNG WHITE (1).png"
                alt="Syncoro Ventures"
                className="h-6 md:h-10 object-contain"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl flex flex-wrap justify-center items-center text-center relative z-20">
        <h2 className="text-5xl md:text-8xl lg:text-[8rem] xl:text-[10rem] tracking-tighter leading-[0.95] flex flex-col items-center justify-center font-inter uppercase select-none">
          {/* First Line: BUILD what */}
          <div className="flex items-center gap-x-4 md:gap-x-8">
            <span className="word-build font-normal text-white">BUILD</span>
            <span className="word-what text-white/50 italic font-medium lowercase tracking-normal">what</span>
          </div>
          {/* Second Line: PEOPLE WANT. */}
          <div className="flex items-center gap-x-4 md:gap-x-8">
            <span className="word-people font-normal text-white">PEOPLE</span>
            <span className="word-people font-semibold text-white ml-4 md:ml-8">WANT</span>
            <span className="word-dot text-white font-extrabold">.</span>
          </div>
        </h2>
      </div>
    </section>
  );
}
