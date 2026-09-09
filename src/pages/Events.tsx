/* eslint-disable */
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GalleryBento from '../components/GalleryBento';


// ─── 3D Tilt Card (dark-mode variant) ────────────────────────────────────────
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = ((centerY - y) / centerY) * 8;
    setTilt({ rotateX, rotateY });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }}
      style={{ transformPerspective: 800, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
      {/* Glare overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 0.08 : 0,
          background: `radial-gradient(circle at ${50 + tilt.rotateY * 4}% ${50 - tilt.rotateX * 4}%, white 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}

// ─── Event data ──────────────────────────────────────────────────────────────
const events = [
  {
    num: '01',
    tag: 'COMMUNITY',
    title: 'E-Chai Vadodara',
    desc: "An exclusive networking event where founders, innovators, and aspiring entrepreneurs explored AI-powered startup validation, exchanged ideas, and built meaningful connections within Gujarat's startup ecosystem.",
    date: '2024',
    location: 'Vadodara, India',
    attendees: '120+',
    image: '/event1_user.png',
  },
  {
    num: '02',
    tag: 'SUMMIT',
    title: 'NUVenture',
    desc: 'An innovation and entrepreneurship summit connecting startups with investors, mentors, and industry leaders through networking, insightful sessions, and live startup showcases.',
    date: '2026',
    location: 'Vadodara, India',
    attendees: '500+',
    image: '/event2_user.jpg',
  },
  {
    num: '03',
    tag: 'TEAM',
    title: 'Behind the Build',
    desc: 'Every feature begins with conversations, whiteboards, and countless iterations as our team works together to turn ambitious ideas into reality.',
    date: '2026',
    location: 'Vadodara, India',
    attendees: '80+',
    image: '/event3_user.jpg',
  },
  {
    num: '04',
    tag: 'TEAM',
    title: 'Building from Mumbai',
    desc: 'Our Mumbai team brings together diverse expertise, bold ideas, and relentless execution to shape the next generation of startup intelligence.',
    date: '2026',
    location: 'Mumbai, India',
    attendees: '200+',
    image: '/event4_user.jpg',
  },
  {
    num: '05',
    tag: 'SUMMIT',
    title: 'TiECon Vadodara',
    desc: "Representing Productica at one of the region's leading entrepreneurship conferences, engaging with the startup ecosystem through networking, collaboration, and meaningful conversations.",
    date: '2025',
    location: 'Vadodara, India',
    attendees: '350+',
    image: '/event5_user.jpg',
  },
  {
    num: '06',
    tag: 'SUMMIT',
    title: 'DMC 2025 - GESIA',
    desc: 'A day of insightful discussions, ecosystem networking, and collaboration with technology leaders working to shape the future of entrepreneurship.',
    date: '2025',
    location: 'Vadodara, India',
    attendees: '150+',
    image: '/event6_user.jpg',
  },
];

// ─── Horizontal Scroll Events Section ────────────────────────────────────────
function HorizontalScrollEvents() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  const [endOffset, setEndOffset] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 ? '-95%' : '-65%'
  );

  useEffect(() => {
    const handleResize = () => {
      setEndOffset(window.innerWidth < 768 ? '-95%' : '-65%');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll distance for 6 cards + spacing
  const x = useTransform(scrollYProgress, [0, 1], ['5%', endOffset]);

  return (
    <div ref={targetRef} className="h-[350vh] relative w-full mt-0 bg-black border-t border-white/5">
      <div className="sticky top-0 flex h-screen items-center max-md:items-end max-md:pb-[5vh] overflow-hidden w-full">

        {/* ── Pinned Left: Hero "Events" Card ── */}
        <div className="absolute left-4 md:left-12 top-[14vh] md:top-1/2 md:-translate-y-1/2 z-10 w-[calc(100%-32px)] md:w-[450px] pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl shadow-white/[0.02]">
            <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase mb-4 block">
              [ Productica Events ]
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter leading-[1.05] mb-4 text-white">
              Events <br />
              <span className="text-white/30">& Experiences.</span>
            </h2>
            <p className="text-white/50 text-base md:text-lg leading-relaxed font-light">
              Join the Productica community at exclusive workshops, summits, hackathons, and networking events across India.
            </p>
          </div>
        </div>

        {/* ── Scrolling Event Cards Track ── */}
        <motion.div style={{ x }} className="flex gap-4 md:gap-8 pl-[50vw] md:pl-[60vw]">
          {events.map((event, idx) => (
            <TiltCard
              key={idx}
              className="w-[280px] md:w-[380px] h-[400px] md:h-[520px] flex flex-col bg-zinc-950 border border-white/10 rounded-2xl shrink-0 shadow-lg hover:shadow-2xl hover:shadow-white/[0.03] transition-shadow duration-300 relative overflow-hidden group cursor-default"
            >
              {/* ── Event Image (Full Background) ── */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl transform-gpu">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* ── Hover Overlay ── */}
              <div className="absolute inset-0 bg-zinc-950/85 rounded-2xl opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity duration-500 z-10" />

              {/* ── Subtle background circle ── */}
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/[0.03] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none z-10 opacity-0 group-hover:opacity-100" />

              {/* ── Architectural Crosshairs ── */}
              <div className="absolute top-[45%] left-6 w-2 h-px bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <div className="absolute top-[45%] right-6 w-2 h-px bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <div className="absolute bottom-[35%] left-6 w-2 h-px bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <div className="absolute bottom-[35%] right-6 w-2 h-px bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

              {/* ── Card Content (Hidden by default, slides up on hover) ── */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-20 opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-500">

                <div className="flex items-center justify-between w-full mb-6">
                  <span className="text-xs font-mono text-white/40">({event.num})</span>
                  <span className="text-[9px] font-mono tracking-[0.3em] text-white/80 uppercase bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full">
                    {event.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-medium tracking-tight text-white capitalize leading-snug mb-4">
                  {event.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-white/60 leading-relaxed font-light font-mono mb-6 flex-grow">
                  {event.desc}
                </p>

                {/* Divider */}
                <div className="w-full h-px bg-white/20 mb-5" />

                {/* Meta Info */}
                <div className="flex flex-wrap gap-x-4 gap-y-3 text-[11px] text-white/60 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </span>
                </div>
              </div>
            </TiltCard>
          ))}

          {/* ── Final CTA Card ── */}
          <div className="w-[280px] md:w-[420px] h-[400px] md:h-[520px] flex flex-col justify-center items-center bg-white rounded-2xl p-8 md:p-10 shrink-0 text-black mr-6 md:mr-12 text-center shadow-2xl relative overflow-hidden">
            {/* Tech grid background */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <h3 className="text-xl md:text-2xl font-light tracking-tight mb-6 leading-relaxed relative z-10">
              Be part of the Productica movement. Join founders, builders, and innovators shaping the future.
            </h3>
            <div className="w-12 h-px bg-black/20 mb-6 relative z-10 mx-auto" />
            <p className="text-xs text-black/50 italic leading-relaxed font-light relative z-10 mb-8">
              Events are where ideas ignite.<br />
              The community is where they grow.
            </p>
            <a
              href="https://agents.productica.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-zinc-800 transition-colors group"
            >
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Events Page ────────────────────────────────────────────────────────
export default function Events() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <Navbar />

      {/* Background Effects */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff04 1px, transparent 1px), linear-gradient(to bottom, #ffffff04 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/20 via-black to-black" />



      {/* ── Horizontal Scroll Events Section ── */}
      <HorizontalScrollEvents />

      {/* ── Bento Grid Gallery ── */}
      <GalleryBento />

      {/* ── Footer ── */}
      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
}
