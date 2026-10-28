/* eslint-disable */
// GET  /api/grants/match   quota
// POST /api/grants/match   AI grant match via Pickaxe, then save the shortlist
import { requireUser } from '../_lib/auth.js';
import { ConfigError, getAdmin } from '../_lib/supabaseAdmin.js';
import { parseGrantResult } from '../_lib/grantMatch.js';
import { completePickaxe, PickaxeError } from '../_lib/pickaxe.js';
import { readQuota } from '../_lib/quotas.js';

const STAGES = ['Just an idea', 'Researching & validating', 'Building a prototype', 'Early users', 'Generating revenue'];
const SECTORS = ['Software', 'AI / deep tech', 'Hardware', 'Climate / energy', 'Health / biotech', 'Agriculture', 'Education', 'Consumer', 'Social impact', 'Other'];
const STATES = ['Gujarat', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Telangana', 'Another Indian state', 'Outside India'];
const APPLICANTS = {
  unregistered: 'Not registered yet',
  startup: 'Registered startup',
  student: 'Student founder',
  researcher: 'Researcher or faculty',
  msme: 'Existing MSME',
};

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
const safeJson = (s: string) => { try { return JSON.parse(s); } catch { return null; } };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireUser(req);
    if (!user) return res.status(401).json({ error: 'Please sign in to continue.' });
    const admin = getAdmin();

    if (req.method === 'GET') {
      const quota = await readQuota(admin, user.id, 'grants');
      return res.status(200).json({ used: quota.used, limit: quota.limit });
    }

    const body = typeof req.body === 'string' ? safeJson(req.body) || {} : req.body || {};
    const venture = clean(body.venture, 400);
    const stage = clean(body.stage, 80);
    const sector = clean(body.sector, 80);
    const state = clean(body.state, 80);
    const applicant = clean(body.applicant, 40);
    const ideaReportId = clean(body.ideaReportId, 64);
    const startupName = clean(body.startupName, 80);
    const ideaText = clean(body.idea, 4000);
    const audience = clean(body.audience, 1500);
    const different = clean(body.different, 3000);

    if (venture.length < 8) return res.status(400).json({ error: 'Name the venture in a few words.' });
    if (!STAGES.includes(stage)) return res.status(400).json({ error: 'Pick the stage.' });
    if (!SECTORS.includes(sector)) return res.status(400).json({ error: 'Pick a sector.' });
    if (!STATES.includes(state)) return res.status(400).json({ error: 'Pick where it is based.' });
    if (!APPLICANTS[applicant]) return res.status(400).json({ error: 'Pick who is applying.' });

    let ideaContext = '';
    let linkedIdea: string | null = null;
    let linkedProfile: { startupName: string; idea: string; audience: string; different: string } | null = null;
    if (ideaReportId) {
      const { data: idea } = await admin
        .from('idea_reports')
        .select('id,title,startup_name,idea,audience,different,stage,verdict,iq')
        .eq('id', ideaReportId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (idea) {
        linkedIdea = idea.id;
        linkedProfile = {
          startupName: idea.startup_name || idea.title || '',
          idea: idea.idea,
          audience: idea.audience,
          different: idea.different,
        };
        ideaContext = [
          `Linked idea validation: ${idea.startup_name || idea.title || 'Untitled'}`,
          `Idea: ${idea.idea}`,
          `Audience: ${idea.audience}`,
          `What is different: ${idea.different}`,
          `Validation stage: ${idea.stage}`,
          idea.verdict ? `Verdict: ${idea.verdict}` : '',
          idea.iq != null ? `Syncoro IQ: ${idea.iq}` : '',
        ].filter(Boolean).join('\n');
      }
    }

    // Started on Grants, so the same venture questions live on this request.
    if (!linkedIdea) {
      if (startupName.length < 2) return res.status(400).json({ error: 'Name your startup.' });
      if (ideaText.length < 20) return res.status(400).json({ error: 'Describe your idea in a bit more detail (a couple of sentences).' });
      if (audience.length < 3) return res.status(400).json({ error: 'Tell us who this is for.' });
      if (different.length < 5) return res.status(400).json({ error: 'Tell us what makes it different.' });
      ideaContext = [
        `Startup name: ${startupName}`,
        `Idea: ${ideaText}`,
        `Audience: ${audience}`,
        `What is different: ${different}`,
      ].join('\n');
    }

    const { data: catalog } = await admin
      .from('grant_schemes')
      .select('id,name,provider,summary,href,kind,india_only,states,sectors,applicants,stages')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    const message = [
      `Describe the venture: ${venture}`,
      `What is the current stage?: ${stage}`,
      `What sector is it in?: ${sector}`,
      `Where is it based?: ${state}`,
      `Who is applying?: ${APPLICANTS[applicant]}`,
      ideaContext,
      catalog?.length
        ? `\nKnown public schemes in our catalog (use as reference, not a hard limit):\n${catalog.map(s => `- ${s.name} (${s.provider}) ${s.href}`).join('\n')}`
        : '',
      '',
      'Write the report in plain English for founders. Do not use LaTeX or $...$ math. Use ≤ and → as normal characters. Do not wrap words in underscores. Every bullet must include readable text, not a URL alone.',
    ].filter(Boolean).join('\n');

    const raw = await completePickaxe(process.env.PICKAXE_GRANTS_DEPLOYMENT_ID, message, user.id);
    const { report, items } = parseGrantResult(raw);
    const readyCount = items.filter(m => m.status === 'ready').length;

    const { data: run, error: insertError } = await admin
      .from('grant_runs')
      .insert({
        user_id: user.id,
        idea_report_id: linkedIdea,
        venture,
        stage,
        sector,
        state,
        applicant,
        matches: {
          report,
          items,
          profile: linkedProfile || { startupName, idea: ideaText, audience, different },
        },
        ready_count: readyCount,
      })
      .select('id,created_at')
      .single();
    if (insertError || !run) {
      console.error('[grants/match] insert', insertError?.message);
      return res.status(500).json({ error: 'Could not save this match. Please try again.' });
    }

    return res.status(201).json({ id: run.id, created_at: run.created_at, matches: items, report, readyCount });
  } catch (e: any) {
    if (e instanceof ConfigError || e instanceof PickaxeError) {
      console.error('[grants/match] engine', e.message);
      return res.status(500).json({ error: e.message === 'The report engine is not configured.' ? 'The grant engine is not configured yet.' : e.message });
    }
    console.error('[grants/match] failed', e);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
