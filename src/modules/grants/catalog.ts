import { STAGES } from '../idea/types';

export const GRANT_SECTORS = [
  'Software',
  'AI / deep tech',
  'Hardware',
  'Climate / energy',
  'Health / biotech',
  'Agriculture',
  'Education',
  'Consumer',
  'Social impact',
  'Other',
] as const;

export const GRANT_STATES = [
  'Gujarat',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Delhi',
  'Telangana',
  'Another Indian state',
  'Outside India',
] as const;

export const GRANT_APPLICANTS = [
  { id: 'unregistered', label: 'Not registered yet' },
  { id: 'startup', label: 'Registered startup' },
  { id: 'student', label: 'Student founder' },
  { id: 'researcher', label: 'Researcher or faculty' },
  { id: 'msme', label: 'Existing MSME' },
] as const;

export type GrantSector = (typeof GRANT_SECTORS)[number];
export type GrantState = (typeof GRANT_STATES)[number];
export type GrantApplicant = (typeof GRANT_APPLICANTS)[number]['id'];

export interface GrantInput {
  stage: string;
  sector: GrantSector | '';
  state: GrantState | '';
  applicant: GrantApplicant | '';
  venture: string;
}

export interface Scheme {
  id: string;
  name: string;
  provider: string;
  summary: string;
  href: string;
  /** Cash grant versus a step you usually need before one. */
  kind: 'grant' | 'step';
  indiaOnly?: boolean;
  states?: readonly string[];
  sectors?: readonly string[];
  applicants?: readonly string[];
  /** Stages that are a strong fit. Others can still show as "not yet". */
  stages?: readonly string[];
}

const EARLY = ['Just an idea', 'Researching & validating', 'Building a prototype', 'Early users'] as const;
const WITH_PROOF = ['Researching & validating', 'Building a prototype', 'Early users', 'Generating revenue'] as const;

export const SCHEMES: Scheme[] = [
  {
    id: 'sisfs',
    name: 'Startup India Seed Fund Scheme',
    provider: 'Startup India / DPIIT',
    summary: 'Seed support for proof of concept, prototype, and early trials. Applications usually go through an approved incubator.',
    href: 'https://seedfund.startupindia.gov.in/',
    kind: 'grant',
    indiaOnly: true,
    applicants: ['startup'],
    stages: WITH_PROOF,
  },
  {
    id: 'prayas',
    name: 'NIDHI-PRAYAS',
    provider: 'Department of Science & Technology',
    summary: 'Prototype support for converting a concept into a working version, typically through a PRAYAS centre.',
    href: 'https://www.nstedb.com/',
    kind: 'grant',
    indiaOnly: true,
    sectors: ['AI / deep tech', 'Hardware', 'Climate / energy', 'Health / biotech', 'Agriculture'],
    stages: ['Just an idea', 'Researching & validating', 'Building a prototype'],
  },
  {
    id: 'big',
    name: 'Biotechnology Ignition Grant',
    provider: 'BIRAC',
    summary: 'Early grant for biotech and health ideas. Individuals and young companies can both be eligible.',
    href: 'https://birac.nic.in/big.php',
    kind: 'grant',
    indiaOnly: true,
    sectors: ['Health / biotech'],
    stages: EARLY,
  },
  {
    id: 'msme',
    name: 'MSME Innovative',
    provider: 'Ministry of MSME',
    summary: 'Incubation and design support for ideas that can become a small business, including a working prototype.',
    href: 'https://innovative.msme.gov.in/',
    kind: 'grant',
    indiaOnly: true,
    applicants: ['startup', 'msme', 'unregistered'],
    stages: WITH_PROOF,
  },
  {
    id: 'aim',
    name: 'Atal Innovation Mission',
    provider: 'NITI Aayog',
    summary: 'Incubator-led support for early ventures. The right programme depends on the incubator you apply with.',
    href: 'https://aim.gov.in/',
    kind: 'grant',
    indiaOnly: true,
    stages: EARLY,
  },
  {
    id: 'meity',
    name: 'MeitY Startup Hub',
    provider: 'Ministry of Electronics & IT',
    summary: 'Programmes for software, AI, and other digital startups, often routed through a MeitY incubator.',
    href: 'https://msh.meity.gov.in/',
    kind: 'grant',
    indiaOnly: true,
    sectors: ['Software', 'AI / deep tech', 'Education'],
    stages: WITH_PROOF,
  },
  {
    id: 'ssip',
    name: 'Student Startup and Innovation Policy',
    provider: 'Government of Gujarat',
    summary: 'Support for student and campus innovators in Gujarat, from an early idea through a prototype.',
    href: 'https://ssip.gujarat.gov.in/',
    kind: 'grant',
    states: ['Gujarat'],
    applicants: ['student', 'researcher', 'unregistered'],
    stages: EARLY,
  },
  {
    id: 'dpiit',
    name: 'DPIIT startup recognition',
    provider: 'Startup India',
    summary: 'Not a cheque. Recognition is what several Indian seed grants ask for before you can apply.',
    href: 'https://www.startupindia.gov.in/',
    kind: 'step',
    indiaOnly: true,
    applicants: ['unregistered', 'startup'],
  },
];

export interface GrantMatch {
  scheme: Pick<Scheme, 'id' | 'name' | 'provider' | 'summary' | 'href' | 'kind'>;
  status: 'ready' | 'later';
  why: string;
}

const labelOf = (id: string) => GRANT_APPLICANTS.find(a => a.id === id)?.label ?? id;

export function matchGrants(input: GrantInput): GrantMatch[] {
  const inIndia = input.state !== 'Outside India';
  return SCHEMES.flatMap(scheme => {
    if (scheme.indiaOnly && !inIndia) return [];
    if (scheme.states && !scheme.states.includes(input.state)) return [];
    if (scheme.sectors && !scheme.sectors.includes(input.sector)) return [];

    const stageOk = !scheme.stages || scheme.stages.includes(input.stage);
    const applicantOk = !scheme.applicants || scheme.applicants.includes(input.applicant);
    const ready = stageOk && applicantOk;

    const why = !applicantOk
      ? `This one is aimed at ${scheme.applicants!.map(labelOf).join(', ')}. You selected ${labelOf(input.applicant)}.`
      : !stageOk
        ? `A stronger fit once you are past “${input.stage}”. It is aimed at ventures that already have something to show.`
        : scheme.kind === 'step'
          ? 'Worth doing if you want to unlock the grants that ask for recognition first.'
          : `Fits what you entered: ${input.sector.toLowerCase()} · ${input.state} · ${input.stage.toLowerCase()}.`;

    return [{ scheme, status: ready ? 'ready' : 'later', why }];
  });
}

export const STAGE_OPTIONS = STAGES.map(s => s.label);
