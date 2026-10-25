/* eslint-disable */
// POST /api/idea/generate   (Authorization: Bearer <supabase access token>)
//
// 1. verifies the user, validates the four answers (+ optional pitch deck path)
// 2. enforces per-user limits, inserts an `idea_reports` row with status "running"
// 3. answers 202 { id } immediately and finishes the work in the background (waitUntil):
//    read the deck text -> call Pickaxe (~1-3 min) -> save the markdown, status "done" | "failed"
// The browser then follows the row (RLS-protected SELECT), so closing the tab loses nothing.
//
// The Pickaxe deployment id is the bearer token for Pickaxe, so it only lives in server env.
import { waitUntil } from '@vercel/functions';
import { requireUser } from '../_lib/auth.js';
import { ConfigError, getAdmin } from '../_lib/supabaseAdmin.js';
import { extractDeckText } from '../_lib/deckText.js';

const PICKAXE_URL = process.env.PICKAXE_API_URL || 'https://api.pickaxe.co/v1/completions';
const DAILY_LIMIT = Math.max(1, Number(process.env.IDEA_DAILY_LIMIT) || 5);
const STALE_MS = 7 * 60 * 1000;
const PICKAXE_TIMEOUT_MS = 280_000;
const BUCKET = 'pitch-decks';
const STAGES = ['Just an idea', 'Researching & validating', 'Building a prototype', 'Early users', 'Generating revenue'];

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
const safeJson = (s: string) => { try { return JSON.parse(s); } catch { return null; } };

class UserFacingError extends Error {}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireUser(req);
    if (!user) return res.status(401).json({ error: 'Please sign in to continue.' });

    const body = typeof req.body === 'string' ? safeJson(req.body) || {} : req.body || {};
    const idea = clean(body.idea, 4000);
    const audience = clean(body.audience, 1500);
    const different = clean(body.different, 3000);
    const stage = clean(body.stage, 80);
    const deckPath = clean(body.deckPath, 300);
    const deckName = clean(body.deckName, 200);

    if (idea.length < 20) return res.status(400).json({ error: 'Describe your idea in a bit more detail.' });
    if (audience.length < 3) return res.status(400).json({ error: 'Tell us who the product is for.' });
    if (different.length < 5) return res.status(400).json({ error: 'Tell us what makes your solution different.' });
    if (!STAGES.includes(stage)) return res.status(400).json({ error: 'Pick your current stage.' });
    if (deckPath && !new RegExp(`^${user.id}/[A-Za-z0-9._-]+\\.(pdf|pptx)$`, 'i').test(deckPath)) {
      return res.status(400).json({ error: 'That pitch deck upload is not valid.' });
    }

    const admin = getAdmin();

    // Runs that never finished (function killed, etc.) must not block the user forever.
    const staleBefore = new Date(Date.now() - STALE_MS).toISOString();
    await admin
      .from('idea_reports')
      .update({ status: 'failed', error: 'This run did not finish. Please try again.', completed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'running')
      .lt('created_at', staleBefore);

    const { count: running } = await admin
      .from('idea_reports').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'running');
    if ((running ?? 0) > 0) return res.status(409).json({ error: 'You already have a report generating. Wait for it to finish.' });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recent } = await admin
      .from('idea_reports').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', since);
    if ((recent ?? 0) >= DAILY_LIMIT) {
      return res.status(429).json({ error: `You can run ${DAILY_LIMIT} validations per day. Try again tomorrow.` });
    }

    const { data: row, error: insertError } = await admin
      .from('idea_reports')
      .insert({
        user_id: user.id, status: 'running', idea, audience, different, stage,
        deck_path: deckPath || null, deck_name: deckName || null,
      })
      .select('id')
      .single();
    if (insertError || !row) {
      console.error('[idea/generate] insert failed', insertError?.message);
      return res.status(500).json({ error: 'Could not start your report. Please try again.' });
    }

    const job = runReport(row.id, user.id, { idea, audience, different, stage, deckPath, deckName }).catch(e =>
      console.error('[idea/generate] unhandled job error', e),
    );
    try { waitUntil(job); } catch { /* not on Vercel: the promise simply keeps running */ }

    return res.status(202).json({ id: row.id });
  } catch (e: any) {
    if (e instanceof ConfigError) {
      console.error('[idea/generate] config', e.message);
      return res.status(500).json({ error: 'The report service is not configured yet.' });
    }
    console.error('[idea/generate] failed', e);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

async function runReport(
  id: string,
  userId: string,
  a: { idea: string; audience: string; different: string; stage: string; deckPath: string; deckName: string },
) {
  const admin = getAdmin();
  const finish = async (patch: Record<string, unknown>) => {
    const { error } = await admin.from('idea_reports').update({ ...patch, completed_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
    if (error) console.error('[idea/generate] could not save result', id, error.message);
  };

  try {
    let deckText = '';
    if (a.deckPath) {
      try {
        const { data, error } = await admin.storage.from(BUCKET).download(a.deckPath);
        if (error || !data) throw error || new Error('empty download');
        deckText = await extractDeckText(new Uint8Array(await data.arrayBuffer()), a.deckName || a.deckPath);
      } catch (e: any) {
        console.error('[idea/generate] deck read failed (continuing without it)', e?.message);
      }
    }

    const message = [
      `Describe your startup idea: ${a.idea}`,
      `Who is this product for?: ${a.audience}`,
      `What makes your solution different?: ${a.different}`,
      `What is your current stage?: ${a.stage}`,
      deckText ? `\nPitch deck provided by the founder (text extracted from "${a.deckName}"; treat it as founder-stated claims, not verified evidence):\n${deckText}` : '',
    ].filter(Boolean).join('\n');

    const markdown = await callPickaxe(message, userId);
    const meta = readMeta(markdown);
    await finish({ status: 'done', markdown, title: meta.title, verdict: meta.verdict, iq: meta.iq, error: null });
  } catch (e: any) {
    console.error('[idea/generate] run failed', id, e?.message);
    await finish({ status: 'failed', error: e instanceof UserFacingError ? e.message : 'The report could not be completed. Please try again.' });
  }
}

async function callPickaxe(message: string, userId: string): Promise<string> {
  const token = process.env.PICKAXE_DEPLOYMENT_ID;
  if (!token) throw new UserFacingError('The report engine is not configured.');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PICKAXE_TIMEOUT_MS);
  try {
    const r = await fetch(PICKAXE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message, userId }),
      signal: ctrl.signal,
    });
    const text = await r.text();
    const json = safeJson(text);
    if (!r.ok || !json || json.success === false || typeof json.result !== 'string' || !json.result.trim()) {
      console.error('[idea/generate] pickaxe error', r.status, text.slice(0, 500));
      throw new UserFacingError('The report engine could not complete this run. Please try again.');
    }
    return json.result;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new UserFacingError('The report took too long. Please try again.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// Small denormalised summary so the history list never has to load the full markdown.
function readMeta(md: string) {
  const title = (md.match(/^#\s+(.+)$/m) || [])[1]?.replace(/\*\*/g, '').trim().slice(0, 140) || null;
  const verdict = (md.match(/\*\*Verdict:\*\*\s*([^\n]+)/i) || [])[1]?.replace(/\*\*/g, '').trim().slice(0, 40) || null;
  const iqRaw = (md.match(/\*\*Syncoro IQ today:\*\*\s*([\d.]+)/i) || [])[1];
  const iq = iqRaw && !isNaN(Number(iqRaw)) ? Math.min(10, Math.max(0, Number(iqRaw))) : null;
  return { title, verdict, iq };
}
