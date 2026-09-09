/* eslint-disable */
import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Home from './pages/Home';
import Terms from './pages/Terms';
import About from './pages/About';
import Events from './pages/Events';
import Blogs from './pages/Blogs';
import AudiencePage from './pages/AudiencePage';
import ComingSoon from './pages/ComingSoon';
import PricingPage from './pages/PricingPage';
import { audienceData, type AudienceSegment } from './data/audienceData';

import CookieConsent from './components/CookieConsent';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    
    (window as any).lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0, 0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  // Sync state with back/forward history events and restore scroll
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      
      // Wait for DOM to update with new component
      setTimeout(() => {
        if (window.location.pathname === '/') {
          const savedScroll = sessionStorage.getItem('homeScrollY');
          const hash = window.location.hash;
          
          if (savedScroll) {
            // Restore exact pixel scroll immediately and reliably
            if ((window as any).lenis) {
              (window as any).lenis.scrollTo(parseInt(savedScroll, 10), { immediate: true });
            } else {
              window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
            }
          } else if (hash) {
            const targetHash = hash.substring(1);
            
            const attemptHashScroll = () => {
              const el = document.getElementById(targetHash);
              if (el) {
                if ((window as any).lenis) {
                  (window as any).lenis.scrollTo(el, { immediate: true });
                } else {
                  el.scrollIntoView({ behavior: 'instant' });
                }
              }
            };
            
            // Try repeatedly to account for GSAP ScrollTrigger height calculations
            attemptHashScroll();
            [100, 300, 600, 1000].forEach(delay => setTimeout(attemptHashScroll, delay));
          }
        }
      }, 50);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Intercept all terms and home links globally for instant dynamic routing
  useEffect(() => {
    const scrollToHash = (hash: string) => {
      const id = hash.startsWith('#') ? hash.slice(1) : hash;
      if (!id) return false;
      const el = document.getElementById(id);
      if (!el) return false;

      const lenis = (window as any).lenis;
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(el, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          offset: -20,
        });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return true;
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor) {
        const href = anchor.getAttribute('href') || '';
        const text = anchor.textContent || '';
        
        // Save homepage scroll position before leaving (skip in-page hashes)
        if (
          currentPath === '/' &&
          href !== '/' &&
          !href.startsWith('/#') &&
          !(href.startsWith('#') && href.length > 1)
        ) {
          sessionStorage.setItem('homeScrollY', window.scrollY.toString());
        }
        
        const isTermsOrPrivacy = 
          href.includes('terms') || 
          href.includes('privacy') || 
          href.includes('condition') ||
          text.toLowerCase().includes('term') ||
          text.toLowerCase().includes('condition') ||
          text.toLowerCase().includes('privacy');

        const isAbout = 
          href.includes('about') ||
          text.toLowerCase() === 'about';

        const isEvents = 
          href.includes('events') ||
          text.toLowerCase() === 'events';

        const isBlogs = 
          href.includes('blogs') ||
          text.toLowerCase() === 'blogs' ||
          text.toLowerCase() === 'blog';

        const isComingSoon = href.includes('coming-soon');

        const isPricing = href === '/pricing' || href.startsWith('/pricing');

        const audienceMatch = href.match(/\/(founders|incubators|investors|researchers|universities)$/);

        // In-page hash links (hero CTAs, etc.) — Lenis needs an explicit scrollTo
        if (href.startsWith('#') && href.length > 1 && !href.startsWith('#home')) {
          e.preventDefault();
          if (currentPath !== '/') {
            window.history.pushState(null, '', `/${href}`);
            setCurrentPath('/');
            setTimeout(() => {
              window.history.replaceState(null, '', href);
              scrollToHash(href);
              [100, 300, 600].forEach((delay) => setTimeout(() => scrollToHash(href), delay));
            }, 50);
          } else {
            window.history.pushState(null, '', href);
            scrollToHash(href);
          }
        } else if (isTermsOrPrivacy) {
          e.preventDefault();
          window.history.pushState(null, '', '/terms');
          setCurrentPath('/terms');
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (isAbout) {
          e.preventDefault();
          window.history.pushState(null, '', '/about');
          setCurrentPath('/about');
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (isEvents) {
          e.preventDefault();
          window.history.pushState(null, '', '/events');
          setCurrentPath('/events');
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (isBlogs) {
          e.preventDefault();
          window.history.pushState(null, '', '/blogs');
          setCurrentPath('/blogs');
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (isComingSoon) {
          e.preventDefault();
          window.history.pushState(null, '', '/coming-soon');
          setCurrentPath('/coming-soon');
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (isPricing) {
          e.preventDefault();
          window.history.pushState(null, '', '/pricing');
          setCurrentPath('/pricing');
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (audienceMatch) {
          e.preventDefault();
          window.history.pushState(null, '', audienceMatch[0]);
          setCurrentPath(audienceMatch[0]);
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (href === '/' || href === '#home' || href.startsWith('/#')) {
          e.preventDefault();
          
          const isHashRoute = href.startsWith('/#');
          const targetHash = isHashRoute ? href.slice(1) : href === '#home' ? '#home' : '';

          if (currentPath !== '/') {
            window.history.pushState(null, '', href);
            setCurrentPath('/');
            
            setTimeout(() => {
              const savedScroll = sessionStorage.getItem('homeScrollY');
              
              if (!targetHash && savedScroll) {
                // If navigating back to Home without a specific hash, use exact pixel scroll
                if ((window as any).lenis) {
                  (window as any).lenis.scrollTo(parseInt(savedScroll, 10), { immediate: true });
                } else {
                  window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
                }
              } else if (targetHash && targetHash !== '#home') {
                scrollToHash(targetHash);
                [100, 300, 600, 1000].forEach((delay) => setTimeout(() => scrollToHash(targetHash), delay));
              } else {
                window.scrollTo({ top: 0, behavior: 'instant' });
              }
            }, 50);
          } else {
            window.history.pushState(null, '', href);
            if (targetHash && targetHash !== '#home') {
              scrollToHash(targetHash);
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [currentPath]);

  return (
    <div className="bg-white text-black min-h-screen selection:bg-black selection:text-white">

      {currentPath === '/terms' ? (
        <Terms />
      ) : currentPath === '/about' ? (
        <About />
      ) : currentPath === '/events' ? (
        <Events />
      ) : currentPath === '/blogs' ? (
        <Blogs />
      ) : currentPath === '/coming-soon' ? (
        <ComingSoon />
      ) : currentPath === '/pricing' ? (
        <PricingPage />
      ) : currentPath.match(/^\/(founders|incubators|investors|researchers|universities)$/) ? (
        <AudiencePage segment={currentPath.substring(1) as AudienceSegment} data={audienceData[currentPath.substring(1) as AudienceSegment]} />
      ) : (
        <>
          <Home />
          <CookieConsent />
        </>
      )}
    </div>
  );
}

export default App;
