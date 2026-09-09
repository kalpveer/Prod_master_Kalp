import { useState, useEffect, type ComponentType } from 'react';
import './InvestorLayers.css';

interface LayerCard {
  icon: ComponentType<any>;
  title: string;
  desc: string;
}

interface InvestorLayersProps {
  title: string;
  cards: LayerCard[];
}

function StackVisual({ cards, activeLayer }: { cards: LayerCard[]; activeLayer: number | null }) {
  return (
    <div className="investor-layers-visual">
      <div className="investor-layers-stack-wrapper">
        <div className={`investor-layers-beam ${activeLayer !== null ? 'active' : ''}`} />
        {cards.map((_, idx) => {
          const isActive = activeLayer === idx;
          const isDimmed = activeLayer !== null && !isActive;
          const isAboveActive = activeLayer !== null && idx < activeLayer;
          const reversedIdx = (cards.length - 1) - idx; 
          const baseY = reversedIdx * 60;
          const hoverLift = isActive ? 50 : isAboveActive ? 90 : 0;
          const scale = 1 - (reversedIdx * 0.07);

          return (
            <div 
              key={`disc-${idx}`}
              className={`investor-layers-disc-container ${isActive ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
              style={{
                transform: `translateY(${-baseY - hoverLift}px) scale(${scale})`,
                zIndex: reversedIdx
              }}
            >
              <div className="investor-layers-disc">
                <div className="investor-layers-disc-bottom" />
                <div className="investor-layers-disc-side" />
                <div className="investor-layers-disc-top">
                  {isActive && <div className="investor-layers-disc-ripple" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileInvestorLayers({ title, cards }: InvestorLayersProps) {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  useEffect(() => {
    const activeObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-index'));
          if (isNaN(idx)) return;
          if (entry.isIntersecting) {
            setActiveLayer(idx === -1 ? null : idx);
          }
        });
      },
      { threshold: 0.5, rootMargin: '0px' },
    );

    const triggers = document.querySelectorAll('.inv-m__trigger');
    triggers.forEach((el) => activeObs.observe(el));

    return () => activeObs.disconnect();
  }, [cards.length]);

  return (
    <div className="inv-m">
      <div className="inv-m__container">
        
        {/* Sticky viewport content */}
        <div className="inv-m__sticky">
          <h2 className="text-3xl font-light tracking-tight text-white text-center mb-10">{title}</h2>

          {/* Top half: Stack Visual */}
          <div className={`inv-m__visual ${activeLayer === null ? 'intro' : ''}`}>
            <StackVisual cards={cards} activeLayer={activeLayer} />
          </div>

          {/* Bottom half: Cards (Fade in/out in place) */}
          <div className="inv-m__cards">
            {cards.map((card, idx) => {
              const isActive = activeLayer === idx;
              const Icon = card.icon;

              return (
                <div 
                  key={idx} 
                  className={`inv-m__card ${isActive ? 'active' : ''}`}
                >
                  <div className="investor-layers-item active">
                    <div className="investor-layers-item-header">
                      <Icon className="investor-layers-item-icon" />
                      <span className="investor-layers-item-title">{card.title}</span>
                    </div>
                    <div className="investor-layers-item-desc-wrapper" style={{ maxHeight: '120px', opacity: 1, marginTop: '0.75rem' }}>
                      <p className="investor-layers-item-desc">{card.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invisible scroll track to drive the InteractionObserver */}
        <div className="inv-m__track">
          {/* Intro trigger to show entire stack with no cards */}
          <div className="inv-m__trigger" data-index="-1" />
          {cards.map((_, idx) => (
            <div 
              key={idx} 
              className="inv-m__trigger" 
              data-index={idx}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

export default function InvestorLayers({ title, cards }: InvestorLayersProps) {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  return (
    <section className="investor-layers-section">
      <div className="investor-layers-bg">
        <div className="investor-layers-bg-grid" />
      </div>

      <div className="investor-layers-desktop">
        <h2 className="text-3xl font-light tracking-tight text-white mb-16 text-center relative z-10">
          {title}
        </h2>

        <div className="investor-layers-container">
          
          {/* LEFT PANEL: Interactive List */}
          <div className="investor-layers-list">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              const isActive = activeLayer === idx;
              const isDimmed = activeLayer !== null && !isActive;

              return (
                <div 
                  key={`list-item-${idx}`}
                  className={`investor-layers-item ${isActive ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
                  onMouseEnter={() => setActiveLayer(idx)}
                  onMouseLeave={() => setActiveLayer(null)}
                >
                  <div className="investor-layers-item-header">
                    <Icon className="investor-layers-item-icon" />
                    <span className="investor-layers-item-title">{card.title}</span>
                  </div>
                  <div className="investor-layers-item-desc-wrapper">
                    <p className="investor-layers-item-desc text-justify">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT PANEL: 3D Stack Visualization */}
          <StackVisual cards={cards} activeLayer={activeLayer} />

        </div>
      </div>

      {/* Mobile layout — shown on mobile via CSS */}
      <MobileInvestorLayers title={title} cards={cards} />

    </section>
  );
}
