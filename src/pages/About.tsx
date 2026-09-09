/* eslint-disable */
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Rocket, Target, Zap, Search, ClipboardList, Users } from 'lucide-react';
import Navbar from '../components/Navbar';

const ease: any = [0.16, 1, 0.3, 1];

// ─── Zig-Zag Timeline Data ───────────────────────────────────────────────────
const zigZagData = [
  {
    id: 's1',
    date: 'JAN 2024',
    title: 'The Spark',
    description: 'We realized founders struggled to validate ideas because product-market fit was often based on assumptions, not evidence.',
    icon: Search,
    image: '/our-story/The Spark - Jan 2024.jpeg',
    align: 'left'
  },
  {
    id: 's2',
    date: 'SEPT 2024',
    title: 'First Validation',
    description: 'Our beta proof of concept received encouraging feedback from mentors, universities, and startup incubators.',
    icon: ClipboardList,
    image: '/our-story/Beta POC - Sept 2024.jpg',
    align: 'right'
  },
  {
    id: 's3',
    date: 'NOV 2024',
    title: 'Beta Launch',
    description: "We launched our first beta from a friend's office, helping founders validate ideas completely free.",
    icon: Rocket,
    image: '/our-story/Beta Launch  - Nov 2024.jpeg',
    align: 'left'
  },
  {
    id: 's4',
    date: 'JAN 2025',
    title: 'First Major Milestone',
    description: 'Signed our first institutional partnership and welcomed our first 5,000 users to Productica.',
    icon: Users,
    image: '/our-story/MOU Signed - Jan 2025.jpeg',
    align: 'right'
  },
  {
    id: 's5',
    date: 'MAY 2025',
    title: 'A Place to Build',
    description: 'Productica moved into its first office, giving the team a dedicated space to grow and collaborate.',
    icon: Zap,
    image: '/our-story/First Office - May 2025.jpeg',
    align: 'left'
  },
  {
    id: 's6',
    date: 'SEPT 2025',
    title: 'Growing the Ecosystem',
    description: 'Launched our first AI agents at TiE Vadodara and expanded through strategic collaborations.',
    icon: Target,
    image: '/our-story/Tie Vadodara - Sept 2025.jpeg',
    align: 'right'
  },
  {
    id: 's7',
    date: 'NOV 2025',
    title: 'Building Momentum',
    description: 'Participated in more startup events, connected with founders, and continued growing our community.',
    icon: Search,
    image: '/our-story/More Events - Nov 2025.jpeg',
    align: 'left'
  },
  {
    id: 's8',
    date: 'DEC 2025',
    title: '50,000+ Founders Strong',
    description: 'Another major partnership marked our journey to 50,000 users and growing adoption across ecosystems.',
    icon: ClipboardList,
    image: '/our-story/Mou Signing 50k Users - Dec 2025.png',
    align: 'right'
  },
  {
    id: 's9',
    date: 'DEC 2025',
    title: 'In the Spotlight',
    description: 'Featured on reputed startup and innovation platforms, strengthening our credibility and expanding our community.',
    icon: Search,
    image: '/our-story/Featured on Diff Reputed Platforms - Dec 2025.png',
    align: 'left'
  },
  {
    id: 's10',
    date: 'JAN 2026',
    title: 'From Free to Revenue',
    description: 'Joined NUVenture and welcomed our first paying customers, proving founders saw real value.',
    icon: Rocket,
    image: '/our-story/NUVenture - Jan 2026.jpg',
    align: 'right'
  },
  {
    id: 's11',
    date: 'MAR 2026',
    title: 'Relentless Iteration',
    description: 'We refined every workflow, improved our AI agents, and kept shipping faster than ever.',
    icon: Users,
    image: '/our-story/More Grinding - Mar 2026.jpeg',
    align: 'left'
  },
  {
    id: 's12',
    date: 'APR 2026',
    title: 'Mumbai Expansion',
    description: "Expanded our team into Mumbai and held awareness events, bringing Productica to one of India's largest startup communities.",
    icon: Zap,
    image: '/our-story/Mumbai Expansion - April 2026.jpeg',
    align: 'right'
  },
  {
    id: 's13',
    date: 'JUN 2026',
    title: 'Productica 2.0',
    description: 'A complete platform upgrade with smarter AI, improved workflows, and a better experience for every founder.',
    icon: Target,
    image: '/our-story/Productica 2.0 - June 2026.jpeg',
    align: 'left'
  },
  {
    id: 's14',
    date: 'AUG 2026',
    title: 'Productica 3.0',
    description: 'A surrounding ecosystem of AI Employees and Investor-Graded Framework-based Reports for every aspiring founder.',
    icon: Rocket,
    image: '/our-story/Productica 3.0 - Aug 2026.jpg',
    align: 'right'
  }
];

export default function About() {
  const [pathData, setPathData] = useState<string>('');
  const nodeRefs = useRef<{ [key: number]: HTMLDivElement }>({});
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const finalProgress = isMobile ? scrollYProgress : smoothProgress;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      if (window.innerWidth < 768) {
        const centerX = containerRect.width / 2;
        setPathData(`M ${centerX} 0 L ${centerX} ${containerRect.height}`);
        return;
      }

      // Ensure we sort nodes by their index
      const nodes = Object.keys(nodeRefs.current).sort((a, b) => Number(a) - Number(b)).map(k => nodeRefs.current[Number(k)]).filter(Boolean);

      if (nodes.length < 2) return;

      const centerX = containerRect.width / 2;
      let d = '';

      nodes.forEach((node, i) => {
        const rect = node.getBoundingClientRect();
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;

        if (i === 0) {
          // Start exactly at the first image
          d += `M ${x} ${y} `;
        } else {
          const prevNode = nodes[i - 1];
          const prevRect = prevNode.getBoundingClientRect();
          const prevX = prevRect.left - containerRect.left + prevRect.width / 2;
          const prevY = prevRect.top - containerRect.top + prevRect.height / 2;

          // Smooth S-curve from previous image to current image
          const midY = prevY + (y - prevY) / 2;
          d += `C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y} `;
        }

        // Extend line down to bottom center of container
        if (i === nodes.length - 1) {
          const midY = y + (containerRect.height - y) / 2;
          d += `C ${x} ${midY}, ${centerX} ${midY}, ${centerX} ${containerRect.height}`;
        }
      });
      setPathData(d);
    };

    const observer = new ResizeObserver(updatePath);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updatePath);
    // Timeout to recalculate after layout shift / images load
    const timeout = setTimeout(updatePath, 500);
    updatePath();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePath);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans pb-32">
      <div className="pointer-events-none absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(to right, #ffffff02 1px, transparent 1px), linear-gradient(to bottom, #ffffff02 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      <Navbar />

      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-40 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="flex flex-col items-center gap-6">
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-light tracking-tight text-white leading-[1.1]">We are building the <br /> <span className="font-semibold italic">Intelligence Layer</span> for Founders.</h1>
          <p className="text-lg text-zinc-400 max-w-2xl mt-4 font-light leading-relaxed">Productica is a venture intelligence platform designed to eliminate the guesswork from startup building by empowering founders with synchronized AI agents.</p>
        </motion.div>
      </header>

      {/* ── Main Content Columns ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 space-y-32">

        {/* ── Editorial Timeline Section ── */}
        <section className="relative w-full max-w-6xl mx-auto py-32 overflow-visible">

          <div className="flex flex-col items-center gap-4 mb-40 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-zinc-500 font-mono text-sm tracking-[0.2em] uppercase">The Journey</span>
            </div>
            <h2 className="text-5xl font-bold tracking-tight text-white">Our Story</h2>
          </div>

          <div className="relative w-full pb-20" ref={containerRef}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
              <defs>
                <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {pathData && (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#2A2A2A"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              )}
              {pathData && (
                <motion.path
                  d={pathData}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    pathLength: finalProgress,
                    filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.6)) drop-shadow(0 0 4px rgba(255,255,255,1))'
                  }}
                />
              )}
            </svg>

            <div className="flex flex-col gap-[200px] relative z-10 w-full">
              {zigZagData.map((node, index) => (
                <div
                  key={node.id}
                  className="relative w-full flex items-center min-h-[400px]"
                >

                  {/* Desktop Layout */}
                  <div className="hidden md:flex w-full items-center">
                    {node.align === 'left' ? (
                      <>
                        <div className="w-1/2 flex justify-end items-center pr-24 relative">
                          <div className="text-left w-full max-w-[460px]">
                            <motion.span
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true, margin: "-50% 0px" }}
                              transition={{ duration: 0.6, delay: 0.1 }}
                              className="text-zinc-500 font-mono text-[12px] tracking-[0.2em] uppercase flex items-center gap-2 mb-4"
                            >
                              <node.icon className="w-4 h-4 text-zinc-400" />
                              {node.date}
                            </motion.span>
                            <motion.h3
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-50% 0px" }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                              className="text-[44px] font-bold text-white leading-tight mb-5"
                            >
                              {node.title}
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-50% 0px" }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                              className="text-[#A0A0A0] text-[18px] leading-[1.8]"
                            >
                              {node.description}
                            </motion.p>
                          </div>
                        </div>

                        <div className="w-1/2 flex justify-start items-center pl-24 relative">
                          <motion.div
                            ref={el => { if (el) nodeRefs.current[index] = el; }}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50% 0px" }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                            className="w-full max-w-[480px] relative z-10"
                          >
                            <div className="w-full rounded-[24px] overflow-hidden border border-white/10 shadow-xl group cursor-pointer relative">
                              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                              <img src={node.image} alt={node.title} className="w-full h-auto block grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                            </div>

                          </motion.div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-1/2 flex justify-end items-center pr-24 relative">
                          <motion.div
                            ref={el => { if (el) nodeRefs.current[index] = el; }}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50% 0px" }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                            className="w-full max-w-[480px] relative z-10"
                          >
                            <div className="w-full rounded-[24px] overflow-hidden border border-white/10 shadow-xl group cursor-pointer relative">
                              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                              <img src={node.image} alt={node.title} className="w-full h-auto block grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                            </div>

                          </motion.div>
                        </div>

                        <div className="w-1/2 flex justify-start items-center pl-24 relative">
                          <div className="text-left w-full max-w-[460px]">
                            <motion.span
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true, margin: "-50% 0px" }}
                              transition={{ duration: 0.6, delay: 0.1 }}
                              className="text-zinc-500 font-mono text-[12px] tracking-[0.2em] uppercase flex items-center gap-2 mb-4"
                            >
                              <node.icon className="w-4 h-4 text-zinc-400" />
                              {node.date}
                            </motion.span>
                            <motion.h3
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-50% 0px" }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                              className="text-[44px] font-bold text-white leading-tight mb-5"
                            >
                              {node.title}
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-50% 0px" }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                              className="text-[#A0A0A0] text-[18px] leading-[1.8]"
                            >
                              {node.description}
                            </motion.p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex md:hidden w-full relative px-6 justify-start flex-col gap-6">
                    <div className="text-center w-full p-6 bg-black/60 backdrop-blur-md rounded-2xl border border-white/5 relative z-10 flex flex-col items-center">
                      <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-30% 0px" }}
                        transition={{ duration: 0.6 }}
                        className="text-zinc-500 font-mono text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 mb-2"
                      >
                        <node.icon className="w-3.5 h-3.5 text-zinc-400" />
                        {node.date}
                      </motion.span>
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-30% 0px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                        className="text-3xl font-bold text-white leading-tight mb-3"
                      >
                        {node.title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-30% 0px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        className="text-[#A0A0A0] font-light text-[15px] leading-relaxed"
                      >
                        {node.description}
                      </motion.p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30% 0px" }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full rounded-[16px] overflow-hidden border border-white/10 shadow-lg relative z-10"
                    >
                      <img src={node.image} alt={node.title} className="w-full h-auto block" />
                    </motion.div>
                  </div>

                </div>
              ))}
            </div>

            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full text-center">
              <span className="text-zinc-400 text-3xl font-bold italic whitespace-nowrap">What's Next?</span>
            </div>
          </div>
        </section>

      </main>

      {/* Floating CTA Back to Top */}
      <div className="fixed bottom-12 right-6 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center justify-center w-12 h-12 bg-white text-black hover:bg-neutral-200 transition-all rounded-full shadow-2xl hover:scale-105 active:scale-95"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
