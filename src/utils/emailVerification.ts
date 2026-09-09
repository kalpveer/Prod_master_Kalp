/** Shared email rules for idea validation — no OTP / no outbound mail. */

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** High-churn disposable / temporary inbox domains. */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  '10minutemail.com',
  '10minutemail.net',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'trashmail.me',
  'getnada.com',
  'nada.email',
  'dispostable.com',
  'maildrop.cc',
  'fakeinbox.com',
  'mailnesia.com',
  'mintemail.com',
  'moakt.com',
  'tempail.com',
  'discard.email',
  'discardmail.com',
  'mailcatch.com',
  'mytemp.email',
  'tmpmail.org',
  'tmpmail.net',
  'emailondeck.com',
  'spamgourmet.com',
]);

export type EmailVerifyResult = {
  ok: boolean;
  reason?: string;
  email?: string;
  domain?: string;
};

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function getEmailDomain(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 1 || at === email.length - 1) return null;
  return email.slice(at + 1);
}

export function validateEmailBasics(raw: string): EmailVerifyResult {
  const email = normalizeEmail(raw);
  if (!email) {
    return { ok: false, reason: 'Enter your work email to continue.' };
  }
  if (!EMAIL_RE.test(email) || email.includes('..')) {
    return { ok: false, reason: 'That doesn’t look like a valid email address.' };
  }

  const domain = getEmailDomain(email);
  if (!domain || !domain.includes('.')) {
    return { ok: false, reason: 'That doesn’t look like a valid email address.' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: 'Temporary or disposable emails aren’t accepted. Use a real email address.',
      email,
      domain,
    };
  }

  return { ok: true, email, domain };
}

/** Browser-friendly MX check via Cloudflare DNS-over-HTTPS (no mail sent). */
export async function checkMxRecordsDoH(domain: string): Promise<boolean> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`;
  const res = await fetch(url, {
    headers: { Accept: 'application/dns-json' },
  });
  if (!res.ok) {
    // Network / DoH outage — don’t hard-block; format + domain rules already passed.
    return true;
  }
  const data = (await res.json()) as { Status?: number; Answer?: { type: number; data: string }[] };
  // Status 0 = NOERROR
  if (data.Status !== 0) return false;
  const answers = data.Answer ?? [];
  return answers.some((a) => a.type === 15 && typeof a.data === 'string' && a.data.trim().length > 0);
}

export async function verifyWorkEmailClient(raw: string): Promise<EmailVerifyResult> {
  const basics = validateEmailBasics(raw);
  if (!basics.ok || !basics.domain || !basics.email) return basics;

  try {
    const hasMx = await checkMxRecordsDoH(basics.domain);
    if (!hasMx) {
      return {
        ok: false,
        reason: 'We couldn’t verify that email domain. Check for a typo or try another email.',
        email: basics.email,
        domain: basics.domain,
      };
    }
  } catch {
    // Soft-pass on DNS failure after basics succeeded
  }

  return { ok: true, email: basics.email, domain: basics.domain };
}
