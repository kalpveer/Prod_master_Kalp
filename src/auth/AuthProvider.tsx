import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthContext, accountLabel, type AuthContextValue, type SignUpInput } from './useAuth';
import { authRedirectTo, normalizePhone, normalizeUsername, validatePassword, validatePhone, validateUsername } from './redirect';

const friendly = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a minute and try again.';
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'Email or password is incorrect.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'An account with that email already exists. Sign in instead.';
  if (m.includes('email not confirmed')) return 'This email is not confirmed yet. Sign in with your password, or reset it.';
  if (m.includes('user not found')) return 'Email or password is incorrect.';
  if (m.includes('password')) return message;
  return message;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (raw: string, password: string) => {
    const identifier = raw.trim();
    if (!identifier || !password) return 'Enter your username or email, and your password.';
    try {
      if (identifier.includes('@')) {
        const { error } = await getSupabase().auth.signInWithPassword({
          email: identifier.toLowerCase(),
          password,
        });
        return error ? friendly(error.message) : null;
      }

      const r = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: normalizeUsername(identifier), password }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) return String(json.error || 'Username or password is incorrect.');
      const { error } = await getSupabase().auth.setSession({
        access_token: json.access_token,
        refresh_token: json.refresh_token,
      });
      return error ? friendly(error.message) : null;
    } catch (e) {
      return (e as Error).message;
    }
  }, []);

  const signUp = useCallback(async ({ username, email, password, phone }: SignUpInput) => {
    const nameErr = validateUsername(username);
    if (nameErr) return nameErr;
    const passErr = validatePassword(password);
    if (passErr) return passErr;
    const phoneErr = validatePhone(phone);
    if (phoneErr) return phoneErr;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = normalizeUsername(username);
    const cleanPhone = normalizePhone(phone)!;

    try {
      const check = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      }).catch(() => null);
      const verdict = check && check.ok ? await check.json().catch(() => null) : null;
      if (verdict && verdict.ok === false) return String(verdict.reason || 'That email address cannot be used.');

      const { data: free, error: availErr } = await getSupabase().rpc('username_available', { p_username: cleanName });
      if (availErr) return 'Could not check that username. Run the latest Supabase migration (0003) and try again.';
      if (free === false) return 'That username is taken.';

      const { data, error } = await getSupabase().auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { username: cleanName, phone: cleanPhone },
          emailRedirectTo: authRedirectTo(),
        },
      });
      if (error) return friendly(error.message);
      if (data.user && !data.session) {
        return 'Account created. If you received a confirmation email, open it on this same device, then sign in.';
      }
      if (data.user) {
        const { error: profileError } = await getSupabase()
          .from('profiles')
          .update({ username: cleanName, phone: cleanPhone })
          .eq('id', data.user.id);
        if (profileError) console.warn('[signup] profile phone was not saved', profileError.message);
      }
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  }, []);

  const requestPasswordReset = useCallback(async (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email.includes('@')) return 'Enter the email on your account.';
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo: authRedirectTo() });
      return error ? friendly(error.message) : null;
    } catch (e) {
      return (e as Error).message;
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const passErr = validatePassword(password);
    if (passErr) return passErr;
    try {
      const { error } = await getSupabase().auth.updateUser({ password });
      if (error) return friendly(error.message);
      setPasswordRecovery(false);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  }, []);

  const signOut = useCallback(async () => {
    setPasswordRecovery(false);
    await getSupabase().auth.signOut();
  }, []);

  const user = session?.user ?? null;
  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user,
      displayName: accountLabel(user),
      passwordRecovery,
      signIn,
      signUp,
      requestPasswordReset,
      updatePassword,
      signOut,
    }),
    [loading, session, user, passwordRecovery, signIn, signUp, requestPasswordReset, updatePassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
