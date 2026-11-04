import { invokeFunction } from '../../lib/invokeFunction';
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
    const json = await invokeFunction<{ id?: string; matches?: GrantMatch[]; report?: string }>('grants-match', {
      ...input,
      ideaReportId: ideaReportId || undefined,
    });
    if (!json.id) throw new Error('Could not match grants for this venture.');
    return { id: json.id, matches: json.matches ?? [], report: String(json.report || '') };
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
