/* eslint-disable */
import type { SupabaseClient } from '@supabase/supabase-js';

export type QuotaModule = 'idea' | 'grants';

export interface Quota {
  used: number;
  limit: number;
}

export async function readQuota(admin: SupabaseClient, userId: string, module: QuotaModule): Promise<Quota> {
  const { data, error } = await admin
    .from('account_quotas')
    .select('used, free_limit')
    .eq('user_id', userId)
    .eq('module', module)
    .maybeSingle();

  if (!error && data) return { used: Number(data.used) || 0, limit: Number(data.free_limit) || 3 };

  if (!error && !data) {
    const { error: seedError } = await admin.rpc('ensure_account_quotas', { p_user_id: userId });
    if (!seedError) {
      const again = await admin
        .from('account_quotas')
        .select('used, free_limit')
        .eq('user_id', userId)
        .eq('module', module)
        .maybeSingle();
      if (!again.error && again.data) {
        return { used: Number(again.data.used) || 0, limit: Number(again.data.free_limit) || 3 };
      }
    }
  }

  if (module === 'idea') {
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    const { count } = await admin
      .from('idea_reports').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'done');
    const stored = Number(authUser.user?.app_metadata?.idea_validations_used ?? 0);
    return { used: Math.max(Number.isFinite(stored) ? stored : 0, count ?? 0), limit: 3 };
  }

  return { used: 0, limit: 25 };
}

export function isQuotaError(error: { message?: string; code?: string } | null | undefined): boolean {
  const text = `${error?.code || ''} ${error?.message || ''}`;
  return text.includes('IDEA_QUOTA_EXCEEDED') || text.includes('P0001');
}
