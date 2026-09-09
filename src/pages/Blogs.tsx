import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Linkedin } from 'lucide-react';
import Navbar from '../components/Navbar';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

// --- DATA ---

const linkedInArticles = [
  {
    title: "The Rise of Agentic AI",
    excerpt: "Agentic AI traces its origins to the early AI research of the 1950s, which aimed to create machines capable of human-like reasoning.",
    url: "https://www.linkedin.com/pulse/rise-agentic-ai-productica-ai-kjtwe/",
    date: "Jun 2026",
    readTime: "5 min read",
    author: "Productica",
    category: "AI & Engineering",
    img: "https://media.licdn.com/dms/image/v2/D4E12AQEKZOkUjBP3pg/article-cover_image-shrink_720_1280/B4EZ8C7ENTKMAQ-/0/1782460466333?e=2147483647&v=beta&t=8Q5i-HjfVFGyqlZx_MpO3mYolpl8VtWaXW8f4nyLDNA"
  },
  {
    title: "Why Your Startup Failed Before You Started Building",
    excerpt: "I watched a founder spend 6 months building something 12 competitors already owned. He wasn't bad at building — he was bad at stopping before he started.",
    url: "https://www.linkedin.com/pulse/why-your-startup-failed-before-you-started-building-harshil-parikh-0zjef",
    date: "2026",
    readTime: "6 min read",
    author: "Harshil Parikh",
    category: "Validation",
    img: "/linkedin-startup-failed.jpg"
  },
  {
    title: "The Vibe-Coding Bubble Is Bursting.",
    excerpt: "Over the last two years, 'vibe coding' has been one of the hottest narratives in tech. You could literally 'build your startup in 5 minutes.' Here's why that era is ending.",
    url: "https://www.linkedin.com/pulse/vibecoding-bubble-bursting-harshil-parikh-4ztnc",
    date: "Mar 27, 2026",
    readTime: "4 min read",
    author: "Harshil Parikh",
    category: "AI & Engineering",
    img: "/linkedin-vibe-coding.jpg"
  }

];



export default function Blogs() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <Navbar />

      {/* ─── Background Effects ─── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff04 1px, transparent 1px), linear-gradient(to bottom, #ffffff04 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          opacity: 0.06
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-zinc-950/20 via-black to-black" />

      {/* ─── HERO SECTION ─── */}
      <header className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ height: '70vh', minHeight: '480px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="flex flex-col items-center gap-6 max-w-3xl"
        >
          <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
            [ Venture Intelligence Journal ]
          </span>

          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-light tracking-tight text-white leading-[1.08]">
            Venture <span className="font-semibold italic">Intelligence Blog.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl font-light leading-relaxed">
            Deep dives, frameworks, founder essays, and practical startup intelligence designed to help builders validate, launch, and scale with confidence.
          </p>
        </motion.div>

        {/* Hero fade-out gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 pb-32">

        {/* ──────────────────────────── */}
        {/* LINKEDIN ESSAYS (TOP)        */}
        {/* ──────────────────────────── */}
        <section className="mb-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="mb-10"
          >
            <span className="text-[10px] font-mono tracking-[0.4em] text-white/35 uppercase block mb-3">
              [ From LinkedIn ]
            </span>
            <h3 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-2">
              From LinkedIn
            </h3>
            <p className="text-sm text-zinc-500 font-light max-w-lg leading-relaxed">
              Original founder essays and startup insights published on LinkedIn.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linkedInArticles.map((article, idx) => (
              <motion.a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.12, ease }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  aspectRatio: '4 / 3',
                  transition: 'transform 300ms ease, box-shadow 300ms ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-4px)';
                  el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                {/* Background image with zoom */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <div className="absolute inset-0 w-full h-full transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]">
                    <img
                      src={article.img}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 z-10" />
                </div>

                {/* Content overlay */}
                <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-8">
                  {/* Top row: LinkedIn badge + category */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
                        <Linkedin className="w-3.5 h-3.5 text-white/80" />
                      </div>
                      <span className="text-[10px] font-mono tracking-[0.15em] text-white/50 uppercase">LinkedIn</span>
                    </div>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-[9px] font-mono text-white/80 uppercase tracking-[0.15em]">
                      {article.category}
                    </span>
                  </div>

                  {/* Bottom: Title, excerpt, meta */}
                  <div>
                    <h4 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-white leading-[1.15] mb-3 group-hover:text-zinc-100 transition-colors duration-300">
                      {article.title}
                    </h4>
                    <p className="text-sm text-white/45 font-light leading-relaxed line-clamp-2 mb-5 max-w-md">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-white/35">{article.date}</span>
                        <span className="text-[10px] font-mono text-white/25">·</span>
                        <span className="text-[10px] font-mono text-white/35">{article.readTime}</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-white/50 group-hover:text-white/80 transition-colors duration-300">
                        Read on LinkedIn <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </section>




      </main>
    </div>
  );
}
