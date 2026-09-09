import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import './ResearchRadar.css';

interface RadarCard {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface ResearchRadarProps {
  title: string;
  cards: RadarCard[];
}

const RADAR_AXES = [
  { angle: -90, index: 0, position: 'Top' },
  { angle: -30, index: 1, position: 'Top Right' },
  { angle: 30, index: 2, position: 'Bottom Right' },
  { angle: 90, index: 5, position: 'Bottom' },
  { angle: 150, index: 4, position: 'Bottom Left' },
  { angle: 210, index: 3, position: 'Top Left' },
];

export default function ResearchRadar({ title, cards }: ResearchRadarProps) {
  const [activeAxis, setActiveAxis] = useState<number | null>(null);

  const cx = 300;
  const cy = 300;
  const radius = 180;

  const getCoordinatesForAngle = (angle: number, length: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + length * Math.cos(rad),
      y: cy + length * Math.sin(rad),
    };
  };

  const renderRings = () => {
    const rings = [0.2, 0.4, 0.6, 0.8, 1];
    return rings.map((scale, i) => (
      <polygon
        key={`ring-${i}`}
        className="research-radar__ring"
        points={RADAR_AXES.map((axis) => {
          const pt = getCoordinatesForAngle(axis.angle, radius * scale);
          return `${pt.x},${pt.y}`;
        }).join(' ')}
      />
    ));
  };

  const renderAxes = () => {
    return RADAR_AXES.map((axis, i) => {
      const pt = getCoordinatesForAngle(axis.angle, radius);
      const isActive = activeAxis === axis.index;
      const isDimmed = activeAxis !== null && !isActive;
      
      return (
        <line
          key={`axis-${i}`}
          x1={cx}
          y1={cy}
          x2={pt.x}
          y2={pt.y}
          className={`research-radar__axis-line ${isActive ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
        />
      );
    });
  };

  const renderPolygon = () => {
    const points = RADAR_AXES.map((axis) => {
      let scale = 0.55; 
      if (activeAxis === axis.index) {
        scale = 0.85; 
      } else if (activeAxis !== null) {
        scale = 0.5; 
      }

      const pt = getCoordinatesForAngle(axis.angle, radius * scale);
      return `${pt.x},${pt.y}`;
    }).join(' ');

    return (
      <polygon
        className={`research-radar__polygon ${activeAxis !== null ? 'interacting' : 'idle'}`}
        points={points}
      />
    );
  };

  return (
    <section className="research-radar-section">
      <div className="research-radar-bg">
        <div className="research-radar-bg-grid" />
        <div className="research-radar-bg-glow" />
      </div>

      <h2 className="text-3xl font-light tracking-tight text-white mb-16 text-center relative z-10">
        {title}
      </h2>

      <div className="research-radar-container">
        <div className="research-radar-visual">
          <svg viewBox="0 0 600 600" className="research-radar-svg">
            <g className="research-radar-rings">{renderRings()}</g>
            <g className="research-radar-axes">{renderAxes()}</g>

            {renderPolygon()}
            
            <circle cx={cx} cy={cy} r={6} className="research-radar-center" />
          </svg>
        </div>

        <div className="research-radar-labels">
          {RADAR_AXES.map((axis) => {
            const card = cards[axis.index];
            if (!card) return null;
            
            const pt = getCoordinatesForAngle(axis.angle, radius * 1.1); 
            const isActive = activeAxis === axis.index;
            const isDimmed = activeAxis !== null && !isActive;
            const Icon = card.icon;

            let alignClass = 'align-center';
            if (axis.angle === -30 || axis.angle === 30) alignClass = 'align-left';
            if (axis.angle === 150 || axis.angle === 210) alignClass = 'align-right';

            return (
              <div
                key={`label-${axis.index}`}
                className={`research-radar-label ${alignClass} ${isActive ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
                style={{
                  left: `${(pt.x / 600) * 100}%`,
                  top: `${(pt.y / 600) * 100}%`,
                }}
                onMouseEnter={() => setActiveAxis(axis.index)}
                onMouseLeave={() => setActiveAxis(null)}
                onClick={() => setActiveAxis(isActive ? null : axis.index)}
              >
                <div className="research-radar-label-content">
                  <div className="research-radar-label-header">
                    <Icon className="research-radar-label-icon" />
                    <h3 className="research-radar-label-title">{card.title}</h3>
                  </div>
                  <div className="research-radar-label-desc-wrapper">
                    <p className="research-radar-label-desc">{card.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
