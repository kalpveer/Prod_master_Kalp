import { FunctionsHttpError } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

/** Call a Supabase Edge Function with the signed-in user's JWT. Pickaxe never runs in the browser. */
export async function invokeFunction<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  const { data, error } = await getSupabase().functions.invoke(name, { body });
  if (!error) return data as T;

  let message = error.message || 'Something went wrong.';
  if (error instanceof FunctionsHttpError) {
    const payload = await error.context.json().catch(() => null) as { error?: string } | null;
    if (payload?.error) message = payload.error;
  }
  throw new Error(message);
}
