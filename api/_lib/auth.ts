/* eslint-disable */
import type { User } from '@supabase/supabase-js';
import { getAdmin } from './supabaseAdmin.js';

// Verifies the caller's Supabase access token ("Authorization: Bearer <jwt>") and returns the user.
export async function requireUser(req: any): Promise<User | null> {
  const header = String(req.headers?.authorization || req.headers?.Authorization || '');
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const { data, error } = await getAdmin().auth.getUser(token);
  return error || !data.user ? null : data.user;
}
