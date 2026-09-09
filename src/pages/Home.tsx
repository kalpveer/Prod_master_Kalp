/* eslint-disable */
import { useState, useLayoutEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import Preloader from '../components/Preloader';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TableOfContents from '../components/TableOfContents';
import NoiseOverlay from '../components/NoiseOverlay';

import ScrollStory from '../components/ScrollStory';
import ReactiveTypography from '../components/ReactiveTypography';
import IdeaFlow from '../components/IdeaFlow';
import AgenticPlatform from '../components/AgenticPlatform';
import WhyChooseProductica from '../components/WhyChooseProductica';

import SocialProof from '../components/SocialProof';

import Pricing from '../components/Pricing';
import Testimony from '../components/Testimony';
import Modules from '../components/Modules';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import EcosystemDifference from '../components/EcosystemDifference';

export default function Home() {
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('preloaderDone'));
  const [videoLoading, setVideoLoading] = useState(true);
  const { scrollYProgress } = useScroll();

  useLayoutEffect(() => {
    // Scroll handling is now fully centralized in App.tsx
  }, []);

  return (
      <main className="relative overflow-clip selection:bg-black selection:text-white">
        {loading && <Preloader isLoading={videoLoading} onComplete={() => {
          setLoading(false);
          sessionStorage.setItem('preloaderDone', 'true');
        }} />}
        {!loading && <Navbar />}
        <TableOfContents />

        <NoiseOverlay />

        <motion.div
          className="fixed top-0 left-0 h-1 bg-black z-[60] origin-left"
          style={{ scaleX: scrollYProgress }}
        />

        {/* 1. Hero (film) */}
        <Hero onVideoLoad={() => setVideoLoading(false)} />

        {/* 2. Reality / worth the build */}
        <div id="about">
          <ScrollStory />
        </div>
        <ReactiveTypography />
        <IdeaFlow />

        {/* 3. Agents */}
        <div id="agents">
          <AgenticPlatform />
        </div>

        {/* 4. Why choose / who it’s for (immediately after Agents) */}
        <WhyChooseProductica />

        {/* 5. Existing proof / stack / SPIS / affiliations */}
        <div id="achievements">
          <SocialProof />
        </div>
        <div id="stack">
          <Modules />
        </div>
        {/* SPIS only — Who Serves orbit removed to avoid duplicating Why-choose */}
        <div id="ecosystem">
          <EcosystemDifference />
        </div>

        {/* 6. Credits: Productica One + Productica Teams */}
        <Pricing />

        <Testimony />

        {/* 7. Contact */}
        <Contact />
        <Footer />
      </main>
  );
}
