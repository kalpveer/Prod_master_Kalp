/* eslint-disable */
// Parses the Pickaxe "Productica Idea Validation Report" markdown into the
// data model consumed by buildReportHtml. Every section is parsed in isolation
// so a malformed section degrades to a missing block instead of a blank report.

export interface ParsedIdeaReport {
  data: Record<string, any>;
  warnings: string[];
}

type Table = { head: string[]; rows: string[][] };

const strip = (s: string) =>
  String(s ?? '')
    .replace(/\*\*/g, '')
    .replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,;:]|$)/g, '$1$2')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const num = (s: string, d = 0) => {
  const m = String(s ?? '').match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : d;
};

function splitSections(md: string) {
  const out: Record<string, string> = {};
  const re = /^##\s+(\d+)\.\s*(.*)$/gm;
  const marks: { n: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) marks.push({ n: m[1], start: m.index + m[0].length, end: m.index });
  marks.forEach((k, i) => {
    out[k.n] = md.slice(k.start, i + 1 < marks.length ? marks[i + 1].end : md.length);
  });
  return out;
}

function parseTables(text: string): Table[] {
  const tables: Table[] = [];
  const lines = text.split('\n');
  let cur: string[][] = [];
  const flush = () => {
    if (cur.length >= 2) {
      const [head, , ...rows] = cur;
      tables.push({ head: head.map(strip), rows: rows.map(r => r.map(strip)) });
    }
    cur = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('|')) {
      const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      cur.push(cells);
    } else flush();
  }
  flush();
  return tables;
}

const after = (text: string, marker: string | RegExp) => {
  const i = typeof marker === 'string' ? text.indexOf(marker) : text.search(marker);
  return i < 0 ? '' : text.slice(i);
};

const between = (text: string, a: string | RegExp, b?: string | RegExp) => {
  const s = after(text, a);
  if (!s || !b) return s;
  const rest = s.slice(1);
  const j = typeof b === 'string' ? rest.indexOf(b) : rest.search(b);
  return j < 0 ? s : s.slice(0, j + 1);
};

const kv = (text: string, label: string) => {
  const m = text.match(new RegExp(`\\*\\*${label}:?\\*\\*:?\\s*(.+)`, 'i'));
  return m ? strip(m[1]) : '';
};

const bullets = (text: string) => {
  const out: [string, string][] = [];
  const re = /^\s*[-*]\s+\*\*(.+?):?\*\*:?\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push([strip(m[1]).replace(/:$/, ''), strip(m[2])]);
  return out;
};

const numbered = (text: string) =>
  [...text.matchAll(/^\s*\d+\.\s+(.+)$/gm)].map(m => strip(m[1]));

const tick = (s: string) => (s.includes('✓') ? 2 : s.includes('◐') ? 1 : 0);

type Part =
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'bullets'; items: [string, string][] }
  | { type: 'text'; text: string };
interface Block { heading: string; level: number; parts: Part[] }

function toParts(lines: string[]): Part[] {
  const parts: Part[] = [];
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) { i++; continue; }
    if (t.startsWith('|')) {
      const run: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) run.push(lines[i++]);
      const tb = parseTables(run.join('\n'))[0];
      if (tb) parts.push({ type: 'table', head: tb.head, rows: tb.rows });
    } else if (/^[-*]\s+/.test(t)) {
      const items: [string, string][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const line = lines[i++].trim().replace(/^[-*]\s+/, '');
        const m = line.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
        items.push(m ? [strip(m[1]).replace(/:$/, ''), strip(m[2])] : ['', strip(line)]);
      }
      parts.push({ type: 'bullets', items });
    } else {
      // keep inline **bold** / *italic* so the renderer can format labels such as "**Dependency:** ..."
      parts.push({ type: 'text', text: t.replace(/\s+/g, ' ') });
      i++;
    }
  }
  return parts;
}

// Splits a section into its ordered blocks (### headings, bold-only heading lines, and the
// "**Breakpoint:** ..." / "**Condition to prove:** ..." label lines). Nothing is discarded.
function parseBlocks(section: string): Block[] {
  const blocks: Block[] = [];
  let cur: Block = { heading: '', level: 2, parts: [] };
  let buf: string[] = [];
  const close = () => {
    cur.parts.push(...toParts(buf));
    buf = [];
    if (cur.heading || cur.parts.length) blocks.push(cur);
  };
  for (const raw of section.split('\n')) {
    const line = raw.trim();
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^###\s+(.+)$/))) {
      close();
      cur = { heading: strip(m[1]), level: 3, parts: [] };
    } else if ((m = line.match(/^\*\*([^*]+?):?\*\*:?\s*$/))) {
      close();
      cur = { heading: strip(m[1]).replace(/:$/, ''), level: 4, parts: [] };
    } else if ((m = line.match(/^\*\*(Breakpoint|Condition to prove):\*\*\s*(.*)$/i))) {
      close();
      cur = { heading: m[1], level: 4, parts: [] };
      if (m[2]) buf.push(m[2]);
    } else buf.push(raw);
  }
  close();
  return blocks;
}

export function parseIdeaReport(md: string): ParsedIdeaReport {
  const warnings: string[] = [];
  const D: Record<string, any> = {};
  const text = String(md || '').replace(/\r/g, '');
  const S = splitSections(text);

  const safe = (label: string, fn: () => void) => {
    try {
      fn();
    } catch (e) {
      warnings.push(`${label}: ${(e as Error).message}`);
    }
  };

  D.name = strip((text.match(/^#\s+(.+)$/m) || [])[1] || 'Your idea');

  // 0. HEADLINE
  safe('headline', () => {
    const s = S['0'] || text.slice(0, 1500);
    const v = kv(s, 'Verdict');
    D.verdict = v ? v.replace(/\s+/g, ' ') : '';
    D.sub = kv(s, 'Summary');
    const today = num(kv(s, 'Syncoro IQ today'), NaN);
    const up = num(kv(s, 'Syncoro IQ upside[^:]*'), NaN);
    D.iq = { today: isNaN(today) ? null : today, upside: isNaN(up) ? null : up };
    D.proof = num((kv(s, 'Proof level').match(/E(\d)/) || [])[1], 0);
    D.proofLabel = kv(s, 'Proof level');
  });

  // 1. SYNCORO IQ TEST
  safe('iq', () => {
    const s = S['1'] || '';
    const weights: Record<string, number> = {};
    for (const m of s.matchAll(/([\d.]+)\s*[×x]\s*[\d.]+\s+(Innovation|Value|Market|Profitability|X-Factor)/g))
      weights[m[2]] = parseFloat(m[1]);
    const upLine = s.match(/Upside scores:\*\*\s*(.+)/i)?.[1] || '';
    const ups: Record<string, number> = {};
    for (const m of upLine.matchAll(/(Innovation|Value|Market|Profitability|X-Factor)\s+([\d.]+)/g)) ups[m[1]] = parseFloat(m[2]);
    const defaults: Record<string, number> = { Innovation: 0.15, Value: 0.25, Market: 0.2, Profitability: 0.2, 'X-Factor': 0.2 };
    const q: any[] = [];
    for (const m of s.matchAll(/###\s+(Innovation|Value|Market|Profitability|X-Factor)\s+Quotient\s*[—-]\s*([\d.]+)\s*\/\s*10([\s\S]*?)(?=###|\*\*Upside|$)/g)) {
      const name = m[1];
      const t = parseTables(m[3])[0];
      const up = ups[name] ?? parseFloat(m[2]);
      const factors = (t?.rows || []).map(r => [r[0], num(r[1]), up, r[2] || ''] as any[]);
      q.push([name, weights[name] ?? defaults[name], parseFloat(m[2]), up, factors]);
    }
    if (q.length) D.q = q;
    else warnings.push('iq: no quotient blocks found');
  });

  // 2. SHOULD YOU BUILD THIS
  safe('verdict', () => {
    const s = S['2'] || '';
    const failIdx = s.search(/Why it could fail/i);
    D.why = numbered(failIdx < 0 ? s : s.slice(0, failIdx));
    D.risk = failIdx < 0 ? [] : numbered(s.slice(failIdx));
  });

  // 3. THE IDEA, SHARPENED
  safe('clarity', () => {
    const s = S['3'] || '';
    const t = parseTables(s)[0];
    D.clar = (t?.rows || []).map(r => [r[0], r[1], r[2]]);
    D.pos = kv(s, 'Core strategic positioning').replace(/^["“]|["”]$/g, '');
    D.wedge = kv(s, 'Wedge principle');
  });

  // 4. THE PRODUCTICA LENS
  // Structure varies by venture (two-sided ventures add extra buyer lanes, an activation map, ...), so the
  // section is parsed into its ordered blocks and nothing is dropped. Known blocks get a designed layout
  // in the renderer; unknown ones render generically.
  safe('lens', () => {
    D.lens = { blocks: parseBlocks(S['4'] || '') };
  });

  // 5. WHO BUYS FIRST
  safe('segments', () => {
    const s = S['5'] || '';
    D.icp = kv(s, 'Ideal customer').replace(/\s*NO money figures\.?/i, '');
    const t = parseTables(s)[0];
    const rt = (r: string) => (/beachhead/i.test(r) ? 'g' : /avoid/i.test(r) ? 'b' : /later/i.test(r) ? 'u' : '');
    D.segTable = (t?.rows || []).map(r => ({ name: r[0], desc: r[1], pain: num(r[2]), pay: num(r[3]), reach: num(r[4]), role: r[5], roleType: rt(r[5] || '') }));
  });

  // 6. MARKET
  safe('market', () => {
    const s = S['6'] || '';
    const t = parseTables(s)[0];
    D.mkt = (t?.rows || []).map(r => [r[0], r[1], r[2], r[3]]);
    D.mktNote = kv(s, 'Reality check');
    D.mktCalc = kv(s, 'Calculation');
  });

  // 7. COMPETITION
  safe('competition', () => {
    const s = S['7'] || '';
    const tables = parseTables(s);
    const comp = tables[0];
    D.compLead = strip(s.split('\n').find(l => l.trim() && !l.trim().startsWith('|') && !l.startsWith('**')) || '');
    if (comp) {
      D.comp = {
        cols: comp.head.slice(2),
        rows: comp.rows.map(r => [r[0], r[1], r.slice(2).map(tick), /proposed|wedge/i.test(r[1] || '') ? 1 : 0]),
      };
    }
    const cac = parseTables(after(s, 'Cost to win one customer'))[0];
    D.cac = (cac?.rows || []).map(r => [r[0], r[1], num(r[2]), /direct paid/i.test(r[0]) ? 1 : 0]);
    const moat = parseTables(after(s, 'Your moat today'))[0];
    D.moat = (moat?.rows || []).map(r => [r[0], num(r[1]), `${r[2]} — ${r[3] || ''}`]);
    D.path = kv(s, 'The only defensible path');
  });

  // 8. LEAN CANVAS
  safe('leanCanvas', () => {
    const s = S['8'] || '';
    const map: Record<string, string> = {
      problem: 'problem', solution: 'solution', 'key metrics': 'metrics', 'unique value': 'uvp',
      'unfair advantage': 'unfair', channels: 'channels', customer: 'segments', costs: 'cost', revenue: 'revenue',
    };
    const c: any = {};
    for (const [k, v] of bullets(s)) if (map[k.toLowerCase()]) c[map[k.toLowerCase()]] = v;
    D.leanCanvas = c;
  });

  // 9. RISKS & PRE-MORTEM
  safe('risks', () => {
    const s = S['9'] || '';
    D.riskLead = strip((s.match(/^\*\*(Two|Three|One|The)[^\n]*\*\*\s*$/m) || [])[0] || '');
    const t = parseTables(s)[0];
    D.assume = (t?.rows || []).map(r => [r[1], r[2], r[3], r[4]]);
    D.stories = [...s.matchAll(/\*\*Story\s+\d+\s*[—-]\s*(.+?)\*\*\s*\n([\s\S]*?)\*\*Prevent:\*\*\s*([^\n]+)/g)].map(m => [strip(m[1]), strip(m[2]), strip(m[3])]);
  });

  // 10. READINESS
  safe('readiness', () => {
    const s = S['10'] || '';
    const t = parseTables(s)[0];
    D.readiness = {
      gates: (t?.rows || []).map(r => ({
        name: r[0], question: r[1], level: num(r[2]), band: strip(r[2].replace(/^\d+\s*\/\s*\d+/, '').replace(/[●○]/g, '')),
        raw: r[3], limited: r[4], unlock: r[5],
      })),
      calc: [...between(s, '**Calculation:**').matchAll(/^\s*-\s+(.+)$/gm)].map(m => strip(m[1])),
    };
  });

  // 11. FINAL SCORECARD
  safe('score', () => {
    const s = S['11'] || '';
    const t = parseTables(s)[0];
    D.score = (t?.rows || []).map(r => [r[0], num(r[1]), /competition/i.test(r[0]) ? 1 : 0]);
    const ov = (s.match(/\*\*Operator verdict:\*\*\s*(.+)/i) || [])[1] || '';
    D.final = strip(ov.replace(/^\*\*[^*]+\*\*\s*/, ''));
    D.acts = bullets(between(s, /^\s*-\s+\*\*Do:/m, '**Syncoro Soundboard'))
      .filter(([k]) => /^(do|don.t|consider)$/i.test(k))
      .map(([k, v]) => [k.replace('’', "'"), v, /^do$/i.test(k) ? 'good' : /^don/i.test(k) ? 'bad' : 'up']);
    const sb = kv(s, 'Syncoro Soundboard');
    D.soundboard = /^s*locked/i.test(sb) ? 'locked' : /^s*(eligible|unlocked|open)/i.test(sb) ? 'eligible' : '';
    D.unlockTarget = (sb.match(/Target to unlock:\s*(.+)$/i) || [])[1] || '';
  });

  const missing = ['q', 'why', 'clar', 'lens', 'segTable', 'mkt', 'comp', 'leanCanvas', 'assume', 'score'].filter(k => !D[k] || (Array.isArray(D[k]) && !D[k].length));
  if (missing.length) warnings.push(`missing: ${missing.join(', ')}`);
  return { data: D, warnings };
}
