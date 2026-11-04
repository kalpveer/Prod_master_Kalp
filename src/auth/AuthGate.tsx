import { useState, type ReactNode } from 'react';
import { useAuth } from './useAuth';
import LoginScreen from './LoginScreen';
import ToolLanding from '../modules/ToolLanding';
import { landingCopy } from '../modules/venture/landingCopy';
import { markWorkspaceOpen, shouldSkipLanding, type VentureTool } from '../modules/venture/landingGate';
import { VentureTheme } from '../modules/venture/theme';

// Public landing first, then sign-in, then the tool.
export default function AuthGate({ title, landing, children }: { title: string; landing?: VentureTool; children: ReactNode }) {
  const { configured, loading, session, passwordRecovery } = useAuth();
  const [askedToEnter, setAskedToEnter] = useState(() => !landing || shouldSkipLanding(landing));
  const showLanding = Boolean(landing) && !askedToEnter && !session && !passwordRecovery;

  const enter = () => {
    markWorkspaceOpen();
    setAskedToEnter(true);
  };

  const screen = showLanding && landing ? (
    <ToolLanding
      kind={landing}
      title={landingCopy[landing].title}
      eyebrow={landingCopy[landing].eyebrow}
      description={landingCopy[landing].description}
      detail={landingCopy[landing].detail}
      ctaLabel={landingCopy[landing].ctaLabel}
      onEnter={enter}
    />
  ) : !configured ? (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-4">Not configured</p>
          <h1 className="text-3xl font-light tracking-tighter">Accounts are <span className="font-semibold">not set up yet.</span></h1>
          <p className="mt-4 text-sm text-white/50">
            Add <code className="text-white/70">VITE_SUPABASE_URL</code> and <code className="text-white/70">VITE_SUPABASE_ANON_KEY</code> to
            your environment and restart the dev server.
          </p>
        </div>
      </div>
  ) : loading ? (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-label="Loading" />
      </div>
  ) : !session || passwordRecovery ? (
    <LoginScreen title={title} active={landing === 'grants' ? 'grants' : 'idea'} />
  ) : (
    <>{children}</>
  );

  return <VentureTheme>{screen}</VentureTheme>;
}
