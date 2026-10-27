import { getSupabase } from '../../lib/supabase';
import type { GrantInput, GrantMatch, VentureAnswers } from './catalog';

export interface GrantRunSummary {
  id: string;
  created_at: string;
  venture: string;
  stage: string;
  sector: string;
  state: string;
  applicant: string;
  idea_report_id: string | null;
  ready_count: number;
  matches: GrantMatch[];
  report: string;
  /** Present when this match was started on Grants, before a validation existed. */
  profile: VentureAnswers | null;
}

const RUN_COLUMNS = 'id,created_at,venture,stage,sector,state,applicant,idea_report_id,ready_count,matches';

async function accessToken() {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Your session has expired. Please sign in again.');
  return token;
}

export const grantsApi = {
  async list(): Promise<GrantRunSummary[]> {
    const { data, error } = await getSupabase()
      .from('grant_runs')
      .select(RUN_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map(unpackRun);
  },

  async remove(id: string): Promise<void> {
    const { error } = await getSupabase().from('grant_runs').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async match(input: GrantInput, ideaReportId?: string | null): Promise<{ id: string; matches: GrantMatch[]; report: string }> {
    const token = await accessToken();
    const r = await fetch('/api/grants/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...input, ideaReportId: ideaReportId || undefined }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok || !json.id) throw new Error(json.error || 'Could not match grants for this venture.');
    return { id: json.id as string, matches: (json.matches ?? []) as GrantMatch[], report: String(json.report || '') };
  },
};

function asProfile(value: unknown): VentureAnswers | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const startupName = String(row.startupName || '');
  const idea = String(row.idea || '');
  if (!startupName && !idea) return null;
  return {
    startupName,
    idea,
    audience: String(row.audience || ''),
    different: String(row.different || ''),
  };
}

function unpackRun(row: Record<string, unknown>): GrantRunSummary {
  const raw = row.matches;
  if (Array.isArray(raw)) {
    return { ...(row as unknown as GrantRunSummary), matches: raw as GrantMatch[], report: '', profile: null };
  }
  const packed = raw && typeof raw === 'object' ? raw as { items?: GrantMatch[]; report?: string; profile?: unknown } : {};
  return {
    ...(row as unknown as GrantRunSummary),
    matches: packed.items ?? [],
    report: packed.report ?? '',
    profile: asProfile(packed.profile),
  };
}
