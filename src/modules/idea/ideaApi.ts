import { getSupabase } from '../../lib/supabase';
import { DECK_MAX_BYTES, type IdeaAnswers, type IdeaReport, type IdeaReportSummary } from './types';

const BUCKET = 'pitch-decks';
const SUMMARY_COLUMNS = 'id,created_at,status,title,verdict,iq,stage,idea,deck_name,error';

const DECK_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const extOf = (name: string) => (name.split('.').pop() || '').toLowerCase();

/** Returns a user-facing problem with the file, or null when it is acceptable. */
export function validateDeck(file: File): string | null {
  if (!DECK_TYPES[extOf(file.name)]) return 'Upload a PDF or PowerPoint (.pptx) file.';
  if (file.size > DECK_MAX_BYTES) return 'That file is over 10 MB. Export a smaller version and try again.';
  if (file.size === 0) return 'That file is empty.';
  return null;
}

export interface UploadedDeck {
  path: string;
  name: string;
}

// All reads/deletes go straight to Supabase and are protected by row-level security (own rows only).
// Writes happen on the server (api/idea/generate) so users cannot forge reports or skip the limits.
export const ideaApi = {
  async list(): Promise<IdeaReportSummary[]> {
    const { data, error } = await getSupabase()
      .from('idea_reports').select(SUMMARY_COLUMNS).order('created_at', { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as IdeaReportSummary[];
  },

  async get(id: string): Promise<IdeaReport | null> {
    const { data, error } = await getSupabase().from('idea_reports').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as IdeaReport | null) ?? null;
  },

  async remove(report: { id: string; deck_path?: string | null }): Promise<void> {
    const supabase = getSupabase();
    if (report.deck_path) await supabase.storage.from(BUCKET).remove([report.deck_path]); // best effort
    const { error } = await supabase.from('idea_reports').delete().eq('id', report.id);
    if (error) throw new Error(error.message);
  },

  async uploadDeck(file: File, userId: string): Promise<UploadedDeck> {
    const problem = validateDeck(file);
    if (problem) throw new Error(problem);
    const ext = extOf(file.name);
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await getSupabase().storage.from(BUCKET).upload(path, file, { contentType: DECK_TYPES[ext], upsert: false });
    if (error) throw new Error(`Could not upload your deck: ${error.message}`);
    return { path, name: file.name };
  },

  async discardDeck(path: string): Promise<void> {
    await getSupabase().storage.from(BUCKET).remove([path]);
  },

  /** Starts a report. Resolves as soon as the server has accepted it; generation continues in the background. */
  async generate(answers: IdeaAnswers, deck?: UploadedDeck | null): Promise<{ id: string }> {
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Your session has expired. Please sign in again.');

    const r = await fetch('/api/idea/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...answers, deckPath: deck?.path, deckName: deck?.name }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok || !json.id) throw new Error(json.error || 'Something went wrong starting your report.');
    return { id: json.id as string };
  },
};
