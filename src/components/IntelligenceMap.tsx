/**
 * Intelligence City Map — Premium interactive ecosystem visualization
 *
 * Replaces the "How Productica Helps" card grid on the Incubators page
 * with a central "IDEA" node surrounded by 6 feature locations
 * connected via an organic, city-like road network.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import './IntelligenceMap.css';
import mapBg from '../assets/map_bg.png';

/* ═══════════════════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════════════════ */

interface MapCard {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
}

interface IntelligenceMapProps {
  title: string;
  subtitle?: string;
  centerText?: string;
  cards: MapCard[];
}

// Fixed organic positions for the 6 locations to match the layout.
// Coordinates map to a 920x640 viewBox.
const MARKER_POSITIONS = [
  { x: 180, y: 190 }, // Top Left
  { x: 460, y: 90 },  // Top Center
  { x: 740, y: 190 }, // Top Right
  { x: 740, y: 500 }, // Bottom Right
  { x: 180, y: 500 }, // Bottom Left
  { x: 460, y: 600 }, // Bottom Center
];

const HQ_POS = { x: 460, y: 320 };

// We define the main roads connecting HQ to each marker.
// We calculate orthogonal lines tilted to perfectly match the city map grid angles!
// Slopes derived from the background map: m1 = 0.5 (Streets), m2 = -2.2 (Avenues)
const getRoutedPath = (p1: { x: number, y: number }, p2: { x: number, y: number }, useAlt: boolean) => {
  const m1 = 0.5;
  const m2 = -2.2;
  
  let xi, yi;
  if (useAlt) {
    // Travel along m2 first, then m1
    xi = (m2 * p1.x - m1 * p2.x - p1.y + p2.y) / (m2 - m1);
    yi = m2 * (xi - p1.x) + p1.y;
  } else {
    // Travel along m1 first, then m2
    xi = (m1 * p1.x - m2 * p2.x - p1.y + p2.y) / (m1 - m2);
    yi = m1 * (xi - p1.x) + p1.y;
  }
  
  return `M ${p1.x} ${p1.y} L ${xi.toFixed(1)} ${yi.toFixed(1)} L ${p2.x} ${p2.y}`;
};

const MAIN_ROADS = [
  getRoutedPath(HQ_POS, MARKER_POSITIONS[0], false), // Top Left
  getRoutedPath(HQ_POS, MARKER_POSITIONS[1], true),  // Top Center (alt looks better)
  getRoutedPath(HQ_POS, MARKER_POSITIONS[2], true),  // Top Right (alt looks better)
  getRoutedPath(HQ_POS, MARKER_POSITIONS[3], false), // Bottom Right
  getRoutedPath(HQ_POS, MARKER_POSITIONS[4], true),  // Bottom Left (alt looks better)
  getRoutedPath(HQ_POS, MARKER_POSITIONS[5], true),  // Bottom Center (alt looks better)
];

// Decorative background roads to make it feel like a real city grid
const BG_ROADS = [
  "M 100 50 Q 250 100 400 80 T 800 120",
  "M 50 250 Q 150 300 200 450 T 100 600",
  "M 850 200 Q 750 350 820 500 T 700 620",
  "M 250 620 Q 450 580 500 640",
  "M 450 0 Q 500 150 350 250",
  "M 700 0 Q 650 100 750 200",
];

/* ═══════════════════════════════════════════════════════════
   Background & Roads SVG
   ═══════════════════════════════════════════════════════════ */

interface CityMapSVGProps {
  hoveredIndex: number | null;
  hqHovered: boolean;
}

function CityMapSVG({ hoveredIndex, hqHovered }: CityMapSVGProps) {
  return (
    <>
      <div 
        className="icity__bg-image-container" 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${mapBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
          pointerEvents: 'none',
          filter: 'grayscale(100%)',
          maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
        }}
      />
      {/* Background Decorative Roads & Grid */}
      <svg
        className="icity__bg-svg"
        viewBox="0 0 920 640"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="icity-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#icity-grid)" />
        
        {/* Subtle topographic / city blocks */}
        {BG_ROADS.map((d, i) => (
          <path key={`bg-${i}`} d={d} className="icity__road icity__road--cross" style={{ stroke: 'rgba(255,255,255,0.02)' }} />
        ))}
      </svg>

      {/* Main Interactive Roads */}
      <svg
        className="icity__roads-svg"
        viewBox="0 0 920 640"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="hq-mask">
            <rect width="100%" height="100%" fill="white" />
            <circle cx={HQ_POS.x} cy={HQ_POS.y} r="56" fill="black" />
          </mask>
        </defs>
        <g mask="url(#hq-mask)">
          {MAIN_ROADS.map((d, i) => {
            const isLit = hoveredIndex === i || hqHovered;
            const roadCn = `icity__road icity__road--arterial ${isLit ? 'icity__road--lit' : ''}`;
            
            return (
              <g key={`road-${i}`} style={{ '--road-color': `var(--color-${i})` } as React.CSSProperties}>
                <path className={roadCn} d={d} id={`path-${i}`} />
              </g>
            );
          })}
        </g>
      </svg>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Feature Marker
   ═══════════════════════════════════════════════════════════ */

interface MarkerProps {
  card: MapCard;
  pos: { x: number; y: number };
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onTap: () => void;
  isMobile: boolean;
}

function FeatureMarker({
  card,
  pos,
  index,
  isActive,
  isDimmed,
  onHoverStart,
  onHoverEnd,
  onTap,
  isMobile,
}: MarkerProps) {
  const Icon = card.icon;
  const cn = [
    'icity__marker',
    isActive && 'icity__marker--active',
    isDimmed && 'icity__marker--dimmed',
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = isMobile
    ? { '--marker-color': `var(--color-${index})` } as React.CSSProperties
    : {
        '--marker-color': `var(--color-${index})`,
        left: `${(pos.x / 920) * 100}%`,
        top: `${(pos.y / 640) * 100}%`,
      } as React.CSSProperties;

  return (
    <div
      className={cn}
      style={style}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTap();
        }
      }}
    >
      <Icon className="icity__marker-icon" />
      <div className="icity__marker-text">
        <h3 className="icity__marker-title">{card.title}</h3>
        {card.desc && <p className="icity__marker-desc text-justify">{card.desc}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Mobile Cinematic Tour
   ═══════════════════════════════════════════════════════════ */

// Scroll sequence: the order destinations are revealed on mobile
const TOUR_ORDER = [0, 1, 2, 3, 5, 4];

// Camera positions for each tour stop
const CAMERA_STOPS = TOUR_ORDER.map((cardIdx) => {
  const pos = MARKER_POSITIONS[cardIdx];
  return {
    cardIdx,
    tx: ((460 - pos.x) / 920) * 100,
    ty: ((320 - pos.y) / 640) * 100,
    scale: 2.2,
  };
});

function MobileMapTour({ title, subtitle, centerText = 'INCUBATOR', cards }: IntelligenceMapProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = Number(entry.target.getAttribute('data-step'));
            if (!isNaN(step)) setActiveStep(step);
          }
        });
      },
      { threshold: 0.5 }
    );

    container.querySelectorAll('.imap-m__trigger').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const totalStops = TOUR_ORDER.length;
  const isRevealed = activeStep >= totalStops;
  const isIntro = activeStep < 0;
  const currentStop = activeStep >= 0 && activeStep < totalStops ? CAMERA_STOPS[activeStep] : null;
  const introStop = CAMERA_STOPS[0];

  // Camera transform
  let cameraTransform: string;
  if (isRevealed) {
    cameraTransform = 'scale(1) translate(0%, 0%)';
  } else if (currentStop) {
    cameraTransform = `scale(${currentStop.scale}) translate(${currentStop.tx.toFixed(2)}%, ${currentStop.ty.toFixed(2)}%)`;
  } else {
    cameraTransform = `scale(${introStop.scale}) translate(${introStop.tx.toFixed(2)}%, ${introStop.ty.toFixed(2)}%)`;
  }

  // Which card is active in the original cards array
  const activeCardIdx = currentStop?.cardIdx ?? (isIntro ? TOUR_ORDER[0] : null);

  return (
    <div className="imap-m" ref={containerRef}>
      <div className="imap-m__container">
        <div className="imap-m__sticky">
          {/* Title */}
          <div className="imap-m__header">
            <h2 className="icity__title">{title}</h2>
            {subtitle && <p className="icity__subtitle">{subtitle}</p>}
          </div>

          {/* Map viewport */}
          <div className="imap-m__viewport">
            <div
              className={`imap-m__map ${isRevealed ? 'imap-m__map--revealed' : ''}`}
              style={{ transform: cameraTransform }}
            >
              {/* Background image */}
              <div className="imap-m__bg" style={{ backgroundImage: `url(${mapBg})` }} />

              {/* Combined SVG */}
              <svg
                className="imap-m__svg"
                viewBox="0 0 920 640"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="imap-m-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="920" height="640" fill="url(#imap-m-grid)" />

                {/* Decorative roads */}
                {BG_ROADS.map((d, i) => (
                  <path
                    key={`bg-${i}`}
                    d={d}
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                ))}

                {/* Main connecting roads */}
                {MAIN_ROADS.map((d, i) => {
                  const isActiveRoad = activeCardIdx === i && !isIntro;
                  return (
                    <path
                      key={`road-${i}`}
                      d={d}
                      fill="none"
                      strokeLinecap="round"
                      className={[
                        'imap-m__road',
                        isActiveRoad && 'imap-m__road--active',
                        isRevealed && 'imap-m__road--revealed',
                      ].filter(Boolean).join(' ')}
                      style={{ '--road-delay': `${i * 150}ms` } as React.CSSProperties}
                    />
                  );
                })}
              </svg>

              {/* HQ Center */}
              <div
                className={`imap-m__hq ${isRevealed ? 'imap-m__hq--visible' : ''}`}
                style={{
                  left: `${(HQ_POS.x / 920) * 100}%`,
                  top: `${(HQ_POS.y / 640) * 100}%`,
                }}
              >
                <span className="imap-m__hq-label">{centerText}</span>
                <span className="imap-m__hq-ripple" />
              </div>

              {/* Markers */}
              {cards.map((card, idx) => {
                const pos = MARKER_POSITIONS[idx];
                const isActive = activeCardIdx === idx && !isIntro;
                const isIntroMarker = isIntro && idx === TOUR_ORDER[0];
                const Icon = card.icon;
                const tourIdx = TOUR_ORDER.indexOf(idx);

                return (
                  <div
                    key={idx}
                    className={[
                      'imap-m__marker',
                      isActive && 'imap-m__marker--active',
                      isIntroMarker && 'imap-m__marker--intro',
                      isRevealed && 'imap-m__marker--revealed',
                      !isActive && !isIntroMarker && !isRevealed && 'imap-m__marker--hidden',
                    ].filter(Boolean).join(' ')}
                    style={{
                      left: `${(pos.x / 920) * 100}%`,
                      top: `${(pos.y / 640) * 100}%`,
                      '--marker-reveal-delay': `${tourIdx >= 0 ? tourIdx * 120 + 600 : 600}ms`,
                    } as React.CSSProperties}
                  >
                    <Icon className="imap-m__marker-icon" />
                    <span className="imap-m__marker-label">{card.title}</span>
                    {(isActive || isIntroMarker) && <span className="imap-m__marker-pulse" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description Card */}
          <div className={`imap-m__card ${currentStop ? 'imap-m__card--visible' : ''}`}>
            {currentStop && (() => {
              const card = cards[currentStop.cardIdx];
              const Icon = card.icon;
              const stepNum = activeStep + 1;
              return (
                <>
                  <div className="imap-m__card-step">
                    {String(stepNum).padStart(2, '0')} / {String(totalStops).padStart(2, '0')}
                  </div>
                  <div className="imap-m__card-header">
                    <Icon className="imap-m__card-icon" />
                    <h3 className="imap-m__card-title">{card.title}</h3>
                  </div>
                  <p className="imap-m__card-desc">{card.desc}</p>
                </>
              );
            })()}
          </div>
        </div>

        {/* Scroll track */}
        <div className="imap-m__track">
          <div className="imap-m__trigger" data-step="-1" />
          {TOUR_ORDER.map((_, idx) => (
            <div key={idx} className="imap-m__trigger" data-step={idx} />
          ))}
          <div className="imap-m__trigger" data-step={totalStops} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */

export default function IntelligenceMap({ title, subtitle, centerText = "INCUBATOR", cards }: IntelligenceMapProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hqHovered, setHqHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMarkerHoverStart = useCallback((index: number) => {
    setHoveredIndex(index);
    setHqHovered(false);
  }, []);

  const handleMarkerHoverEnd = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handleMarkerTap = useCallback((index: number) => {
    setHoveredIndex((prev) => (prev === index ? null : index));
    setHqHovered(false);
  }, []);

  const handleHqEnter = useCallback(() => {
    setHqHovered(true);
    setHoveredIndex(null);
  }, []);

  const handleHqLeave = useCallback(() => {
    setHqHovered(false);
  }, []);

  const handleHqTap = useCallback(() => {
    if (isTouchDevice) {
      setHqHovered((prev) => !prev);
      setHoveredIndex(null);
    }
  }, [isTouchDevice]);

  const handleSectionClick = useCallback((e: React.MouseEvent) => {
    if (!isTouchDevice) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.icity__marker') && !target.closest('.icity__hq')) {
      setHoveredIndex(null);
      setHqHovered(false);
    }
  }, [isTouchDevice]);

  return (
    <section className="icity" onClick={handleSectionClick}>
      {/* Desktop experience */}
      <div className="icity__desktop">
        <div className="icity__header">
          <h2 className="icity__title">{title}</h2>
          {subtitle && <p className="icity__subtitle">{subtitle}</p>}
        </div>

        <div className="icity__stage">
          {/* SVG Roads & Background */}
          <CityMapSVG hoveredIndex={hoveredIndex} hqHovered={hqHovered} />

          {/* HQ Center Node */}
          <div
            className={`icity__hq ${hqHovered ? 'icity__hq--active' : ''}`}
            style={{ left: `${(HQ_POS.x / 920) * 100}%`, top: `${(HQ_POS.y / 640) * 100}%` }}
            onMouseEnter={handleHqEnter}
            onMouseLeave={handleHqLeave}
            onClick={handleHqTap}
            role="button"
            tabIndex={0}
          >
            <span className="icity__hq-label">{centerText}</span>
            <span className="icity__ripple" />
          </div>

          {/* Feature Markers */}
          {cards.map((card, idx) => (
            <FeatureMarker
              key={idx}
              card={card}
              pos={MARKER_POSITIONS[idx] || { x: 0, y: 0 }}
              index={idx}
              isActive={hoveredIndex === idx}
              isDimmed={hoveredIndex !== null && hoveredIndex !== idx && !hqHovered}
              onHoverStart={() => handleMarkerHoverStart(idx)}
              onHoverEnd={handleMarkerHoverEnd}
              onTap={() => handleMarkerTap(idx)}
              isMobile={false}
            />
          ))}
        </div>
      </div>

      {/* Mobile cinematic tour */}
      <MobileMapTour title={title} subtitle={subtitle} centerText={centerText} cards={cards} />
    </section>
  );
}
