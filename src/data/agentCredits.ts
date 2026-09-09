import { CREDIT_FX_NOTE, formatUsd, formatInrPrimary, formatUsdPrimary } from './dashboardCreditPacks';

export type AgentId = 'co-founder' | 'marketing' | 'ultraplan';

export const AGENT_DISPLAY_NAMES: Record<AgentId, string> = {
  'co-founder': 'Co-Founder',
  marketing: 'Marketing',
  ultraplan: 'UltraPlanner',
};

export const ULTRAPLANNER_PRICE = 6.99;
/** Indicative INR for UltraPlanner fee (≈ ₹90–100 / USD). */
export const ULTRAPLANNER_INR_RANGE = '₹600–700';

/** Same FX disclaimer as dashboard packs. */
export const AGENT_CREDIT_FX_NOTE = CREDIT_FX_NOTE;
export { CREDIT_FX_NOTE, formatUsd, formatInrPrimary, formatUsdPrimary };

/** UltraPlanner stays USD-primary with INR reference. */
export function formatUltraPlannerFee() {
  return formatUsdPrimary(ULTRAPLANNER_PRICE, ULTRAPLANNER_INR_RANGE);
}

/** Indicative INR ranges (≈ ₹90–100 / USD). Final INR charged at purchase FX rate. */
export const AGENT_CREDIT_PACKS = [
  {
    id: 'starter',
    name: 'Starter Bundle',
    credits: 10,
    usdPrice: 6.99,
    usdWas: 12.99,
    inrRange: '₹600–700',
    inrWasRange: '₹1,150–1,300',
  },
  {
    id: 'growth',
    name: 'Growth Bundle',
    credits: 25,
    usdPrice: 18.99,
    usdWas: 35.99,
    inrRange: '₹1,700–1,900',
    inrWasRange: '₹3,200–3,600',
  },
  {
    id: 'pro',
    name: 'Pro Bundle',
    credits: 50,
    usdPrice: 32.99,
    usdWas: 64.99,
    inrRange: '₹3,000–3,300',
    inrWasRange: '₹5,850–6,500',
  },
] as const;

export const AGENTS_BUY_CREDITS_URL = 'https://agents.productica.in/#buy-credits';

export const AGENT_USE_CASES = [
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    description: 'Explore ideas, angles, and opportunities with structured thinking.',
    minCredits: 20,
    maxCredits: 25,
    agentId: 'co-founder' as AgentId,
  },
  {
    id: 'marketing-plan',
    name: 'Marketing Plan',
    description: 'Design a campaign plan, messaging, and channel strategy.',
    minCredits: 15,
    maxCredits: 20,
    agentId: 'marketing' as AgentId,
  },
  {
    id: 'product-refinement',
    name: 'Product Refinement',
    description: 'Tighten scope, features, and product decisions with critique.',
    minCredits: 25,
    maxCredits: 30,
    agentId: 'co-founder' as AgentId,
  },
  {
    id: 'product-feedback',
    name: 'Product Feedback',
    description: 'Get sharp feedback on UX, value prop, and product clarity.',
    minCredits: 15,
    maxCredits: 20,
    agentId: 'co-founder' as AgentId,
  },
  {
    id: 'pitch-readiness',
    name: 'Pitch Readiness',
    description: 'Prepare narrative, deck flow, and investor-ready answers.',
    minCredits: 30,
    maxCredits: 45,
    agentId: 'co-founder' as AgentId,
  },
  {
    id: 'compliance-readiness',
    name: 'Company Compliance Readiness',
    description: 'Assess operational and compliance readiness for scale.',
    minCredits: 25,
    maxCredits: 30,
    agentId: 'ultraplan' as AgentId,
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Create SOPs, internal docs, and founder-ready documentation.',
    minCredits: 20,
    maxCredits: 30,
    agentId: 'ultraplan' as AgentId,
  },
  {
    id: 'startup-planning',
    name: 'Startup Planning',
    description: 'Build structured plans, milestones, and execution checklists.',
    minCredits: 25,
    maxCredits: 35,
    agentId: 'ultraplan' as AgentId,
  },
] as const;

export type AgentUseCaseId = (typeof AGENT_USE_CASES)[number]['id'];

export type CustomGoalEstimate = {
  minCredits: number;
  maxCredits: number;
  agentId: AgentId;
  matchedUseCase: string | null;
};

/** Heuristic credit estimate for a free-form custom goal. */
export function estimateCustomGoalCredits(goal: string): CustomGoalEstimate | null {
  const text = goal.trim().toLowerCase();
  if (!text) return null;

  // Co-Founder / Marketing first so phrases like "marketing plan" don't hit UltraPlanner
  const keywordMap: { keywords: string[]; useCaseId: AgentUseCaseId }[] = [
    { keywords: ['brainstorm', 'ideat', 'explore idea', 'think through'], useCaseId: 'brainstorming' },
    { keywords: ['marketing', 'campaign', 'gtm', 'growth', 'content', 'ads', 'positioning', 'brand'], useCaseId: 'marketing-plan' },
    { keywords: ['refin', 'feature', 'scope', 'product direction'], useCaseId: 'product-refinement' },
    { keywords: ['feedback', 'review my product', 'ux', 'critique'], useCaseId: 'product-feedback' },
    { keywords: ['pitch', 'investor', 'deck', 'fundraising', 'raise'], useCaseId: 'pitch-readiness' },
  ];

  for (const entry of keywordMap) {
    if (entry.keywords.some((k) => text.includes(k))) {
      const useCase = AGENT_USE_CASES.find((u) => u.id === entry.useCaseId)!;
      return {
        minCredits: useCase.minCredits,
        maxCredits: useCase.maxCredits,
        agentId: useCase.agentId,
        matchedUseCase: useCase.name,
      };
    }
  }

  // UltraPlanner owns compliance, documentation, and startup planning
  if (
    text.includes('document') ||
    text.includes('sop') ||
    text.includes('handbook') ||
    text.includes('wiki')
  ) {
    const useCase = AGENT_USE_CASES.find((u) => u.id === 'documentation')!;
    return {
      minCredits: useCase.minCredits,
      maxCredits: useCase.maxCredits,
      agentId: 'ultraplan',
      matchedUseCase: useCase.name,
    };
  }
  if (
    text.includes('compliance') ||
    text.includes('legal') ||
    text.includes('regulation') ||
    text.includes('policy')
  ) {
    const useCase = AGENT_USE_CASES.find((u) => u.id === 'compliance-readiness')!;
    return {
      minCredits: useCase.minCredits,
      maxCredits: useCase.maxCredits,
      agentId: 'ultraplan',
      matchedUseCase: useCase.name,
    };
  }
  if (
    text.includes('startup plan') ||
    text.includes('business plan') ||
    text.includes('execution plan') ||
    text.includes('checklist') ||
    text.includes('milestone') ||
    text.includes('planning') ||
    (text.includes('ops') && text.includes('process'))
  ) {
    const useCase = AGENT_USE_CASES.find((u) => u.id === 'startup-planning')!;
    return {
      minCredits: useCase.minCredits,
      maxCredits: useCase.maxCredits,
      agentId: 'ultraplan',
      matchedUseCase: useCase.name,
    };
  }

  // Fallback: juggle between Co-Founder and Marketing by signal strength
  const marketingHints = ['audience', 'channel', 'launch', 'acquisition', 'retention', 'seo', 'social'];
  const agentId: AgentId = marketingHints.some((k) => text.includes(k)) ? 'marketing' : 'co-founder';
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words <= 8) {
    return { minCredits: 15, maxCredits: 20, agentId, matchedUseCase: null };
  }
  if (words <= 20) {
    return { minCredits: 20, maxCredits: 30, agentId, matchedUseCase: null };
  }
  return { minCredits: 30, maxCredits: 45, agentId, matchedUseCase: null };
}
