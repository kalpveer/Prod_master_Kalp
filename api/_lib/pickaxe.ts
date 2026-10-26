/* eslint-disable */
const PICKAXE_URL = process.env.PICKAXE_API_URL || 'https://api.pickaxe.co/v1/completions';
const DEFAULT_TIMEOUT_MS = 280_000;

export class PickaxeError extends Error {}

const safeJson = (s: string) => { try { return JSON.parse(s); } catch { return null; } };

/** The deployment id is the bearer token. Never call this from the browser. */
export async function completePickaxe(
  token: string | undefined,
  message: string,
  userId: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  if (!token) throw new PickaxeError('The report engine is not configured.');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
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
      console.error('[pickaxe] error', r.status, text.slice(0, 500));
      throw new PickaxeError('The report engine could not complete this run. Please try again.');
    }
    return json.result;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new PickaxeError('The report took too long. Please try again.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
