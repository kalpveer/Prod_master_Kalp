import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';

interface NavbarProps {
  showBackButton?: boolean;
  backHref?: string;
  onBackClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function Navbar({ showBackButton, backHref = "/#ecosystem", onBackClick }: NavbarProps = {}) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Magnetic Button state
  const btnRef = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rafRef = useRef<number | null>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!btnRef.current) return;
    const { clientX, clientY } = e;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // Only apply magnetic effect on desktop/hoverable devices
    if (window.matchMedia("(any-hover: none)").matches) return;
    
    rafRef.current = requestAnimationFrame(() => {
      if (!btnRef.current) return;
      const { left, top, width, height } = btnRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      x.set((clientX - centerX) * 0.3);
      y.set((clientY - centerY) * 0.3);
    });
  };

  const reset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    x.set(0);
    y.set(0);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150 && !isMobileMenuOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'About', href: '/about' },
    { name: 'Events', href: '/events' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <>
      <div className="fixed top-6 inset-x-0 z-[100] flex justify-center pointer-events-none px-4">
        <motion.nav
          variants={{
            visible: { y: 0, opacity: 1 },
            hidden: { y: -100, opacity: 0 }
          }}
          initial="visible"
          animate={hidden ? 'hidden' : 'visible'}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="pointer-events-auto flex items-center justify-between px-5 py-3.5 backdrop-blur-xl bg-zinc-950/70 border border-white/10 rounded-full shadow-2xl gap-4 md:gap-10 w-full max-w-[95vw] md:w-auto md:min-w-[500px] will-change-transform"
        >
          <div className="flex items-center gap-4">
            {showBackButton && (
              <a 
                href={backHref} 
                onClick={(e) => {
                  if (onBackClick) {
                    onBackClick(e);
                  } else {
                    e.preventDefault();
                    if (window.history.length > 2) {
                      window.history.back();
                    } else {
                      window.history.pushState(null, '', backHref);
                      window.dispatchEvent(new Event('popstate'));
                    }
                  }
                }} 
                className="flex items-center gap-2 text-xs font-mono tracking-widest text-white/40 hover:text-white transition-colors uppercase pl-2 pr-4 border-r border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </a>
            )}
            <a 
              href="/" 
              className={`flex items-center gap-3 ${showBackButton ? '' : 'pl-2'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <img 
                src="/9.png" 
                alt="Productica" 
                className="w-9 h-9 rounded-md object-cover"
              />
              <span className="text-white font-semibold tracking-tight text-lg md:text-xl">Productica</span>
            </a>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-white/50">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <motion.a
              href="https://agents.productica.in/"
              target="_blank"
              rel="noopener noreferrer"
              ref={btnRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={reset}
              style={{ x: springX, y: springY, willChange: 'transform' }}
              className="hidden md:inline-block px-6 py-3 text-[14px] font-medium bg-white text-black rounded-full transition-shadow hover:shadow-lg hover:shadow-white/20 active:scale-95"
            >
              Get Started
            </motion.a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
          >
            <div className="flex flex-col items-center gap-8 text-center w-full max-w-sm">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="text-2xl font-light text-white/80 hover:text-white w-full py-2 border-b border-white/10 last:border-0"
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.a
                href="https://agents.productica.in/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + navLinks.length * 0.1 }}
                className="mt-4 w-full py-4 text-lg font-medium bg-white text-black rounded-full transition-shadow hover:shadow-lg active:scale-95"
              >
                Get Started
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
