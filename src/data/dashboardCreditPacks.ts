/** Shared FX disclaimer for credit pack INR brackets. */
export const CREDIT_FX_NOTE =
  'INR amounts are indicative. Final price is adjusted to the USD–INR rate of the day at purchase.';

export function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`;
}

/** INR range primary, USD secondary — e.g. ₹600–700 ($6.99) */
export function formatInrPrimary(inrRange: string, usd: number) {
  return `${inrRange} (${formatUsd(usd)})`;
}

/** USD primary, INR secondary — e.g. $6.99 (₹600–700) */
export function formatUsdPrimary(usd: number, inrRange: string) {
  return `${formatUsd(usd)} (${inrRange})`;
}

export const DASHBOARD_BILLING_URL = 'https://app.productica.in/billing';

/** Dashboard credit packs — USD list price with indicative INR (≈ ₹90–100 / USD). */
export const DASHBOARD_CREDIT_PACKS = [
  {
    id: 'occasional',
    credits: 100,
    description: 'Perfect for occasional use.',
    usdPrice: 10,
    inrRange: '₹900–1,000',
    popular: false,
    features: ['Never expire', 'Access to all modules'] as const,
  },
  {
    id: 'regular',
    credits: 500,
    description: 'Most popular for regular users.',
    usdPrice: 45,
    inrRange: '₹4,050–4,500',
    popular: true,
    features: ['Never expire', 'Access to all modules'] as const,
  },
  {
    id: 'heavy',
    credits: 2000,
    description: 'Best value for heavy workloads.',
    usdPrice: 150,
    inrRange: '₹13,500–15,000',
    popular: false,
    features: ['Never expire', 'Access to all modules'] as const,
  },
] as const;
