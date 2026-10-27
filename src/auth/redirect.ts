/** Always the page the user is on — production Vercel, not a hardcoded localhost Site URL. */
export function authRedirectTo() {
  const path = window.location.pathname || '/';
  return `${window.location.origin}${path}`;
}

export function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

export function validateUsername(raw: string) {
  const username = normalizeUsername(raw);
  if (!/^[a-z][a-z0-9_]{2,19}$/.test(username)) {
    return 'Username must be 3–20 characters, start with a letter, and use only letters, numbers, or _.';
  }
  return null;
}

export function validatePassword(raw: string) {
  if (raw.length < 8) return 'Password must be at least 8 characters.';
  if (raw.length > 72) return 'Password is too long.';
  if (!/[A-Za-z]/.test(raw) || !/\d/.test(raw)) return 'Password must include a letter and a number.';
  return null;
}

/** Saved on the profile only. A bare 10-digit number is treated as India (+91). */
export function normalizePhone(raw: string): string | null {
  let compact = raw.replace(/[^\d+]/g, '');
  if (!compact) return null;
  if (compact.startsWith('00')) compact = `+${compact.slice(2)}`;
  if (!compact.startsWith('+')) {
    if (/^0\d{10}$/.test(compact)) compact = `+91${compact.slice(1)}`;
    else if (/^\d{10}$/.test(compact)) compact = `+91${compact}`;
    else if (/^91\d{10}$/.test(compact)) compact = `+${compact}`;
    else compact = `+${compact}`;
  }
  return /^\+[1-9]\d{7,14}$/.test(compact) ? compact : null;
}

export function validatePhone(raw: string) {
  if (!raw.trim()) return 'Enter a phone number. It is saved on your account and is not used to sign in.';
  if (!normalizePhone(raw)) return 'Enter a valid phone number. Use a country code if it is not an Indian number.';
  return null;
}
