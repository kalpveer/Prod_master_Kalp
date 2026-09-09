/* eslint-disable */
import dns from 'node:dns/promises';

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
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

function normalizeEmail(raw: string) {
  return String(raw || '').trim().toLowerCase();
}

async function domainHasMx(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    // ENOTFOUND / ENODATA → no MX
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, reason: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const email = normalizeEmail(req.body?.email);
  if (!email || !EMAIL_RE.test(email) || email.includes('..')) {
    return res.status(200).json({
      ok: false,
      reason: 'That doesn’t look like a valid email address.',
    });
  }

  const domain = email.split('@')[1];
  if (!domain || !domain.includes('.')) {
    return res.status(200).json({
      ok: false,
      reason: 'That doesn’t look like a valid email address.',
    });
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return res.status(200).json({
      ok: false,
      reason: 'Temporary or disposable emails aren’t accepted. Use a real email address.',
      email,
      domain,
    });
  }

  const hasMx = await domainHasMx(domain);
  if (!hasMx) {
    return res.status(200).json({
      ok: false,
      reason: 'We couldn’t verify that email domain. Check for a typo or try another email.',
      email,
      domain,
    });
  }

  return res.status(200).json({ ok: true, email, domain });
}
