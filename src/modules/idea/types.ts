export interface IdeaAnswers {
  idea: string;
  audience: string;
  different: string;
  stage: string;
}

export type ReportStatus = 'running' | 'done' | 'failed';

/** Row shape used by the history list (never includes the markdown). */
export interface IdeaReportSummary {
  id: string;
  created_at: string;
  status: ReportStatus;
  title: string | null;
  verdict: string | null;
  iq: number | null;
  stage: string;
  idea: string;
  deck_name: string | null;
  error: string | null;
}

export interface IdeaReport extends IdeaReportSummary {
  audience: string;
  different: string;
  deck_path: string | null;
  markdown: string | null;
}

export const STAGES = [
  { label: 'Just an idea', hint: 'Nothing built yet' },
  { label: 'Researching & validating', hint: 'Talking to people, testing demand' },
  { label: 'Building a prototype', hint: 'Making a first version' },
  { label: 'Early users', hint: 'A few people are using it' },
  { label: 'Generating revenue', hint: 'Customers are paying' },
] as const;

/** Free validations saved on the account. Keep in sync with FREE_LIMIT in api/idea/generate.ts. */
export const FREE_IDEA_LIMIT = 3;

// Must match the server (api/idea/generate.ts) and the storage bucket limits.
export const DECK_MAX_BYTES = 10 * 1024 * 1024;
/** A run that has been "running" longer than this is treated as dead (the server uses the same cutoff). */
export const STALE_RUN_MS = 7 * 60 * 1000;
