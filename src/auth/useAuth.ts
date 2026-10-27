import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  displayName: string | null;
  passwordRecovery: boolean;
  signIn: (identifier: string, password: string) => Promise<string | null>;
  signUp: (input: SignUpInput) => Promise<string | null>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function accountLabel(user: User | null | undefined) {
  const username = typeof user?.user_metadata?.username === 'string' ? user.user_metadata.username : '';
  if (username) return `@${username}`;
  return user?.email ?? null;
}
