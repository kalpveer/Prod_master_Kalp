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
