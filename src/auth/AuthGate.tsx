import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import LoginScreen from './LoginScreen';

// Renders children only for signed-in users. Wrap any page that needs an account.
export default function AuthGate({ title, children }: { title: string; children: ReactNode }) {
  const { configured, loading, session } = useAuth();

  if (!configured) {
    return (
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
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return session ? <>{children}</> : <LoginScreen title={title} />;
}
