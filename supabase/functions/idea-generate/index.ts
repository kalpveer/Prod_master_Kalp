import { corsHeaders, json } from '../_shared/cors.ts';
import { ConfigError, getAdmin, isQuotaError, readQuota, requireUser } from '../_shared/admin.ts';
import { completePickaxe, PickaxeError } from '../_shared/pickaxe.ts';

const DAILY_LIMIT = Math.max(1, Number(Deno.env.get('IDEA_DAILY_LIMIT')) || 5);
const FREE_LIMIT = 3;
const STALE_MS = 7 * 60 * 1000;
const PICKAXE_TIMEOUT_MS = 280_000;
const BUCKET = 'pitch-decks';
const STAGES = ['Just an idea', 'Researching & validating', 'Building a prototype', 'Early users', 'Generating revenue'];
const MAX_DECK_CHARS = 15000;

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
const safeJson = (s: string) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

function keepAlive(job: Promise<unknown>) {
  const runtime = (globalThis as { EdgeRuntime?: { waitUntil: (p: Promise<unknown>) => void } }).EdgeRuntime;
  if (runtime?.waitUntil) {
    runtime.waitUntil(job);
    return true;
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireUser(req);
    if (!user) return json({ error: 'Please sign in to continue.' }, 401);

    const body = await req.json().catch(() => ({}));
    const startupName = clean(body.startupName, 80);
    const idea = clean(body.idea, 4000);
    const audience = clean(body.audience, 1500);
    const different = clean(body.different, 3000);
    const stage = clean(body.stage, 80);
    const revenue = clean(body.revenue, 200);
    const deckPath = clean(body.deckPath, 300);
    const deckName = clean(body.deckName, 200);

    if (startupName.length < 2) return json({ error: 'Name your startup.' }, 400);
    if (idea.length < 20) return json({ error: 'Describe your idea in a bit more detail.' }, 400);
    if (audience.length < 3) return json({ error: 'Tell us who the product is for.' }, 400);
    if (different.length < 5) return json({ error: 'Tell us what makes your solution different.' }, 400);
    if (!STAGES.includes(stage)) return json({ error: 'Pick your current stage.' }, 400);
    if (stage === 'Generating revenue' && revenue.length < 2) {
      return json({ error: 'Say how much revenue you make, even roughly.' }, 400);
    }
    if (deckPath && !new RegExp(`^${user.id}/[A-Za-z0-9._-]+\\.(pdf|pptx)$`, 'i').test(deckPath)) {
      return json({ error: 'That pitch deck upload is not valid.' }, 400);
    }

    const admin = getAdmin();
    const staleBefore = new Date(Date.now() - STALE_MS).toISOString();
    await admin
      .from('idea_reports')
      .update({ status: 'failed', error: 'This run did not finish. Please try again.', completed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'running')
      .lt('created_at', staleBefore);

    const { count: running } = await admin
      .from('idea_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'running');
    if ((running ?? 0) > 0) return json({ error: 'You already have a report generating. Wait for it to finish.' }, 409);

    const quota = await readQuota(admin, user.id, 'idea');
    if (quota.used >= quota.limit) {
      return json({ error: `You've used your ${quota.limit} free validations on this account.` }, 429);
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recent } = await admin
      .from('idea_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since);
    if ((recent ?? 0) >= DAILY_LIMIT) {
      return json({ error: `You can run ${DAILY_LIMIT} validations per day. Try again tomorrow.` }, 429);
    }

    const { data: row, error: insertError } = await admin
      .from('idea_reports')
      .insert({
        user_id: user.id,
        status: 'running',
        startup_name: startupName,
        idea,
        audience,
        different,
        stage,
        revenue: stage === 'Generating revenue' ? revenue : null,
        deck_path: deckPath || null,
        deck_name: deckName || null,
      })
      .select('id')
      .single();
    if (insertError || !row) {
      if (isQuotaError(insertError)) {
        return json({ error: `You've used your ${FREE_LIMIT} free validations on this account.` }, 429);
      }
      console.error('[idea-generate] insert failed', insertError?.message);
      return json({ error: 'Could not start your report. Please try again.' }, 500);
    }

    const job = runReport(row.id, user.id, { startupName, idea, audience, different, stage, revenue, deckPath, deckName }).catch((e) =>
      console.error('[idea-generate] unhandled job error', e),
    );
    if (!keepAlive(job)) await job;

    return json({ id: row.id }, 202);
  } catch (e) {
    if (e instanceof ConfigError) {
      console.error('[idea-generate] config', e.message);
      return json({ error: 'The report service is not configured yet.' }, 500);
    }
    console.error('[idea-generate] failed', e);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});

async function extractDeckText(buf: Uint8Array, fileName: string): Promise<string> {
  if (/\.pptx$/i.test(fileName)) {
    const JSZip = (await import('npm:jszip')).default;
    const zip = await JSZip.loadAsync(buf);
    const slides = Object.keys(zip.files)
      .map((name) => ({ name, n: Number((name.match(/^ppt\/slides\/slide(\d+)\.xml$/) || [])[1]) }))
      .filter((f) => f.n)
      .sort((a, b) => a.n - b.n);
    const parts: string[] = [];
    const decodeXml = (s: string) =>
      s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
    for (const f of slides) {
      const xml = await zip.files[f.name].async('string');
      const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => decodeXml(m[1]).trim()).filter(Boolean);
      if (runs.length) parts.push(`Slide ${f.n}: ${runs.join(' ')}`);
    }
    return parts.join('\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_DECK_CHARS);
  }
  if (/\.pdf$/i.test(fileName)) {
    const { extractText, getDocumentProxy } = await import('npm:unpdf');
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: true });
    return String(text || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_DECK_CHARS);
  }
  return '';
}

async function runReport(
  id: string,
  userId: string,
  a: { startupName: string; idea: string; audience: string; different: string; stage: string; revenue: string; deckPath: string; deckName: string },
) {
  const admin = getAdmin();
  const finish = async (patch: Record<string, unknown>) => {
    const { error } = await admin.from('idea_reports').update({ ...patch, completed_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
    if (error) console.error('[idea-generate] could not save result', id, error.message);
  };

  try {
    let deckText = '';
    let deckUrl = '';
    if (a.deckPath) {
      const { data, error } = await admin.storage.from(BUCKET).download(a.deckPath);
      if (error || !data) throw new PickaxeError('We could not read the pitch deck you uploaded. Try a smaller PDF or PPTX.');
      deckText = await extractDeckText(new Uint8Array(await data.arrayBuffer()), a.deckName || a.deckPath);
      const signed = await admin.storage.from(BUCKET).createSignedUrl(a.deckPath, 60 * 60);
      if (!signed.error && signed.data?.signedUrl) deckUrl = signed.data.signedUrl;
      if (!deckText && !deckUrl) throw new PickaxeError('We could not read the text of that pitch deck. Export it as a PDF and try again.');
    }

    const deckForPickaxe = [
      deckText,
      deckUrl ? `Pitch deck file "${a.deckName}": ${deckUrl}` : '',
    ].filter(Boolean).join('\n\n');

    const inputs: Record<string, string> = {
      'Name of your startup': a.startupName,
      'Describe your startup idea': a.idea,
      'Who is this product for?': a.audience,
      'What makes your solution different?': a.different,
      'What is your current stage?': a.stage,
    };
    if (a.stage === 'Generating revenue' && a.revenue) inputs['How much revenue do you make?'] = a.revenue;
    if (deckForPickaxe) inputs['Pitch deck'] = deckForPickaxe;

    const message = [
      `Name of your startup: ${a.startupName}`,
      `Describe your startup idea: ${a.idea}`,
      `Who is this product for?: ${a.audience}`,
      `What makes your solution different?: ${a.different}`,
      `What is your current stage?: ${a.stage}`,
      a.stage === 'Generating revenue' && a.revenue ? `How much revenue do you make?: ${a.revenue}` : '',
      deckText
        ? `\nPitch deck (attached as the "Pitch deck" form input; text from "${a.deckName}"; treat as founder-stated claims, not verified evidence):\n${deckText}`
        : deckUrl
          ? `\nPitch deck file attached as the "Pitch deck" form input (${a.deckName}): ${deckUrl}`
          : '',
    ].filter(Boolean).join('\n');

    const markdown = await completePickaxe(
      Deno.env.get('PICKAXE_DEPLOYMENT_ID'),
      message,
      userId,
      PICKAXE_TIMEOUT_MS,
      { inputs },
    );
    const meta = readMeta(markdown);
    await finish({ status: 'done', markdown, title: meta.title || a.startupName, verdict: meta.verdict, iq: meta.iq, error: null });
  } catch (e) {
    console.error('[idea-generate] run failed', id, e);
    const message = e instanceof PickaxeError ? e.message : 'The report could not be completed. Please try again.';
    await finish({ status: 'failed', error: message });
  }
}

function readMeta(md: string) {
  const j = safeJson(md.replace(/^```(?:json)?\s*\n?|\n?```\s*$/g, '').trim());
  if (j && typeof j === 'object' && Array.isArray(j.q)) {
    const iqNum = Number(j.iq?.today ?? j.iq);
    return {
      title: String(j.name || '').slice(0, 140) || null,
      verdict: String(j.verdict || '').slice(0, 40) || null,
      iq: isNaN(iqNum) || j.iq == null ? null : Math.min(10, Math.max(0, iqNum)),
    };
  }
  const title = (md.match(/^#\s+(.+)$/m) || [])[1]?.replace(/\*\*/g, '').trim().slice(0, 140) || null;
  const verdict = (
    (md.match(/\*\*Verdict:\*\*\s*([^\n]+)/i) || [])[1] ||
    (md.match(/^Verdict:\s*([^\n]+)/im) || [])[1] ||
    ''
  ).replace(/\*\*/g, '').trim().slice(0, 40) || null;
  const iqRaw = (
    (md.match(/\*\*Syncoro IQ today:\*\*\s*([\d.]+)/i) || [])[1] ||
    (md.match(/Syncoro IQ today[^0-9\n]{0,24}([\d.]+)/i) || [])[1] ||
    (md.match(/Syncoro IQ[:\s*]*([\d.]+)\s*\/\s*10/i) || [])[1]
  );
  const iq = iqRaw && !isNaN(Number(iqRaw)) ? Math.min(10, Math.max(0, Number(iqRaw))) : null;
  return { title, verdict, iq };
}
