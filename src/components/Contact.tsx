/* eslint-disable */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ADDRESSES } from '../data/addresses';

gsap.registerPlugin(ScrollTrigger);

type FormState = {
  name: string;
  email: string;
  company: string;
  message: string;
};

type FocusedState = {
  name: boolean;
  email: boolean;
  company: boolean;
  message: boolean;
};

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({ name: '', email: '', company: '', message: '' });
  const [focused, setFocused] = useState<FocusedState>({ name: false, email: false, company: false, message: false });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const rafRef = useRef<number | null>(null);
  
  // Track cursor inside section with throttling
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - left;
    const cy = e.clientY - top;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setCursor({ x: cx, y: cy });
    });
  };

  useEffect(() => {
    try {
      const savedFlow = sessionStorage.getItem('productica_estimated_flow');
      if (savedFlow) {
        const data = JSON.parse(savedFlow);
        if (data.totalCredits && data.modules?.length) {
          const count = data.journeyLength || data.modules.length;
          const modCr = data.moduleCredits || count;
          const prmCr = data.requiredPromptCredits || count;
          const flowMsg = `Interested in buying Estimated Flow (${data.totalCredits} Total Credits — ${count} Modules: ${modCr} Module Cr + ${prmCr} Required Prompt Cr + ${data.extraPromptCredits || 0} Extra Prompts)`;
          setForm(prev => ({ ...prev, message: prev.message ? prev.message : flowMsg }));
        }
      }
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      let mm = gsap.matchMedia();
      
      mm.add({
        reduce: "(prefers-reduced-motion: reduce)",
        full: "(prefers-reduced-motion: no-preference)"
      }, (context) => {
        let { reduce } = context.conditions as any;
        const yOffset = reduce ? 0 : 40;
        const dur = reduce ? 0.4 : 0.9;
        const isMobile = window.innerWidth < 768;

        // Horizontal line draw-in
        gsap.fromTo(lineRef.current,
          { scaleX: 0, transformOrigin: 'left center', opacity: reduce ? 0 : 1 },
          {
            scaleX: 1,
            opacity: 1,
            duration: reduce ? 0.5 : 1.2,
            ease: 'power3.inOut',
            scrollTrigger: { 
              trigger: containerRef.current, 
              start: 'top 80%',
              once: true
            }
          }
        );

        // Heading words reveal
        const words = headingRef.current?.querySelectorAll('.contact-word');
        if (words) {
          gsap.fromTo(words,
            { y: reduce ? '0%' : '110%', opacity: 0 },
            {
              y: '0%', opacity: 1, duration: dur, ease: 'power3.out', stagger: reduce ? 0 : 0.1,
              scrollTrigger: { 
                trigger: containerRef.current, 
                start: 'top 75%',
                once: true
              }
            }
          );
        }

        // Tags slide in
        const tags = tagsRef.current?.querySelectorAll('.contact-tag');
        if (tags) {
          gsap.fromTo(tags,
            { x: reduce ? 0 : -30, opacity: 0 },
            {
              x: 0, opacity: 1, duration: reduce ? 0.4 : 0.8, ease: 'power2.out', stagger: reduce ? 0 : 0.15,
              scrollTrigger: { 
                trigger: containerRef.current, 
                start: 'top 70%',
                once: true
              }
            }
          );
        }

        // Form fields stagger in - Uniform trigger for mobile reliability
        const fields = formRef.current?.querySelectorAll('.input-group');
        if (fields) {
          gsap.fromTo(fields,
            { y: yOffset, opacity: 0 },
            {
              y: 0, opacity: 1, duration: dur, ease: 'power3.out', stagger: reduce ? 0 : 0.15,
              scrollTrigger: { 
                trigger: isMobile ? containerRef.current : formRef.current, 
                start: isMobile ? 'top 40%' : 'top 70%',
                once: true
              }
            }
          );
        }

        // Refresh ScrollTrigger to catch layout shifts on mobile
        if (isMobile) {
          setTimeout(() => ScrollTrigger.refresh(), 500);
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (key: keyof FormState, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleFocus = (key: keyof FocusedState) => {
    setFocused(prev => ({ ...prev, [key]: true }));
  };

  const handleBlur = (key: keyof FocusedState) => {
    setFocused(prev => ({ ...prev, [key]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      await fetch(import.meta.env.VITE_DISCORD_WEBHOOK_URL ?? "", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `**New Contact Message!**\n**Name:** ${form.name}\n**Company:** ${form.company || 'N/A'}\n**Email:** ${form.email}\n**Message:**\n${form.message}`
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to send webhook:", err);
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  const isFloating = (key: keyof FormState) => focused[key as keyof FocusedState] || form[key].length > 0;

  return (
    <section
      id="contact"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full bg-black overflow-hidden py-16 md:py-0"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(500px circle at ${cursor.x}px ${cursor.y}px, rgba(255,255,255,0.04), transparent 60%)`,
        }}
      />

      <div ref={lineRef} className="w-full h-px bg-white/10 origin-left" />

      <div className="relative z-10 container mx-auto max-w-6xl px-6 pt-16 md:pt-32 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24">
        <div className="flex flex-col justify-between">
          <div ref={tagsRef} className="flex flex-col gap-6">
            <div className="contact-tag opacity-0 flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/60">
                Contact
              </span>
              <div className="h-px w-8 bg-white/20" />
            </div>

            <div className="overflow-hidden">
              <h2
                ref={headingRef}
                className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[1.15] text-white flex flex-wrap gap-x-4"
              >
                {["Let's", "build", "something"].map((word) => (
                  <span key={word} className="overflow-hidden inline-block px-2 py-4 -mx-2 -my-4">
                    <span className="contact-word inline-block opacity-0">{word}</span>
                  </span>
                ))}
                <span className="overflow-hidden inline-block w-full px-2 py-4 -mx-2 -my-4">
                  <span className="contact-word inline-block opacity-0 text-white/50 italic font-medium">
                    real.
                  </span>
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              {[
                { label: 'Email', value: <a href="mailto:info@productica.in" className="hover:text-white transition-colors">info@productica.in</a> },
                { label: 'Phone', value: <a href="tel:+917069133331" className="hover:text-white transition-colors">+91 70691 33331</a> },
                { label: 'Office', value: <>{ADDRESSES.office.lines.map((line, i) => (
                  <span key={line}>{line}{i < ADDRESSES.office.lines.length - 1 && <br />}</span>
                ))}</> },
                { label: 'Branch', value: <>{ADDRESSES.branch.lines.map((line, i) => (
                  <span key={line}>{line}{i < ADDRESSES.branch.lines.length - 1 && <br />}</span>
                ))}</> },
                { label: 'Response', value: 'Within 24 hours' },
              ].map(({ label, value }) => (
                <div key={label} className="contact-tag opacity-0 flex items-start gap-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/60 w-28 shrink-0 mt-1">{label}</span>
                  <span className="text-sm font-normal text-white/70 leading-relaxed max-w-xs">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-3 gap-3 mt-20 self-end">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-md border border-white/5 bg-white/[0.02]"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-start">
          {!submitted ? (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="input-group opacity-0 relative">
                  <label
                    className={`absolute left-0 font-mono text-xs uppercase tracking-widest transition-all duration-300 pointer-events-none ${
                      isFloating('name')
                        ? 'text-white/70 -top-5 text-[10px]'
                        : 'text-white/50 top-3'
                    }`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    required
                    className="w-full bg-transparent border-0 border-b border-white/30 pb-3 pt-3 text-white text-sm font-normal outline-none focus:border-white/60 transition-colors duration-300 placeholder-transparent"
                  />
                  <div className="h-px bg-white/0 mt-0 transition-all duration-500 origin-left scale-x-0 peer-focus:scale-x-100 peer-focus:bg-white/30" />
                </div>

                <div className="input-group opacity-0 relative">
                  <label
                    className={`absolute left-0 font-mono text-xs uppercase tracking-widest transition-all duration-300 pointer-events-none ${
                      isFloating('company')
                        ? 'text-white/70 -top-5 text-[10px]'
                        : 'text-white/50 top-3'
                    }`}
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => handleChange('company', e.target.value)}
                    onFocus={() => handleFocus('company')}
                    onBlur={() => handleBlur('company')}
                    className="w-full bg-transparent border-0 border-b border-white/30 pb-3 pt-3 text-white text-sm font-normal outline-none focus:border-white/60 transition-colors duration-300 placeholder-transparent"
                  />
                </div>
              </div>

              <div className="input-group opacity-0 relative">
                <label
                  className={`absolute left-0 font-mono text-xs uppercase tracking-widest transition-all duration-300 pointer-events-none ${
                    isFloating('email')
                      ? 'text-white/70 -top-5 text-[10px]'
                      : 'text-white/50 top-3'
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  required
                  className="w-full bg-transparent border-0 border-b border-white/30 pb-3 pt-3 text-white text-sm font-light outline-none focus:border-white/60 transition-colors duration-300 placeholder-transparent"
                />
              </div>

              <div className="input-group opacity-0 relative mt-4">
                <label
                  className={`absolute left-0 font-mono text-xs uppercase tracking-widest transition-all duration-300 pointer-events-none ${
                    isFloating('message')
                      ? 'text-white/70 -top-5 text-[10px]'
                      : 'text-white/50 top-3'
                  }`}
                >
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')}
                  required
                  rows={4}
                  className="w-full bg-transparent border-0 border-b border-white/30 pb-3 pt-3 text-white text-sm font-normal outline-none focus:border-white/60 transition-colors duration-300 placeholder-transparent resize-none"
                />
              </div>

              <div className="input-group opacity-0 flex flex-col gap-6 mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono text-white/60 uppercase tracking-widest">
                    All fields required*
                  </span>
                  
                  <button
                    type="submit"
                    disabled={sending}
                    className={`group relative flex items-center gap-3 px-8 py-4 rounded-full text-sm font-medium tracking-wide transition-all duration-500 overflow-hidden ${
                      sending
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-white/90 active:scale-95'
                    }`}
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300 rounded-full" />
                    
                    {sending ? (
                      <>
                        <span className="flex gap-1 items-center">
                          <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        <span>Sending</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                <p className="w-full text-center mt-12 text-[10px] uppercase tracking-[0.3em] font-medium text-white/50">
                  Build what the market wants.
                </p>
              </div>
            </form>
          ) : (
            <div className="w-full flex flex-col items-start gap-8 py-12">
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center animate-pulse">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-white tracking-tight mb-3">Message received.</h3>
                <p className="text-white/60 font-normal text-sm leading-relaxed max-w-sm">
                  We'll get back to you within 24 hours. In the meantime, feel free to explore Productica.
                </p>
              </div>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', message: '' }); }}
                className="text-xs font-mono uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors duration-300"
              >
                ← Send another message
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
