/* eslint-disable */
// POST /api/auth/signin  { identifier, password }
// Resolves a username to an email, then signs in. Never tells the client whether the username exists.

import { createClient } from '@supabase/supabase-js';
import { getAdmin } from '../_lib/supabaseAdmin.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const identifier = String(req.body?.identifier || '').trim();
  const password = String(req.body?.password || '');
  if (!identifier || !password) return res.status(400).json({ error: 'Enter your username or email, and your password.' });

  try {
    let email = identifier.toLowerCase();
    if (!email.includes('@')) {
      const { data } = await getAdmin()
        .from('profiles')
        .select('email')
        .eq('username', email)
        .maybeSingle();
      if (!data?.email) return res.status(401).json({ error: 'Username or password is incorrect.' });
      email = data.email;
    }

    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anon = process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) return res.status(500).json({ error: 'Auth is not configured.' });

    const { data, error } = await createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    }).auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return res.status(401).json({ error: 'Username or password is incorrect.' });
    }

    return res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (e) {
    console.error('[auth/signin]', e);
    return res.status(500).json({ error: 'Could not sign in. Try again.' });
  }
}
