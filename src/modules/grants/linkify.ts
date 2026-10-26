/** Turn bare URLs into markdown links so apply pages are clickable. */
export function linkifyMarkdown(text: string): string {
  if (!text) return '';
  return text.replace(/(https?:\/\/[^\s<>")]+)|(\[[^\]]+\]\([^)]+\))/g, (all, url?: string) => {
    if (!url) return all;
    const href = url.replace(/[.,;:)]+$/, '');
    try {
      const host = new URL(href).hostname.replace(/^www\./, '');
      return `[${host}](${href})`;
    } catch {
      return `[Open link](${href})`;
    }
  });
}

export function extractApplyLinks(text: string): { href: string; label: string }[] {
  if (!text) return [];
  const seen = new Set<string>();
  const out: { href: string; label: string }[] = [];
  const re = /https?:\/\/[^\s<>")]+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const href = match[0].replace(/[.,;:)]+$/, '');
    if (seen.has(href) || !href.startsWith('http')) continue;
    seen.add(href);
    try {
      out.push({ href, label: new URL(href).hostname.replace(/^www\./, '') });
    } catch {
      out.push({ href, label: 'Open link' });
    }
  }
  return out;
}

export function isHttpUrl(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}
