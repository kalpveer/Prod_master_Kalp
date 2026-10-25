/* eslint-disable */
// Server-side Supabase client using the service-role key. Bypasses RLS, so it must only
// ever be used in api/* handlers and never be imported from src/.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class ConfigError extends Error {}

let client: SupabaseClient | null = null;

export function getAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ConfigError('Supabase is not configured on the server.');
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
