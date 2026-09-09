/* eslint-disable */
import { useEffect, useState } from 'react';

const sections = [
  { id: 'reality', label: '01. Reality' },
  { id: 'free-validation', label: '02. Validate' },
  { id: 'agents', label: '03. Productica Teams' },
  { id: 'why-choose', label: '04. Why choose' },
  { id: 'achievements', label: '05. Achievements' },
  { id: 'stack', label: '06. Stack' },
  { id: 'spis', label: '07. SPIS' },
  { id: 'pricing-section', label: '08. Pricing' },
  { id: 'contact', label: '09. Contact' },
];

export default function TableOfContents() {
  const [activeSection, setActiveSection] = useState('reality');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      let currentSection = '';

      for (const { id } of sections) {
        const element = document.getElementById(id);
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY;
          if (top - window.innerHeight / 4 <= scrollPosition) {
            currentSection = id;
          }
        }
      }

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    setTimeout(handleScroll, 300);
    setTimeout(handleScroll, 1000);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);

    const element = document.getElementById(id);
    if (element) {
      const lenis = (window as any).lenis;
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(element, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          offset: 0,
        });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 z-[90] flex-col justify-between h-[340px] pointer-events-auto mix-blend-difference text-white">
      <div className="absolute top-0 right-0 h-full w-[1px] bg-white/20 pointer-events-none" />

      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => scrollToSection(e, id)}
          className="group relative flex items-center justify-end w-32 h-4 cursor-pointer"
          aria-label={label}
        >
          <span
            className={`absolute right-10 text-[9px] font-mono uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap pointer-events-none ${
              activeSection === id
                ? 'opacity-100 text-white font-semibold'
                : 'opacity-0 text-white/40 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2'
            }`}
          >
            {label}
          </span>

          <div
            className={`absolute right-0 h-[1px] transition-all duration-500 ease-out origin-right flex ${
              activeSection === id
                ? 'bg-white w-6'
                : 'bg-white/30 w-2 group-hover:w-4 group-hover:bg-white/70'
            }`}
          />
        </a>
      ))}
    </div>
  );
}
