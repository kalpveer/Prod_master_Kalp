/* eslint-disable */
import { useState, useEffect } from 'react';

const COOKIE_KEY = 'scrolly_cookie_consent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      // Small delay so it doesn't pop immediately on load
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (accepted: CookiePreferences) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(accepted));
    setVisible(false);
  };

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true });
  const rejectAll = () => save({ necessary: true, analytics: false, marketing: false });
  const saveCustom = () => save(prefs);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop blur overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'cc-fade-in 0.4s ease forwards',
        }}
        onClick={rejectAll}
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie consent"
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(96vw, 520px)',
          background: '#000000',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 16,
          padding: showDetails ? '28px 28px 20px' : '24px 28px',
          zIndex: 9999,
          animation: 'cc-slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
          color: '#ffffff',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
              <path d="M11 17v.01" />
              <path d="M7 14v.01" />
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>
              We value your privacy
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              We use cookies to enhance your experience, analyze site traffic, and serve relevant content.{' '}
              <button
                onClick={() => setShowDetails(d => !d)}
                style={{
                  background: 'none', border: 'none', color: '#ffffff',
                  cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline',
                  fontWeight: 600
                }}
              >
                {showDetails ? 'Hide details' : 'Manage preferences'}
              </button>
            </p>
          </div>
        </div>

        {/* Expandable preferences */}
        {showDetails && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 16, marginBottom: 16,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {[
              {
                key: 'necessary' as const,
                label: 'Necessary',
                desc: 'Essential for the website to function. Cannot be disabled.',
                locked: true,
              },
              {
                key: 'analytics' as const,
                label: 'Analytics',
                desc: 'Help us understand how visitors interact with our site.',
                locked: false,
              },
              {
                key: 'marketing' as const,
                label: 'Marketing',
                desc: 'Used to deliver personalized advertisements.',
                locked: false,
              },
            ].map(({ key, label, desc, locked }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{desc}</div>
                </div>
                {/* Toggle */}
                <button
                  disabled={locked}
                  onClick={() => !locked && setPrefs(p => ({ ...p, [key]: !p[key] }))}
                  aria-checked={prefs[key]}
                  role="switch"
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: locked ? 'default' : 'pointer',
                    background: prefs[key] ? '#ffffff' : 'rgba(255,255,255,0.15)',
                    position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                    opacity: locked ? 0.5 : 1,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: prefs[key] ? 'calc(100% - 21px)' : 3,
                    width: 18, height: 18, borderRadius: '50%', background: prefs[key] ? '#000000' : '#ffffff',
                    transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1), background 0.2s',
                    display: 'block',
                  }} />
                </button>
              </div>
            ))}

            <button
              onClick={saveCustom}
              style={{
                marginTop: 4,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff', borderRadius: 8, padding: '9px 16px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              Save my preferences
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            id="cookie-accept-all"
            onClick={acceptAll}
            style={{
              flex: 1, minWidth: 120,
              background: '#ffffff',
              border: 'none', borderRadius: 8, padding: '11px 20px',
              color: '#000000', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '-0.2px',
              transition: 'background-color 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5e5e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Accept all cookies
          </button>
          <button
            id="cookie-reject-all"
            onClick={rejectAll}
            style={{
              flex: 1, minWidth: 100,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8, padding: '11px 20px',
              color: '#ffffff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffffff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Reject non-essential
          </button>
        </div>

        {/* Footer note */}
        <p style={{ margin: '12px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.5 }}>
          By using this site you agree to our{' '}
          <a href="/TERMS%20AND%20CONDITIONS%20-%20Productica.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'underline' }}>Privacy Policy</a>
          {' '}and{' '}
          <a href="/TERMS%20AND%20CONDITIONS%20-%20Productica.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'underline' }}>Terms of Service</a>.
        </p>
      </div>

      <style>{`
        @keyframes cc-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes cc-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
