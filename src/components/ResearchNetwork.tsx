import { useState, useEffect, useRef, useMemo, type ComponentType } from 'react';
import './ResearchNetwork.css';

/* ═══════════════════════════════════════════════════════════
   Research Intelligence Network
   Premium monochrome · Full-width dense network
   ═══════════════════════════════════════════════════════════ */
interface NetworkCard {
  icon: ComponentType<any>;
  title: string;
  desc: string;
}

interface ResearchNetworkProps {
  title: string;
  cards: NetworkCard[];
}

// Coordinate space: 1600 x 800
interface FeatureNodeDef {
  id: string;
  x: number;
  y: number;
  cardIndex: number;
}

interface HubNodeDef {
  id: string;
  x: number;
  y: number;
  r: number;
}

const FEATURE_NODES: FeatureNodeDef[] = [
  { id: 'f0', x: 250, y: 300, cardIndex: 0 },
  { id: 'f1', x: 600, y: 180, cardIndex: 1 },
  { id: 'f2', x: 1050, y: 250, cardIndex: 2 },
  { id: 'f3', x: 1350, y: 450, cardIndex: 3 },
  { id: 'f4', x: 450, y: 600, cardIndex: 4 },
  { id: 'f5', x: 1100, y: 650, cardIndex: 5 },
];

const HUB_NODES: HubNodeDef[] = [
  { id: 'h0', x: 400, y: 120, r: 6 },
  { id: 'h1', x: 800, y: 100, r: 4 },
  { id: 'h2', x: 1300, y: 150, r: 5 },
  { id: 'h3', x: 150, y: 500, r: 4 },
  { id: 'h4', x: 450, y: 400, r: 8 },
  { id: 'h5', x: 750, y: 350, r: 5 },
  { id: 'h6', x: 850, y: 450, r: 7 },
  { id: 'h7', x: 1200, y: 400, r: 5 },
  { id: 'h8', x: 1500, y: 300, r: 4 },
  { id: 'h9', x: 250, y: 700, r: 5 },
  { id: 'h10', x: 700, y: 650, r: 6 },
  { id: 'h11', x: 950, y: 550, r: 4 },
  { id: 'h12', x: 1350, y: 700, r: 5 },
  { id: 'h13', x: 1000, y: 150, r: 4 },
  { id: 'h14', x: 600, y: 500, r: 5 },
];

const CONNECTIONS = [
  // Features to Hubs
  { from: 'f0', to: 'h0' }, { from: 'f0', to: 'h4' }, { from: 'f0', to: 'h3' },
  { from: 'f1', to: 'h0' }, { from: 'f1', to: 'h1' }, { from: 'f1', to: 'h5' },
  { from: 'f2', to: 'h1' }, { from: 'f2', to: 'h13' }, { from: 'f2', to: 'h7' },
  { from: 'f3', to: 'h2' }, { from: 'f3', to: 'h7' }, { from: 'f3', to: 'h8' }, { from: 'f3', to: 'h12' },
  { from: 'f4', to: 'h3' }, { from: 'f4', to: 'h4' }, { from: 'f4', to: 'h9' }, { from: 'f4', to: 'h14' },
  { from: 'f5', to: 'h6' }, { from: 'f5', to: 'h7' }, { from: 'f5', to: 'h11' }, { from: 'f5', to: 'h12' },
  
  // Hubs to Hubs
  { from: 'h0', to: 'h1' }, { from: 'h1', to: 'h13' }, { from: 'h13', to: 'h2' },
  { from: 'h4', to: 'h5' }, { from: 'h5', to: 'h6' }, { from: 'h6', to: 'h7' },
  { from: 'h3', to: 'h9' }, { from: 'h9', to: 'h10' }, { from: 'h10', to: 'h11' }, { from: 'h11', to: 'h12' },
  { from: 'h4', to: 'h14' }, { from: 'h14', to: 'h10' }, { from: 'h5', to: 'h13' }, { from: 'h6', to: 'h11' },
  
  // Cross-feature / long links
  { from: 'f1', to: 'h4' }, { from: 'f2', to: 'h6' }, { from: 'f4', to: 'h10' }
];

export default function ResearchNetwork({ title, cards }: ResearchNetworkProps) {
  const [inView, setInView] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const zoomStyle = useMemo(() => {
    const defaultStyle = { 
      transform: 'scale(1) translate(0px, 0px)', 
      transformOrigin: '800px 400px',
      transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
    };
    
    if (!isMobile || activeCardIndex === null) return defaultStyle;
    
    const activeNode = FEATURE_NODES.find(n => n.cardIndex === activeCardIndex);
    if (!activeNode) return defaultStyle;

    const scale = 1.6;
    const dx = -(activeNode.x - 800) * scale;
    // Offset vertically slightly so the node sits in the top half, avoiding the sticky cards
    const dy = -(activeNode.y - 400) * scale + 100;

    return {
      ...defaultStyle,
      transform: `translate(${dx}px, ${dy}px) scale(${scale})`
    };
  }, [isMobile, activeCardIndex]);

  useEffect(() => {
    // Only run intersection observer on mobile for scroll-driven behavior
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    const activeObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-index'));
          if (isNaN(idx)) return;
          if (entry.isIntersecting) {
            setActiveCardIndex(idx);
          }
        });
      },
      { threshold: 0.5, rootMargin: '0px' },
    );

    trackRefs.current.forEach((el) => {
      if (el) activeObs.observe(el);
    });

    return () => activeObs.disconnect();
  }, [cards.length]);

  // Intersection Observer for scroll-triggered entry
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Check for reduced motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Lookup maps for coordinates
  const allNodes = useMemo(() => {
    const map: Record<string, { x: number, y: number }> = {};
    FEATURE_NODES.forEach(n => map[n.id] = { x: n.x, y: n.y });
    HUB_NODES.forEach(n => map[n.id] = { x: n.x, y: n.y });
    return map;
  }, []);

  return (
    <section ref={sectionRef} className={`rn-section${inView ? ' in-view' : ''}`}>
      <div className="rn-m-container">
        <div className="rn-m-sticky">
          <h2 className="rn-section-title">{title}</h2>

          <div className="rn-canvas-wrap">
            <svg
              viewBox="0 0 1600 800"
              className="rn-canvas-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <g style={zoomStyle}>
                {/* Connection Lines */}
                <g>
                {CONNECTIONS.map((conn, i) => {
                  const fromNode = allNodes[conn.from];
                  const toNode = allNodes[conn.to];
                  if (!fromNode || !toNode) return null;
                  
                  const dx = toNode.x - fromNode.x;
                  const dy = toNode.y - fromNode.y;
                  const length = Math.sqrt(dx * dx + dy * dy);

                  return (
                    <line
                      key={`line-${i}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      className={`rn-connection${inView && !prefersReducedMotion ? ' drawing' : ''}`}
                      strokeWidth={1}
                      style={{
                        '--path-length': length,
                        '--draw-delay': `${i * 30}ms`,
                      } as React.CSSProperties}
                    />
                  );
                })}
              </g>

              {/* Hub Nodes */}
              <g>
                {HUB_NODES.map((node, i) => (
                  <circle
                    key={node.id}
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    className="rn-hub-node"
                    style={{ '--entry-delay': `${i * 40}ms` } as React.CSSProperties}
                  />
                ))}
              </g>

              {/* Feature Nodes via foreignObject */}
              <g>
                {FEATURE_NODES.map((node, i) => {
                  const card = cards[node.cardIndex];
                  if (!card) return null;
                  const Icon = card.icon;

                  return (
                    <foreignObject
                      key={node.id}
                      x={node.x - 150}
                      y={node.y - 22}
                      width={300}
                      height={250}
                      style={{ overflow: 'visible', pointerEvents: 'none' }}
                    >
                      <div 
                        className={`rn-node-html ${activeCardIndex === node.cardIndex ? 'active' : ''}`}
                        style={{ '--entry-delay': `${i * 100}ms`, cursor: 'pointer', pointerEvents: 'auto' } as React.CSSProperties}
                        onClick={() => setActiveCardIndex(activeCardIndex === node.cardIndex ? null : node.cardIndex)}
                      >
                        <div className="rn-node-circle">
                          <Icon className="rn-node-icon" />
                        </div>
                        <div className="rn-node-text">
                          <h3 className="rn-node-title">{card.title}</h3>
                          <p className="rn-node-desc text-justify">{card.desc}</p>
                        </div>
                      </div>
                    </foreignObject>
                  );
                })}
              </g>
              </g>
            </svg>
          </div>

          {/* Mobile Description Cards Stack */}
          <div className="rn-mobile-card-container">
            {cards.map((card, idx) => {
              const isActive = activeCardIndex === idx;
              const Icon = card.icon;
              return (
                <div key={idx} className={`rn-mobile-card ${isActive ? 'visible' : ''}`}>
                  <div className="rn-mobile-card-header">
                    <Icon className="rn-mobile-card-icon" />
                    <h3 className="rn-mobile-card-title">{card.title}</h3>
                  </div>
                  <p className="rn-mobile-card-desc">{card.desc}</p>
                </div>
              );
            })}
            
            {/* Empty State */}
            <div className={`rn-mobile-card-empty ${activeCardIndex === null ? 'visible' : ''}`}>
              <p>Scroll down to explore capabilities.</p>
            </div>
          </div>
        </div>

        {/* Invisible Scroll Track for Mobile */}
        <div className="rn-m-track">
          {cards.map((_, idx) => (
            <div
              key={`track-${idx}`}
              className="rn-m-trigger"
              data-index={idx}
              ref={(el) => { trackRefs.current[idx] = el; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
