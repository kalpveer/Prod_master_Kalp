import { corsHeaders, json } from '../_shared/cors.ts';
import { ConfigError, getAdmin, requireUser } from '../_shared/admin.ts';
import { completePickaxe, PickaxeError } from '../_shared/pickaxe.ts';
import { parseGrantResult } from '../_shared/grantMatch.ts';

const STAGES = ['Just an idea', 'Researching & validating', 'Building a prototype', 'Early users', 'Generating revenue'];
const SECTORS = ['Software', 'AI / deep tech', 'Hardware', 'Climate / energy', 'Health / biotech', 'Agriculture', 'Education', 'Consumer', 'Social impact', 'Other'];
const STATES = ['Gujarat', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Telangana', 'Another Indian state', 'Outside India'];
const APPLICANTS: Record<string, string> = {
  unregistered: 'Not registered yet',
  startup: 'Registered startup',
  student: 'Student founder',
  researcher: 'Researcher or faculty',
  msme: 'Existing MSME',
};

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireUser(req);
    if (!user) return json({ error: 'Please sign in to continue.' }, 401);
    const admin = getAdmin();
    const body = await req.json().catch(() => ({}));

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

    if (venture.length < 8) return json({ error: 'Name the venture in a few words.' }, 400);
    if (!STAGES.includes(stage)) return json({ error: 'Pick the stage.' }, 400);
    if (!SECTORS.includes(sector)) return json({ error: 'Pick a sector.' }, 400);
    if (!STATES.includes(state)) return json({ error: 'Pick where it is based.' }, 400);
    if (!APPLICANTS[applicant]) return json({ error: 'Pick who is applying.' }, 400);

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

    if (!linkedIdea) {
      if (startupName.length < 2) return json({ error: 'Name your startup.' }, 400);
      if (ideaText.length < 20) return json({ error: 'Describe your idea in a bit more detail (a couple of sentences).' }, 400);
      if (audience.length < 3) return json({ error: 'Tell us who this is for.' }, 400);
      if (different.length < 5) return json({ error: 'Tell us what makes it different.' }, 400);
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
        ? `\nKnown public schemes in our catalog (use as reference, not a hard limit):\n${catalog.map((s) => `- ${s.name} (${s.provider}) ${s.href}`).join('\n')}`
        : '',
      '',
      'Write the report in plain English for founders. Do not use LaTeX or $...$ math. Use ≤ and → as normal characters. Do not wrap words in underscores. Every bullet must include readable text, not a URL alone.',
    ].filter(Boolean).join('\n');

    const raw = await completePickaxe(Deno.env.get('PICKAXE_GRANTS_DEPLOYMENT_ID'), message, user.id);
    const { report, items } = parseGrantResult(raw);
    const readyCount = items.filter((m) => m.status === 'ready').length;

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
      console.error('[grants-match] insert', insertError?.message);
      return json({ error: 'Could not save this match. Please try again.' }, 500);
    }

    return json({ id: run.id, created_at: run.created_at, matches: items, report, readyCount }, 201);
  } catch (e) {
    if (e instanceof ConfigError || e instanceof PickaxeError) {
      console.error('[grants-match] engine', e instanceof Error ? e.message : e);
      return json({
        error: e instanceof Error && e.message === 'The report engine is not configured.'
          ? 'The grant engine is not configured yet.'
          : e instanceof Error ? e.message : 'Something went wrong. Please try again.',
      }, 500);
    }
    console.error('[grants-match] failed', e);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
