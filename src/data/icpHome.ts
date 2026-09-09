import type { AudienceSegment } from './audienceData';

export type HomeIcpId = AudienceSegment;

export interface HomeIcpContent {
  id: HomeIcpId;
  label: string;
  /** Short reality line — buyer-specific, not shared boilerplate */
  reality: string;
  /** Exactly three concrete outcomes */
  outcomes: [string, string, string];
  /** Primary CTA label */
  cta: string;
  /** In-page target for CTA */
  ctaHref: string;
  /** Pricing mode on homepage */
  pricingMode: 'credits' | 'partnership';
}

/** Tight homepage cut only — not a dump of the full ICP pages. */
export const HOME_ICP_CONTENT: HomeIcpContent[] = [
  {
    id: 'founders',
    label: 'Founder',
    reality:
      'Most startups fail because they build something nobody wants — not because they cannot ship.',
    outcomes: [
      'Validate the idea before you burn months of build time',
      'Clarify ICP, competition, and GTM with structured reports',
      'Walk into investor conversations with evidence, not vibes',
    ],
    cta: 'Validate my idea',
    ctaHref: '#free-validation',
    pricingMode: 'credits',
  },
  {
    id: 'incubators',
    label: 'Incubator',
    reality:
      'Mentors repeat the same strategic basics while cohorts stay unevenly validated.',
    outcomes: [
      'Standardize idea validation across every startup in a cohort',
      'Free mentors to coach decisions instead of explaining frameworks',
      'See portfolio readiness with shared, comparable reports',
    ],
    cta: 'Partner / talk about a cohort',
    ctaHref: '#contact',
    pricingMode: 'partnership',
  },
  {
    id: 'investors',
    label: 'Investor',
    reality:
      'Early decks hide weak markets, inflated TAM, and thin diligence.',
    outcomes: [
      'Independently pressure-test founder market claims',
      'Surface competitive and PMF risk before the term sheet',
      'Keep a structured trail alongside the founder narrative',
    ],
    cta: 'Diligence / talk',
    ctaHref: '#contact',
    pricingMode: 'partnership',
  },
  {
    id: 'universities',
    label: 'University',
    reality:
      'Campuses produce ideas and research; only a fraction become ventures.',
    outcomes: [
      'Give student founders a shared validation workflow before incubation',
      'Help faculty map commercialization paths with market evidence',
      'Measure entrepreneurship outcomes across programs — not anecdotes',
    ],
    cta: 'Bring Productica to campus',
    ctaHref: '#contact',
    pricingMode: 'partnership',
  },
  {
    id: 'researchers',
    label: 'Researcher',
    reality:
      'Strong research often stalls because market demand and commercialization paths are unclear.',
    outcomes: [
      'Test whether the research solves a real industry problem',
      'Map industries and licensing or venture paths with evidence',
      'Decide publish / license / spinout with a concrete next step',
    ],
    cta: 'Commercialize my research',
    ctaHref: '#free-validation',
    pricingMode: 'credits',
  },
];

export const HOME_ICP_BY_ID = Object.fromEntries(
  HOME_ICP_CONTENT.map((item) => [item.id, item])
) as Record<HomeIcpId, HomeIcpContent>;

export const HOME_ICP_HASHES = HOME_ICP_CONTENT.map((item) => item.id);
