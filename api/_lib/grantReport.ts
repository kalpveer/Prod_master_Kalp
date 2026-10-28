/** Plain-text cleanup for Pickaxe grant write-ups before markdown render. */
const URL_US = '\uE000';

export function prepareGrantReport(text: string): string {
  if (!text) return '';
  let s = text.trim();

  // Do not show embedded JSON blocks in the narrative.
  s = s.replace(/```(?:json)?[\s\S]*?```/gi, '').trim();

  s = normalizeLatex(s);

  // LLM underscore "emphasis" breaks react-markdown and eats words (e.g. _student founders_).
  s = s.replace(/https?:\/\/[^\s<>)]+/gi, url => url.replace(/_/g, URL_US));
  s = s.replace(/(?<!\\)_/g, '\\_');
  s = s.replaceAll(URL_US, '_');

  s = s
    .split('\n')
    .filter(line => {
      const t = line.trim();
      if (/^[-*+]\s*$/.test(t)) return false;
      if (/^[-*+]\s+/.test(t)) {
        const body = t.replace(/^[-*+]\s+/, '').replace(/\\_/g, '_').trim();
        if (!body || /^[\s_\\]*$/.test(body)) return false;
      }
      return true;
    })
    .join('\n');

  return s.replace(/\n{3,}/g, '\n\n').trim();
}

function normalizeLatex(s: string): string {
  return s
    .replace(/\$\\leq\$/g, '≤')
    .replace(/\$\\geq\$/g, '≥')
    .replace(/\$\\rightarrow\$/g, '→')
    .replace(/\$\s*\\leq\s*\$/g, '≤')
    .replace(/\$([^$\n]+)\$/g, (_, inner: string) =>
      inner
        .replace(/\\leq/g, '≤')
        .replace(/\\geq/g, '≥')
        .replace(/\\rightarrow/g, '→')
        .replace(/\\,/g, ',')
        .trim(),
    )
    .replace(/\\leq\b/g, '≤')
    .replace(/\\geq\b/g, '≥')
    .replace(/\\rightarrow\b/g, '→');
}
