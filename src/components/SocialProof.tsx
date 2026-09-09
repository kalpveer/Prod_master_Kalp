/* eslint-disable */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useVelocity, useSpring, useTransform, useAnimationFrame, useMotionValue } from 'framer-motion';

import itmSls from '../data/Incubators Logos/ITM SLS INC.jpeg';
import itmV from '../data/Incubators Logos/ITM V INC.jpeg';
import nif from '../data/Incubators Logos/NIF.jpeg';
import sedc from '../data/Incubators Logos/SEDC.png';
import uok from '../data/Incubators Logos/UOK IEDC.jpeg';

import djsceUni from '../data/University Logos/DJSCE.jpeg';
import itmUni from '../data/University Logos/ITM.jpeg';
import itmVUni from '../data/University Logos/ITMV.jpeg';
import nuvUni from '../data/University Logos/NUV.jpeg';
import sigmaUni from '../data/University Logos/Sigma University.jpeg';
import uokUni from '../data/University Logos/UOK.jpeg';

gsap.registerPlugin(ScrollTrigger);

const row1 = [
  { name: 'AWS', logo: '/logos/Amazon_Web_Services-Logo.wine.svg', imgClass: 'scale-[1] md:scale-[1]' },
  { name: 'Cloudflare', logo: '/logos/Cloudflare-Logo.wine.svg', imgClass: 'scale-[1.2] md:scale-[1.3] mx-4 md:mx-6' },
  { name: 'GitHub', logo: '/logos/GitHub-Wordmark-Logo.wine.svg' },
  { name: 'Google Cloud', logo: '/logos/Google_Cloud_Platform-Logo.wine.svg', imgClass: 'scale-[1.5] md:scale-[1.8] mx-4 md:mx-8' },
  { name: 'IBM', logo: '/logos/IBM-Logo.wine.svg' },
  { name: 'Microsoft', logo: '/logos/Microsoft-Logo.wine.svg', imgClass: 'scale-[1.8] md:scale-[2.2] mx-8 md:mx-12' },
  { name: 'MongoDB', logo: '/logos/MongoDB-Logo.wine.svg', imgClass: 'scale-[1.8] md:scale-[2.2] mx-8 md:mx-12' },
  { name: 'Nvidia', logo: '/logos/Nvidia-Horizontal-Black-Logo.wine.svg', imgClass: 'scale-[1.8] md:scale-[2.2] mx-8 md:mx-12' },
  { name: 'Supabase', logo: '/logos/supabase-logo-wordmark--light.svg', imgClass: 'scale-[0.5] md:scale-[0.6]' },
];

const row2 = [
  { name: '#1 STARTUP IN INDIA', style: 'font-black tracking-tight text-sm' },
  { name: '#1 AI STARTUP IN VADODARA', style: 'font-semibold tracking-tight text-sm' },
  { name: '#3 DATA & ANALYTICS IN INDIA', style: 'font-bold tracking-widest text-sm' },
  { name: '#11 AI STARTUP IN INDIA', style: 'font-medium tracking-tight text-sm' },
  { name: '#1 MARKET ANALYSIS IN INDIA', style: 'font-black tracking-widest text-sm' },
  { name: '#8 MARKET RESEARCH IN INDIA', style: 'font-semibold tracking-tight text-sm' },
  { name: 'X2 TOP AI GLOBAL COMPANY', style: 'font-black tracking-widest text-sm' },
];

const row3 = [
  { name: 'ITM SLS INC', logo: itmSls },
  { name: 'DJSCE', logo: djsceUni },
  { name: 'ITM V INC', logo: itmV },
  { name: 'ITM', logo: itmUni },
  { name: 'NIF', logo: nif },
  { name: 'ITMV', logo: itmVUni },
  { name: 'SEDC', logo: sedc },
  { name: 'NUV', logo: nuvUni },
  { name: 'UOK IEDC', logo: uok },
  { name: 'Sigma University', logo: sigmaUni },
  { name: 'UOK', logo: uokUni },
];

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export interface MarqueeItem {
  name: string;
  logo?: string;
  style?: string;
  imgClass?: string;
}

export function MarqueeRow({
  items,
  baseVelocity = -5,
  isImages = false,
  itemsPerScreen,
}: {
  items: MarqueeItem[];
  baseVelocity?: number;
  isImages?: boolean;
  itemsPerScreen?: number;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  const velocityFactor = useTransform(smoothVelocity, [-1000, 0, 1000], [-3, 0, 3], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const directionFactor = useRef<number>(1);
  const [isHovered, setIsHovered] = useState(false);

  useAnimationFrame((_t, delta) => {
    if (isHovered) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // When scrolling fast, exponentially increase speed and update direction
    let velocity = velocityFactor.get();

    if (velocity < 0) {
      directionFactor.current = -1;
    } else if (velocity > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * Math.abs(velocity);
    baseX.set(baseX.get() + moveBy);
  });

  // Render items 4 times internally for a super smooth, unnoticable -25% to -50% translation loop
  const quadrupled = [...items, ...items, ...items, ...items];

  return (
    <div
      className="marquee-outer relative overflow-hidden w-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`marquee-inner flex items-center w-max py-0 ${itemsPerScreen ? '' : 'gap-8 md:gap-20 pr-8 md:pr-20'}`}
        style={{ x }}
      >
        {quadrupled.map((item, i) => (
          isImages && item.logo ? (
            <div
              key={i}
              className="flex items-center justify-center h-12 md:h-20 shrink-0"
              style={itemsPerScreen ? { width: `${100 / itemsPerScreen}vw` } : undefined}
            >
              <img
                src={item.logo}
                alt={item.name}
                className={`h-full w-auto object-contain transition-all duration-500 filter grayscale hover:grayscale-0 opacity-40 hover:opacity-100 ${item.imgClass || ''}`}
              />
            </div>
          ) : (
            <span
              key={i}
              className={`text-2xl md:text-3xl text-black/20 hover:text-black/70 transition-colors duration-300 cursor-default select-none whitespace-nowrap ${item.style || ''}`}
            >
              {item.name}
            </span>
          )
        ))}
      </motion.div>
    </div>
  );
}

export default function SocialProof() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-white py-28 md:py-36 overflow-hidden"
    >
      {/* Horizontal fade masks */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-64 z-20"
        style={{ background: 'linear-gradient(to right, white, transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-64 z-20"
        style={{ background: 'linear-gradient(to left, white, transparent)' }}
      />

      <div className="flex flex-col items-center gap-10 md:gap-12">
        {/* Eyebrow heading */}
        <div ref={headingRef} className="text-center px-6 opacity-0">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-black/30 mb-5">
            Trusted by founders building the future
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-black">
            80,000+ Founders.{' '}
            <span className="text-black/30">40+ Countries.</span>
          </h2>
        </div>

        {/* F6S Badge Label */}
        <div className="flex justify-center -mb-6">
          <img
            src="/logos/f6s-badge.png"
            alt="F6S Top Startup Badge"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </div>

        {/* Dynamic Velocity Marquee rows */}
        <div className="w-full flex flex-col gap-16 md:gap-24 mt-8">
          <div className="flex flex-col items-center gap-8 w-full">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/20 text-center">
              Supported By
            </p>
            <MarqueeRow items={row1} baseVelocity={-1} isImages={true} />
          </div>

          <div className="flex flex-col items-center gap-8 w-full">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/20 text-center">
              Our Achievements
            </p>
            <MarqueeRow items={row2} baseVelocity={1} />
          </div>

          <div className="flex flex-col items-center gap-8 w-full">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/20 text-center">
              Affiliated With
            </p>
            <MarqueeRow items={row3} baseVelocity={-1} isImages={true} />
          </div>
        </div>
      </div>
    </section>
  );
}

