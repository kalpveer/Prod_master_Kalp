const PICKAXE_URL = Deno.env.get('PICKAXE_API_URL') || 'https://api.pickaxe.co/v1/completions';
const DEFAULT_TIMEOUT_MS = 280_000;

export class PickaxeError extends Error {}

const safeJson = (s: string) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

function pickText(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (!value || typeof value !== 'object') return '';
  const o = value as Record<string, unknown>;
  for (const key of ['result', 'output', 'completion', 'markdown', 'report', 'text', 'message', 'content']) {
    const hit = pickText(o[key]);
    if (hit) return hit;
  }
  return '';
}

/** Deployment id is the bearer token. Server only. */
export async function completePickaxe(
  token: string | undefined,
  message: string,
  userId: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  extras?: { inputs?: Record<string, string> },
): Promise<string> {
  if (!token) throw new PickaxeError('The report engine is not configured.');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(PICKAXE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        message,
        userId,
        ...(extras?.inputs && Object.keys(extras.inputs).length ? { inputs: extras.inputs } : {}),
      }),
      signal: ctrl.signal,
    });
    const text = await r.text();
    const parsed = safeJson(text);
    const result = pickText(parsed) || (typeof text === 'string' && !text.trim().startsWith('{') ? text : '');
    if (!r.ok || parsed?.success === false || !result.trim()) {
      console.error('[pickaxe] error', r.status, text.slice(0, 500));
      throw new PickaxeError('The report engine could not complete this run. Please try again.');
    }
    return result;
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') throw new PickaxeError('The report took too long. Please try again.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
