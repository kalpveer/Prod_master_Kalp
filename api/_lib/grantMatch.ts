/* eslint-disable */
import { prepareGrantReport } from './grantReport.js';

export interface GrantInput {
  venture: string;
  stage: string;
  sector: string;
  state: string;
  applicant: string;
}

export interface GrantScheme {
  id: string;
  name: string;
  provider: string;
  summary: string;
  href: string;
  kind: 'grant' | 'step';
  india_only: boolean;
  states: string[] | null;
  sectors: string[] | null;
  applicants: string[] | null;
  stages: string[] | null;
}

export interface GrantMatch {
  scheme: {
    id: string;
    name: string;
    provider: string;
    summary: string;
    href: string;
    kind: 'grant' | 'step';
  };
  status: 'ready' | 'later';
  why: string;
}

const APPLICANT_LABEL: Record<string, string> = {
  unregistered: 'Not registered yet',
  startup: 'Registered startup',
  student: 'Student founder',
  researcher: 'Researcher or faculty',
  msme: 'Existing MSME',
};

const labelOf = (id: string) => APPLICANT_LABEL[id] || id;

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export function parseGrantResult(raw: string): { report: string; items: GrantMatch[] } {
  const report = raw.trim();
  const parsed = extractJson(report);
  const list = Array.isArray(parsed) ? parsed : parsed?.matches || parsed?.grants || parsed?.schemes || parsed?.items;
  if (!Array.isArray(list)) return { report: prepareGrantReport(report), items: [] };
  const narrative = typeof parsed?.report === 'string' ? parsed.report : report;
  return { report: prepareGrantReport(narrative), items: list.flatMap(normalizeMatch) };
}

function extractJson(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch { /* keep looking */ }
  }
  const start = text.indexOf('{') === -1 ? text.indexOf('[') : Math.min(...[text.indexOf('{'), text.indexOf('[')].filter(i => i >= 0));
  if (start < 0) return null;
  for (const end of [text.lastIndexOf('}'), text.lastIndexOf(']')].filter(i => i > start)) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch { /* try the other end */ }
  }
  return null;
}

function normalizeMatch(row: any): GrantMatch[] {
  if (!row || typeof row !== 'object') return [];
  const name = String(row.name || row.scheme || row.title || row.scheme_name || '').trim();
  if (!name) return [];
  const status = String(row.status || row.fit || '').toLowerCase();
  const later = status === 'later' || status === 'not yet' || status === 'weak' || row.ready === false;
  return [{
    scheme: {
      id: String(row.id || slug(name) || crypto.randomUUID()),
      name,
      provider: String(row.provider || row.agency || row.ministry || '').trim() || 'Public scheme',
      summary: String(row.summary || row.description || row.about || '').trim(),
      href: String(row.href || row.url || row.link || '').trim() || 'https://www.startupindia.gov.in/',
      kind: String(row.kind || '').toLowerCase() === 'step' ? 'step' : 'grant',
    },
    status: later ? 'later' : 'ready',
    why: String(row.why || row.reason || row.rationale || '').trim(),
  }];
}

export function matchSchemes(input: GrantInput, schemes: GrantScheme[]): GrantMatch[] {
  const inIndia = input.state !== 'Outside India';
  return schemes.flatMap(scheme => {
    if (scheme.india_only && !inIndia) return [];
    if (scheme.states?.length && !scheme.states.includes(input.state)) return [];
    if (scheme.sectors?.length && !scheme.sectors.includes(input.sector)) return [];

    const stageOk = !scheme.stages?.length || scheme.stages.includes(input.stage);
    const applicantOk = !scheme.applicants?.length || scheme.applicants.includes(input.applicant);
    const ready = stageOk && applicantOk;

    const why = !applicantOk
      ? `This one is aimed at ${scheme.applicants!.map(labelOf).join(', ')}. You selected ${labelOf(input.applicant)}.`
      : !stageOk
        ? `A stronger fit once you are past “${input.stage}”. It is aimed at ventures that already have something to show.`
        : scheme.kind === 'step'
          ? 'Worth doing if you want to unlock the grants that ask for recognition first.'
          : `Fits what you entered: ${input.sector.toLowerCase()} · ${input.state} · ${input.stage.toLowerCase()}.`;

    return [{
      scheme: {
        id: scheme.id,
        name: scheme.name,
        provider: scheme.provider,
        summary: scheme.summary,
        href: scheme.href,
        kind: scheme.kind,
      },
      status: ready ? 'ready' : 'later',
      why,
    }];
  });
}
