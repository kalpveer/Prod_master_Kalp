import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import type { AudienceData } from '../data/audienceData';
import Footer from '../components/Footer';
import { MarqueeRow, type MarqueeItem } from '../components/SocialProof';
import StartupDNA from '../components/StartupDNA';
import IntelligenceMap from '../components/IntelligenceMap';
import ResearchNetwork from '../components/ResearchNetwork';
import InvestorLayers from '../components/InvestorLayers';

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

const incubatorLogos: MarqueeItem[] = [
  { name: 'ITM SLS INC', logo: itmSls },
  { name: 'ITM V INC', logo: itmV },
  { name: 'NIF', logo: nif },
  { name: 'SEDC', logo: sedc },
  { name: 'UOK IEDC', logo: uok },
];

const universityLogos: MarqueeItem[] = [
  { name: 'DJSCE', logo: djsceUni },
  { name: 'ITM', logo: itmUni },
  { name: 'ITMV', logo: itmVUni },
  { name: 'NUV', logo: nuvUni },
  { name: 'Sigma University', logo: sigmaUni },
  { name: 'UOK', logo: uokUni },
];

interface AudiencePageProps {
  segment?: string;
  data: AudienceData;
}

export default function AudiencePage({ segment, data }: AudiencePageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [data]);

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-white selection:text-black overflow-x-clip">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>

      <Navbar showBackButton={true} />

      <main className="animate-fade-in flex flex-col items-center pt-32 pb-24 w-full gap-24 lg:gap-32 relative overflow-x-clip">


        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto px-6 gap-8 pt-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-tight">
            {data.hero.headline}
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-2xl text-justify">
            {data.hero.subheadline}
          </p>
          <a href="/coming-soon" className="mt-4 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors text-lg tracking-wide inline-block">
            {data.hero.cta}
          </a>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 text-sm text-zinc-500 font-mono tracking-wide">
            {data.hero.trustIndicators.map((indicator, idx) => (
              <span key={idx}>{indicator}</span>
            ))}
          </div>
        </section>

        {/* MARQUEE FOR INCUBATORS */}
        {segment === 'incubators' && (
          <div className="w-full bg-white py-12 my-8 border-y border-zinc-200">
            <div className="w-full flex flex-col gap-6 overflow-hidden">
              <p className="text-center text-[10px] font-mono uppercase tracking-[0.3em] text-black/30 mb-2">
                Our Incubator Partners
              </p>
              <MarqueeRow items={incubatorLogos} baseVelocity={-1} isImages={true} itemsPerScreen={4} />
            </div>
          </div>
        )}

        {/* MARQUEE FOR UNIVERSITIES */}
        {segment === 'universities' && (
          <div className="w-full bg-white py-12 my-8 border-y border-zinc-200">
            <div className="w-full flex flex-col gap-6 overflow-hidden">
              <p className="text-center text-[10px] font-mono uppercase tracking-[0.3em] text-black/30 mb-2">
                Our University Partners
              </p>
              <MarqueeRow items={universityLogos} baseVelocity={-1} isImages={true} itemsPerScreen={4} />
            </div>
          </div>
        )}

        {/* PROBLEMS SECTION (2 Column Layout) */}
        <section className="w-full max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-light tracking-tight text-white">
              {data.problems.title}
            </h2>
            {data.problems.intro && (
              <p className="text-zinc-400 text-lg leading-relaxed text-justify">
                {data.problems.intro}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {data.problems.list.map((problem, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2.5 shrink-0" />
                <span className="text-zinc-300 text-lg">{problem}</span>
              </div>
            ))}
          </div>
        </section>

        {/* HOW PRODUCTICA HELPS */}
        {segment === 'founders' ? (
          <StartupDNA title={data.howItHelps.title} cards={data.howItHelps.cards} />
        ) : segment === 'incubators' ? (
          <IntelligenceMap 
            title={data.howItHelps.title} 
            subtitle={data.howItHelps.subtitle}
            cards={data.howItHelps.cards} 
          />
        ) : segment === 'researchers' ? (
          <ResearchNetwork title={data.howItHelps.title} cards={data.howItHelps.cards} />
        ) : segment === 'investors' ? (
          <InvestorLayers title={data.howItHelps.title} cards={data.howItHelps.cards} />
        ) : segment === 'universities' ? (
          <section className="w-full max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-light tracking-tight text-white mb-12 text-center">
              {data.howItHelps.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.howItHelps.cards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-8 border border-white/10 rounded-[18px] bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col gap-4"
                >
                  {(() => {
                    const Icon = card.icon;
                    return <Icon className="w-6 h-6 text-zinc-400" />;
                  })()}
                  <h3 className="text-xl font-medium text-white">{card.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm text-justify">{card.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="w-full max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-light tracking-tight text-white mb-12 text-center">
              {data.howItHelps.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.howItHelps.cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className="p-8 border border-white/10 rounded-[18px] bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col gap-4"
                >
                  {(() => {
                    const Icon = card.icon;
                    return <Icon className="w-6 h-6 text-zinc-400" />;
                  })()}
                  <h3 className="text-xl font-medium text-white">{card.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm text-justify">{card.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WHAT YOU RECEIVE */}
        <section className="w-full max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-light tracking-tight text-white mb-10 text-center">
            {data.deliverables.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 w-fit mx-auto sm:translate-x-4 md:translate-x-6 lg:translate-x-8">
            {data.deliverables.list.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 border border-white/5 rounded-[18px] bg-black w-full sm:w-[320px]">
                <span className="text-white">✓</span>
                <span className="text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* WHY PRODUCTICA */}
        <section className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-10">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-light tracking-tight text-white">
              {data.whyProductica.title}
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mx-auto text-justify">
              {data.whyProductica.desc}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-6 w-fit mx-auto text-left sm:translate-x-4 md:translate-x-6 lg:translate-x-8">
            {data.whyProductica.checkmarks.map((check, idx) => (
              <div key={idx} className="flex items-center gap-3 w-full sm:w-[320px]">
                <span className="text-white shrink-0">✓</span>
                <span className="text-zinc-300 text-sm md:text-base">{check}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-8 border-t border-white/10 mt-12">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-white">
            {data.finalCta.headline}
          </h2>
          <a href="/coming-soon" className="mt-4 px-10 py-5 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors text-lg tracking-wide shadow-xl inline-block">
            {data.finalCta.cta}
          </a>
        </section>

      </main>

      <Footer />
    </div>
  );
}
