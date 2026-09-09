import { useEffect, useState, useRef } from 'react';
import { 
  Search, Bell, Moon, LayoutDashboard, Database, 
  Users, History, Settings, Code, ArrowUpRight, CheckCircle2,
  Target
} from 'lucide-react';
import './UniversityKPIs.css';



const KPI_METRICS = [
  { val: 85, icon: LayoutDashboard, label: 'STUDENT ENTREPRENEURS', sub: 'OPPORTUNITY SCORE' },
  { val: 92, icon: Target, label: 'FACULTY INNOVATION', sub: 'INNOVATION SCORE' },
  { val: 62, icon: Database, label: 'SPINOUT SUPPORT', sub: 'COMMERCIALIZATION SCORE' },
  { val: 78, icon: History, label: 'PROGRAMS', sub: 'PROGRAM STRENGTH' },
  { val: 74, icon: Settings, label: 'INCUBATION', sub: 'INTEGRATION SCORE' },
  { val: 70, icon: Code, label: 'ANALYTICS', sub: 'ANALYTICS SCORE' },
];

const SIDEBAR_ITEMS = [
  { name: 'Workspace', icon: LayoutDashboard, active: true },
  { name: 'Modules', icon: Database },
  { name: 'Your Team', icon: Users },
  { name: 'History', icon: History },
  { name: 'Settings', icon: Settings },
  { name: 'Developer', icon: Code },
];

const RECOMMENDATIONS = [
  'Connect Faculty Innovation Lab with Startup Program',
  'Increase validation workshops in Engineering',
  'Commercialization opportunity detected in Biotechnology'
];

function AnimatedCounter({ endValue, delay }: { endValue: number, delay: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    const duration = 1500; 

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            const step = (timestamp: number) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const easeProgress = 1 - Math.pow(1 - progress, 4);
              setCount(Math.floor(easeProgress * endValue));
              if (progress < 1) animationFrame = requestAnimationFrame(step);
            };
            animationFrame = requestAnimationFrame(step);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [endValue, delay]);

  return <span ref={ref}>{count}</span>;
}

export default function UniversityKPIs() {
  return (
    <section className="ud-section">
      <div className="ud-window">
        <div className="ud-dashboard-ui">
          {/* ── Sidebar ── */}
          <aside className="ud-sidebar">
        <div className="ud-logo-area">
          <div className="ud-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Productica
          </div>
          <span style={{ fontSize: '0.75rem', color: '#999' }}>&lt;</span>
        </div>
        <div className="ud-nav-list">
          {SIDEBAR_ITEMS.map((item, idx) => (
            <div key={idx} className={`ud-nav-item ${item.active ? 'active' : ''}`}>
              <div className="ud-nav-left">
                <item.icon size={16} />
                {item.name}
              </div>
              {item.active && <div className="ud-nav-dot" />}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Area ── */}
      <main className="ud-main-area">
        {/* Topbar */}
        <header className="ud-topbar">
          <div className="ud-search-box">
            <Search size={16} />
            Search or jump to...
            <span className="ud-search-shortcut">⌘ K</span>
          </div>
          <div className="ud-topbar-actions">
            <div className="ud-action-btn">
              <Moon size={16} />
            </div>
            <div className="ud-action-btn">
              <Bell size={16} />
              <div className="ud-badge" />
            </div>
            <div className="ud-profile-btn">
              <div className="ud-avatar">A</div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
        </header>

        {/* Ticker */}
        <div className="ud-ticker">
          <div className="ud-ticker-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            LATEST
          </div>
          <span>New Research Grants announced for 2026 Innovation Cycle</span>
          <span>Faculty Innovation Lab achieves 92% commercialization readiness</span>
        </div>

        {/* Content */}
        <div className="ud-content">
          <div className="ud-hero">
            <div className="ud-greeting">Good evening,</div>
            <div className="ud-hero-name">User.</div>
            <div className="ud-hero-sub">A calm place to think, build and ship. Your workspace adapts as you grow.</div>
          </div>

          {/* KPIs */}
          <div className="ud-kpi-grid">
            {KPI_METRICS.map((kpi, idx) => (
              <div key={idx} className="ud-kpi-item">
                <div className="ud-kpi-val">
                  <AnimatedCounter endValue={kpi.val} delay={idx * 100} />
                </div>
                <div className="ud-kpi-label-row">
                  <kpi.icon size={12} />
                  {kpi.label}
                </div>
                <div className="ud-kpi-sub">{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Split Area */}
          <div className="ud-split">
            {/* Left: Pipeline / Analytics representing "Pinned modules" */}
            <div>
              <div className="ud-split-header">
                <div className="ud-split-title">Campus Intelligence</div>
                <div className="ud-split-link">Browse all <ArrowUpRight size={14}/></div>
              </div>
              <div className="ud-pinned-card">
                
                {/* Mini Pipeline */}
                <div className="ud-mini-pipeline">
                  <div className="ud-mini-line" />
                  {[
                    { name: 'Research', count: 128 },
                    { name: 'Validation', count: 87 },
                    { name: 'Prototype', count: 42 },
                    { name: 'Startup', count: 18 }
                  ].map((s, i) => (
                    <div key={i} className="ud-mini-stage">
                      <div className="ud-mini-dot" />
                      <div className="ud-mini-label">{s.name}</div>
                      <div className="ud-mini-count">{s.count}</div>
                    </div>
                  ))}
                </div>

                {/* Mini Analytics */}
                <div className="ud-mini-analytics">
                  <div className="ud-mini-chart">
                    <span className="ud-mini-chart-title">Innovation Activity</span>
                    <div className="ud-mini-chart-area">
                      {[40, 60, 30, 80, 50, 90].map((h, i) => (
                        <div key={i} className="ud-mini-bar" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="ud-mini-chart">
                    <span className="ud-mini-chart-title">Readiness</span>
                    <div className="ud-mini-chart-area" style={{ alignItems: 'center' }}>
                      <svg viewBox="0 0 100 50" style={{ width: '100%', height: '40px', overflow: 'visible' }}>
                        <path d="M0 40 Q20 40 40 20 T80 10 T100 5" fill="none" stroke="#eaeaea" strokeWidth="3" />
                        <path d="M0 40 Q20 40 40 20 T80 10 T100 5" fill="none" stroke="#000" strokeWidth="3" strokeDasharray="150" strokeDashoffset="0" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Black Card (RECOMMENDED NEXT) */}
            <div>
              <div style={{ height: '1.5rem', marginBottom: '1.5rem' }}></div> {/* Spacer to align with header */}
              <div className="ud-black-card">
                <div className="ud-bc-header">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7"/></svg>
                  RECOMMENDED NEXT
                </div>
                <div className="ud-bc-title">Idea Validation</div>
                <div className="ud-bc-desc">Formulate hypotheses, run validation tests, and track feedback.</div>
                <button className="ud-bc-btn">Unlock for 7 credits</button>

                <div className="ud-bc-list">
                  {RECOMMENDATIONS.map((rec, i) => (
                    <div key={i} className="ud-bc-list-item">
                      <CheckCircle2 size={14} style={{ marginTop: '2px', flexShrink: 0, color: 'rgba(255,255,255,0.4)' }}/>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</section>
  );
}
