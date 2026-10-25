import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthContext, type AuthContextValue } from './useAuth';

const friendly = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a minute and try again.';
  if (m.includes('expired') || m.includes('invalid')) return 'That code is invalid or has expired. Request a new one.';
  return message;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    let active = true;
    // getSession() also finishes processing a magic-link redirect (tokens in the URL hash)
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const sendSignInEmail = useCallback(async (raw: string) => {
    const email = raw.trim().toLowerCase();
    try {
      // Same disposable-domain / MX check the rest of the site uses. If the check itself is down, don't block sign-in.
      const r = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => null);
      const check = r && r.ok ? await r.json().catch(() => null) : null;
      if (check && check.ok === false) return String(check.reason || 'That email address cannot be used.');

      const { error } = await getSupabase().auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}${window.location.pathname}` },
      });
      return error ? friendly(error.message) : null;
    } catch (e) {
      return (e as Error).message;
    }
  }, []);

  const verifyCode = useCallback(async (raw: string, code: string) => {
    const { error } = await getSupabase().auth.verifyOtp({ email: raw.trim().toLowerCase(), token: code.trim(), type: 'email' });
    return error ? friendly(error.message) : null;
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ configured: isSupabaseConfigured, loading, session, user: session?.user ?? null, sendSignInEmail, verifyCode, signOut }),
    [loading, session, sendSignInEmail, verifyCode, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
