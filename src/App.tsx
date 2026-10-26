/* eslint-disable */
import { Suspense, lazy, useEffect, useState } from 'react';
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
import { findModule } from './modules/registry';
import PricingPage from './pages/PricingPage';
import { audienceData, type AudienceSegment } from './data/audienceData';

import CookieConsent from './components/CookieConsent';

// App modules (/idea, ...) are code-split: the marketing site never loads them or Supabase.
const ModuleHost = lazy(() => import('./modules/ModuleHost'));

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

    const go = (next: string) => {
      window.history.pushState(null, '', next);
      setCurrentPath(new URL(next, window.location.origin).pathname);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    const handleGlobalClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href') || '';
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)) return;

      const url = new URL(href, window.location.origin);
      const path = url.pathname;
      const hash = url.hash;
      const next = `${path}${url.search}${hash}`;

      if (
        currentPath === '/' &&
        path !== '/' &&
        !href.startsWith('#')
      ) {
        sessionStorage.setItem('homeScrollY', window.scrollY.toString());
      }

      // Hash on this page stays here. Never bounce /idea#validate onto the marketing homepage.
      if (href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        if (href === '#home') {
          go('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        window.history.pushState(null, '', `${currentPath}${hash}`);
        scrollToHash(hash);
        return;
      }

      const appModule = findModule(path);
      if (appModule) {
        e.preventDefault();
        go(next);
        if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
        else setTimeout(() => scrollToHash(hash), 50);
        return;
      }

      const marketing: Record<string, string> = {
        '/terms': '/terms',
        '/privacy': '/terms',
        '/about': '/about',
        '/events': '/events',
        '/blogs': '/blogs',
        '/coming-soon': '/coming-soon',
        '/pricing': '/pricing',
      };
      const audience = path.match(/^\/(founders|incubators|investors|researchers|universities)$/);
      if (marketing[path] || audience) {
        e.preventDefault();
        go(marketing[path] || path);
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (path === '/' && (href === '/' || href === '#home' || href.startsWith('/#'))) {
        e.preventDefault();
        const targetHash = href.startsWith('/#') ? href.slice(1) : href === '#home' ? '#home' : '';
        go(href.startsWith('/#') ? href : '/');
        setTimeout(() => {
          const savedScroll = sessionStorage.getItem('homeScrollY');
          if (!targetHash && currentPath !== '/' && savedScroll) {
            if ((window as any).lenis) {
              (window as any).lenis.scrollTo(parseInt(savedScroll, 10), { immediate: true });
            } else {
              window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
            }
          } else if (targetHash && targetHash !== '#home') {
            scrollToHash(targetHash);
            [100, 300, 600, 1000].forEach((delay) => setTimeout(() => scrollToHash(targetHash), delay));
          } else {
            window.scrollTo({ top: 0, behavior: currentPath === '/' ? 'smooth' : 'instant' });
          }
        }, 50);
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
      ) : findModule(currentPath) ? (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <ModuleHost module={findModule(currentPath)!} />
        </Suspense>
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
