/* eslint-disable */
// @ts-nocheck
// Port of the Productica / Syncoro "Idea Validation Report" template.
// Pure string rendering: parsed report data in -> standalone HTML document out.
// The document is shown in an isolated iframe (see ReportFrame) so the template
// looks identical regardless of the site's Tailwind/global styles.
import reportCss from './report.css?raw';

const E = s => (s == null || s === '' ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
const esc = o => (typeof o == 'string' ? E(o) : Array.isArray(o) ? o.map(esc) : o && typeof o == 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, esc(v)])) : o);

const HELP = {
  iq: 'Our overall score for the idea, out of 10. We rate five areas and weight them into one number. Below 6.5 means: test more before you build.',
  verdict: 'The short version: the strongest reasons this could succeed, and the biggest reasons it could fail.',
  clarity: 'We took your original idea and narrowed it to the version most likely to work: one clear customer, one clear problem.',
  lens: 'Maps how the idea creates value and where it meets a real buyer: the venture signature, the buyer path, fit signals, the claim that matters most and the next test.',
  segments: 'Not everyone is your first customer. This ranks groups by how much the problem hurts them, whether they will pay, and how easy they are to reach.',
  market: 'TAM is everyone who could ever use it. SAM is the part you can realistically serve. SOM is the slice you can actually win first.',
  competition: 'Who already solves this problem, what they do well, and where they leave a gap you can fill.',
  'lean-canvas': 'Your whole business on one page: the problem, your solution, who buys, how you reach them, and how money comes in and goes out.',
  risks: 'The beliefs that must be true for this to work, ranked by danger, plus short stories of how it could fail so you can prevent them.',
  readiness: 'Three checkpoints: ready to sell, ready to grow, ready to raise money. Each is scored out of 5.',
  score: 'The final summary: overall ratings, our honest verdict and what to do next.',
  help: 'How Productica and Syncoro can support you, from first idea through to scale.',
};

const gauge = (s, u) => {
  const P = (v, r) => { const g = Math.PI * (1 + v / 10); return [(320 + r * Math.cos(g)).toFixed(1), (270 + r * Math.sin(g)).toFixed(1)]; };
  const [x1, y1] = P(6.5, 184), [x2, y2] = P(6.5, 216), arc = 'M 120 270 A 200 200 0 0 1 520 270';
  return `<div class="iq-cockpit"><svg viewBox="60 14 520 286" aria-label="Syncoro IQ ${s.toFixed(1)} of 10, upside ${u.toFixed(1)}">
<path d="${arc}" class="iq-track"/><path d="${arc}" class="iq-fill" pathLength="100" style="stroke-dasharray:${s * 10} 100"/>
<path d="${arc}" class="iq-upside" pathLength="100" style="stroke-dasharray:${Math.max(0, u - s) * 10} 100;stroke-dashoffset:-${s * 10}"/>
${[0, 2, 4, 6, 8, 10].map(v => { const [x, y] = P(v, 242); return `<text x="${x}" y="${y}" class="iq-tick" text-anchor="middle" dominant-baseline="middle">${v}</text>`; }).join('')}
<g class="iq-build-mark"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></g></svg>
<div class="iq-score-overlay"><strong>${s.toFixed(1)}</strong><span>SYNCORO IQ / 10</span></div></div>`;
};

const sec = (id, h, lead, b) => {
  const x = HELP[id];
  return `<section id="${id}"><div class="wrap"><div class="sh"><h2>${h}${x ? `<button class="qm" type="button" aria-expanded="false" aria-controls="qx-${id}" aria-label="What does this section mean?">?</button>` : ''}</h2>${x ? `<div class="qx" id="qx-${id}"><div><p>${x}</p></div></div>` : ''}</div>${lead ? `<p class="lead">${lead}</p>` : ''}${b}</div></section>`;
};
const gx = (a, c = '') => `<div class="gx ${c}">${a.join('')}</div>`;
const card = (b, c = '') => `<div class="card ${c}">${b}</div>`;
const bar = (l, p, n, c = 'c1', i = 0) => `<div class="bar"><span>${l}</span><div class="t"><i class="${c}" style="--p:${p}%;--d:${i * 0.12}s"></i></div><b class="n cn">${n}</b></div>`;
const ring = (p, n, l) => `<div class="card rg"><svg viewBox="0 0 36 36"><circle class="bk" cx="18" cy="18" r="15.9" pathLength="100"/><circle class="f" cx="18" cy="18" r="15.9" pathLength="100" style="--p:${p}"/></svg><div><b class="big${String(n).includes('/') ? '' : ' cn'}">${n}</b><div class="lab">${l}</div></div></div>`;
const dots = (v, m = 5) => `<span class="dots">${Array.from({ length: m }, (_, i) => `<i${i < v ? ' class="f"' : ''} style="--d:${i * 0.08}s"></i>`).join('')}</span>`;
const tbl = (h, r, cls = '') => `<div class="ts"><table class="${cls}"><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr>${r.map(x => `<tr>${x.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
const list = a => `<ul>${a.map(x => `<li>${x}</li>`).join('')}</ul>`;

const SIG = {
  aligned: ['good', 't-yes', 'tag-good', '✓', 'Aligned'],
  mixed: ['up', 't-mid', 'tag-watch', '◐', 'Mixed'],
  friction: ['bad', 't-no', 'tag-focus', '!', 'Friction'],
  unknown: ['mu', 't-unk', 'tag-unk', '?', 'Unknown'],
};
const SIG_ALIAS = { neutral: 'mixed' };
const cap = w => String(w || '').charAt(0).toUpperCase() + String(w || '').slice(1);
// styling comes from the signal family, the label is always the agent's own word
const sigOf = s => { const k = String(s || '').toLowerCase().trim(); const base = SIG[SIG_ALIAS[k] || k] || SIG.unknown; return [base[0], base[1], base[2], base[3], cap(k) || base[4]]; };

export function buildReportBody(R) {
  const D = esc(R || {});
  const q = D.q || [];
  const r1 = x => Math.round((x + 1e-9) * 10) / 10;
  const av = l => { l = l.filter(x => x != null && !isNaN(x)); return l.length ? l.reduce((s, x) => s + x, 0) / l.length : 0; };
  q.forEach(r => {
    if ((r[2] == null || isNaN(r[2])) && Array.isArray(r[4]) && r[4].length) r[2] = r1(av(r[4].map(x => +x[1])));
    if ((r[3] == null || isNaN(r[3])) && Array.isArray(r[4]) && r[4].length) r[3] = r1(av(r[4].map(x => +x[2])));
  });
  const f = i => r1(q.reduce((s, r) => s + r[1] * r[i], 0));
  const a = D.iq && D.iq.today != null ? +D.iq.today : f(2);
  const b = D.iq && D.iq.upside != null ? +D.iq.upside : f(3);
  const mn = q.length ? Math.min(...q.map(r => r[2])) : 0;
  const pf = +D.proof || 0;
  const Vcalc = a < 3.5 ? 'Park' : (a < 5 || mn < 4) ? 'Pivot' : (a >= 6.5 && pf >= 3) ? 'Build' : 'Test first';
  const norm = { build: 'Build', 'test first': 'Test first', pivot: 'Pivot', park: 'Park' };
  const vRaw = String(D.verdict || '').toLowerCase().trim();
  const V = norm[vRaw] || (vRaw ? cap(vRaw) : Vcalc); // the agent's verdict wins; computed only when absent
  const vc = /^build/.test(V.toLowerCase()) ? 'good' : /^test/.test(V.toLowerCase()) ? 'up' : 'bad';
  const vchip = vc == 'good' ? 'g' : vc == 'up' ? 'u' : 'b';
  const SC = (D.score && D.score.length) ? D.score : [];
  const dateStr = D.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const hero = `<header class="hero"><div class="wrap"><div><span class="pill ${vc}">Verdict: ${V}</span><h1>${D.name}</h1><p class="th">${D.sub || ''}</p></div>
<div class="card hero-gauge"><div class="hg-head"><span class="eyebrow">Syncoro IQ · Venture Diagnostic</span><span class="chip ${vchip}">${V}</span></div>${gauge(a, b)}
<div class="iq-legend"><span><i></i>Today ${a.toFixed(1)}</span><span><i class="d"></i>Upside ${b.toFixed(1)}</span><span><i class="b"></i>6.5 Build gate</span></div></div>
</div></header>`;

  const S = [];

  // 1. SYNCORO IQ TEST
  if (q.length) S.push(() => {
    const rows = r => `<div class="iq-quotient"><div class="iq-qhead"><h3>${r[0]} Quotient</h3><div class="iq-qscore">${(+r[2]).toFixed(1)}<small> / 10</small>${r[3] != null && !isNaN(r[3]) ? `<small style="margin-left:12px;color:var(--tc2)">upside ${(+r[3]).toFixed(1)}</small>` : ''}</div></div>${(r[4] || []).map(x => `<div class="iq-row"><span>${x[0]}</span><span class="iq-dots">${Array.from({ length: 10 }, (_, k) => `<i class="${k < +x[1] ? 'on' : ''}"></i>`).join('')}</span><span class="iq-evidence">${x[3] || ''}</span></div>`).join('')}</div>`;
    return sec('iq', 'Syncoro IQ Test', 'Five quotients, weighted into one score. The meter at the top of the report shows the result.',
      `<div class="iq-shell"><div class="iq-hero"><div class="iq-topline"><div><span class="eyebrow">Syncoro IQ · Venture Diagnostic</span><p class="sm" style="margin-top:6px;max-width:56ch">The score separates what is attractive on paper from what has enough empirical evidence to deserve founder capital.${D.proofLabel ? ` Current proof level: <b>${D.proofLabel}</b>.` : ''}</p></div><div class="verdict-orb"><span>VERDICT</span><strong>${V}</strong><small>${dateStr}</small></div></div></div><div class="iq-formula">${q.map(r => `${Number(r[1]).toFixed(2)}×${(+r[2]).toFixed(1)} ${r[0]}`).join('  +  ')}  =  <b>${a.toFixed(1)}</b></div>${q.map(rows).join('')}</div>`);
  });

  // 2. SHOULD YOU BUILD THIS?
  if ((D.why && D.why.length) || (D.risk && D.risk.length)) S.push(() => sec('verdict', 'Should you build this?', '', gx([
    card(`<h3>Why it could work</h3>${list(D.why || [])}`, 'pc y'),
    card(`<h3>Why it could fail</h3>${list(D.risk || [])}`, 'pc n'),
  ], 'w')));

  // 3. THE IDEA, SHARPENED
  if (D.clar && D.clar.length) S.push(() => sec('clarity', 'The idea, sharpened', 'The version worth testing serves one buyer with an acute pain.',
    tbl(['', 'As submitted', 'Worth testing'], D.clar.map(r => [`<b>${r[0]}</b>`, r[1], r[2]]), 'tbl-compare') +
    (D.pos ? `<div class="pos-callout"><div class="pos-badge">CORE STRATEGIC POSITIONING</div><div class="pos-statement">“${D.pos}”</div>${D.wedge ? `<p class="pos-note"><strong>Wedge principle:</strong> ${D.wedge}</p>` : ''}</div>` : '')));

  // 4. THE PRODUCTICA LENS
  // Rendered block by block, in the agent's own order. Known blocks get a designed layout; every other
  // block (extra buyer lanes, activation map, ...) is rendered generically so nothing is ever dropped.
  if (D.lens && D.lens.blocks && D.lens.blocks.length) S.push(() => {
    const inline = t => String(t || '')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,;:]|$)/g, '$1<i>$2</i>');
    const sigCell = v => { const s = sigOf(v); return `<span class="tick ${s[1]}">${s[4]}</span>`; };
    const table = t => tbl(t.head, t.rows.map(r => r.map((c, i) => /signal/i.test(t.head[i] || '') ? sigCell(c) : i == 0 ? `<b>${c}</b>` : c)), 'tbl-compare');
    const bulletList = p => `<div class="card"><ul style="padding-left:18px;display:grid;gap:6px;font-size:14px;color:var(--ink)">${p.items.map(([k, v]) => `<li>${k ? `<b>${k}:</b> ` : ''}${v}</li>`).join('')}</ul></div>`;
    const generic = b => b.parts.map(p => p.type == 'table' ? table(p) : p.type == 'bullets' ? bulletList(p) : `<p style="font-size:14.5px;color:var(--ink);line-height:1.55">${inline(p.text)}</p>`).join('');
    const first = (b, type) => b.parts.find(p => p.type == type);
    const get = (items, k) => ((items || []).find(x => String(x[0]).toLowerCase().startsWith(k)) || [])[1];

    const fitPanel = (t, iD, iS, iF, iE) => {
      const rows = t.rows.map(r => {
        const s = sigOf(r[iS]);
        const ev = iE > -1 && r[iE] ? `<div class="fit-grid-meta" style="grid-template-columns:1fr"><div><span>Evidence badge</span>${r[iE]}</div></div>` : '';
        return `<div class="fit-card-row" style="--fc:var(--${s[0]})"><div class="fit-num">${s[3]}</div><div><div class="fit-topline"><b>${r[iD]}</b><span class="${s[2]}">${s[4]}</span></div><p class="fit-desc">${r[iF]}</p>${ev}</div></div>`;
      }).join('');
      return `<h3 class="lens-sub">Venture fit</h3><div class="fit-panel">
<div class="fit-head"><div><span class="eyebrow">Diagnostic Audit</span><h3>How well does ${D.name} fit its buyers?</h3><p class="sm">Commercial tests, read from evidence rather than scored.</p></div></div>
<div class="fit-legend"><span><i style="background:var(--good)"></i>Aligned</span><span><i style="background:var(--up)"></i>Mixed / neutral</span><span><i style="background:var(--bad)"></i>Friction</span><span><i style="background:var(--mu)"></i>Unknown (not yet evidenced)</span></div>
${rows}</div>`;
    };

    const html = D.lens.blocks.map(b => {
      const key = String(b.heading || '').toLowerCase().trim();
      if (!key && b.level == 2) return ''; // preamble: covered by the section lead
      if (b.level == 3) return `<h3 class="lens-sub" style="font-size:24px;margin-top:22px;padding-top:16px;border-top:1px solid var(--ln)">${b.heading}</h3>`;

      if (key == 'venture signature') {
        const bl = first(b, 'bullets'), items = bl ? bl.items : [];
        const mech = get(items, 'primary value'), outcome = get(items, 'customer outcome');
        if (mech) {
          const rest = items.filter(x => !/^(primary value|customer outcome)/i.test(x[0]));
          return `<div class="hero-arch-card lens-arch"><div class="h-arch-kicker"><span class="eyebrow">Venture Signature</span></div><h3>${mech}</h3><p class="h-arch-desc">${outcome || ''}</p><div class="h-arch-grid">${rest.map(x => `<div${String(x[1]).length > 90 ? ' class="span2"' : ''}><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div></div>`;
        }
      }

      if (key == 'condition to prove') {
        return `<div class="lens-cond"><b>Condition to prove:</b> ${b.parts.filter(p => p.type == 'text').map(p => inline(p.text)).join(' ')}</div>`;
      }

      if (key == 'venture fit') {
        const t = first(b, 'table');
        const ix = re => t ? t.head.findIndex(h => re.test(h)) : -1;
        const iD = ix(/dimension/i), iS = ix(/signal/i), iF = ix(/finding/i), iE = ix(/evidence/i);
        if (t && iD > -1 && iS > -1 && iF > -1) return fitPanel(t, iD, iS, iF, iE);
      }

      if (key == 'claims' || key == 'evidence register') {
        const t = first(b, 'table');
        if (t) return `<details class="card"><summary>${b.heading} (${t.rows.length})</summary>${table(t)}</details>`;
      }

      if (key == 'breakpoint') {
        const title = (b.parts.find(p => p.type == 'text') || {}).text || '';
        const bl = first(b, 'bullets');
        const notes = (bl ? bl.items : []).map(x => `<p class="pos-note" style="margin-top:6px"><strong>${x[0]}:</strong> ${x[1]}</p>`).join('');
        return `<div class="pos-callout"><div class="pos-badge">BREAKPOINT</div><div class="pos-statement">${inline(title)}</div>${notes}</div>`;
      }

      if (key == 'next test') {
        const nt = (first(b, 'bullets') || { items: [] }).items;
        const row = (label, k) => get(nt, k) ? `<div class="wide"><span>${label}</span>${get(nt, k)}</div>` : '';
        const pass = get(nt, 'pass') ? `<div class="pass"><span>Pass if</span>${get(nt, 'pass')}</div>` : '';
        const revise = get(nt, 'revise') ? `<div class="rev"><span>Revise if</span>${get(nt, 'revise')}</div>` : '';
        return `<div class="card"><span class="eyebrow">Next test</span><h3 style="margin-top:4px">${get(nt, 'assumption') || 'The next experiment'}</h3><div class="nt-grid">${row('Test with', 'test with')}${row('Do', 'do')}${row('Evidence to observe', 'evidence')}${pass}${revise}${row('Decision', 'decision')}</div></div>`;
      }

      // anything else (buyer path per lane, activation map, ...): shown as written, in order
      return `<h3 class="lens-sub">${b.heading}</h3>${generic(b)}`;
    }).join('');

    return sec('lens', 'The Productica Lens', 'How this idea creates value, and where it meets the buyer. The Lens gives no score and no verdict: it maps fit, evidence, the breakpoint and the next test.', `<div class="lens-shell">${html}</div>`);
  });

  // 5. WHO BUYS FIRST
  if (D.segTable && D.segTable.length) S.push(() => {
    const rc = { g: 'g', b: 'b', u: 'u' };
    return sec('segments', 'Who buys first', D.icp || '', `<div class="ts"><table class="tbl-compare seg-tbl"><thead><tr><th>Segment</th><th>Pain</th><th>Pay</th><th>Reach</th><th>Role</th></tr></thead><tbody>${D.segTable.map(s => `<tr><td><b>${s.name}</b><br><small>${s.desc}</small></td><td>${dots(s.pain)}</td><td>${dots(s.pay)}</td><td>${dots(s.reach)}</td><td><span class="chip ${rc[s.roleType] || ''}">${s.role}</span></td></tr>`).join('')}</tbody></table></div><p class="sm">Pain: how much the problem hurts today · Pay: willingness and ability to pay · Reach: how easily you can get in front of them. Each scored out of 5.</p>`);
  });

  // 6. MARKET
  if (D.mkt && D.mkt.length) S.push(() => {
    const M = D.mkt.slice(0, 4), n = M.length, st = n > 1 ? 106 / (n - 1) : 0, R = i => 146 - i * st, col = i => i == n - 1 ? 'var(--up)' : 'var(--tc)';
    const svg = M.map((m, i) => { const r = R(i), cy = 296 - r, inner = i == n - 1, top = 296 - 2 * r, y1 = inner ? cy - 3 : top + 26, y2 = inner ? cy + 14 : top + 44;
      return `<g class="nc ${inner ? 'mk-in' : ''}" style="--d:${i * 0.25}s"><circle cx="150" cy="${cy}" r="${r}" fill="${col(i)}" fill-opacity="${inner ? 1 : 0.1 + i * 0.1}" stroke="var(--tc)" stroke-opacity=".5"/><text x="150" y="${y1}" text-anchor="middle" class="mk-ab">${m[0]}</text><text x="150" y="${y2}" text-anchor="middle" class="mk-v">${m[2]}</text></g>`; }).join('');
    return sec('market', 'Market size, without the hype', '', `<div class="card mk2"><svg class="mk-svg" viewBox="0 0 300 300" role="img" aria-label="Nested market sizes: ${M.map(m => m[0] + ' ' + m[2]).join(', ')}">${svg}</svg><div>${M.map((m, i) => `<div class="mk-row"><span class="mk-chip" style="--c:${col(i)}">${m[0]}</span><div><b>${m[1]}</b><small>${m[3] || ''}</small></div><b class="mk-val cn">${m[2]}</b></div>`).join('')}<p class="sm" style="margin-top:6px">Circles are stepped for readability, not to scale.</p>${D.mktCalc ? `<div class="mk-note"><b>Calculation:</b> ${D.mktCalc}</div>` : ''}${D.mktNote ? `<div class="mk-note">${D.mktNote}</div>` : ''}</div></div>`);
  });

  // 7. COMPETITION
  if (D.comp && D.comp.rows && D.comp.rows.length) S.push(() => {
    const C = D.comp, T = ['<span class="tick t-no" title="No">✗</span>', '<span class="tick t-mid" title="Partly">◐</span>', '<span class="tick t-yes" title="Yes">✓</span>'];
    return sec('competition', "Who you're up against", D.compLead || '', `<div class="ts"><table class="tbl-compare comp-tbl"><thead><tr><th>Competitor</th>${C.cols.map(c => `<th style="text-align:center">${c}</th>`).join('')}</tr></thead><tbody>${C.rows.map(r => `<tr class="${r[3] ? 'us' : ''}"><td><b>${r[0]}</b><br><small style="color:var(--mu)">${r[1]}</small></td>${r[2].map(v => `<td style="text-align:center">${T[v] || ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="sm">✓ Does this well · ◐ Partly · ✗ Doesn't do it</p>` + gx([
      (D.cac && D.cac.length) ? card(`<h3>Cost to win one customer</h3>${D.cac.map((r, i) => `<div class="sbar"><div class="sbar-top"><span>${r[0]}</span><b>${r[1]}</b></div><div class="t"><i class="${r[3] ? 'c2' : 'c1'}" style="--p:${r[2]}%;--d:${i * 0.12}s"></i></div></div>`).join('')}`) : '',
      (D.moat && D.moat.length) ? card(`<h3>Your moat today</h3>${D.moat.map(r => { const [st, ...d] = String(r[2]).split(' — '); return `<div class="mrow"><b>${r[0]}</b>${dots(r[1])}<small><span class="chip ${r[1] >= 4 ? 'g' : r[1] <= 1 ? 'b' : 'u'}">${st}</span> ${d.join(' — ')}</small></div>`; }).join('')}`) : '',
    ], 'w') + (D.path ? `<div class="call"><b>The Only Defensible Path:</b> ${D.path}</div>` : ''));
  });

  // 8. LEAN CANVAS
  if (D.leanCanvas && Object.keys(D.leanCanvas).length) S.push(() => {
    const C = D.leanCanvas, cell = (k, l, c = '') => `<div class="lc-cell lc-${k} ${c}"><h4>${l}</h4><p>${C[k] || ''}</p></div>`;
    return sec('lean-canvas', 'Lean Canvas, first version', 'The whole business model on one page, before any code is written.', `<div class="lc">${cell('problem', 'Problem')}${cell('solution', 'Solution')}${cell('metrics', 'Key metrics')}${cell('uvp', 'Unique value', 'lc-hi')}${cell('unfair', 'Unfair advantage')}${cell('channels', 'Channels')}${cell('segments', 'Customer')}${cell('cost', 'Costs')}${cell('revenue', 'Revenue')}</div>`);
  });

  // 9. RISKS & PRE-MORTEM
  if ((D.assume && D.assume.length) || (D.stories && D.stories.length)) S.push(() => {
    const sv = { critical: 'bad', high: 'up', medium: 'tc' };
    return sec('risks', 'Riskiest assumptions & pre-mortem', D.riskLead || '', `<div class="as-list">${(D.assume || []).map((r, i) => `<div class="as-row" style="--sc:var(--${sv[String(r[2]).toLowerCase()] || 'mu'})"><span class="as-n">${i + 1}</span><div><b>${r[0]}</b><small>${r[1]}</small></div><span class="as-sev">${r[2]}</span><span class="as-ev">Evidence ${r[3]}</span></div>`).join('')}</div>
<h3 class="pm-h">Pre-mortem</h3>
<div class="pm-explain"><span class="pm-q">?</span><p><b>What is a pre-mortem?</b> A post-mortem asks why something failed after the fact. A pre-mortem asks the same question before you start: imagine it is 18 months from now and the venture has not worked out, then write down the most likely reasons. Psychologist Gary Klein designed it to surface risks that optimism hides, while there is still time to prevent them. Here are the three most likely stories for this idea, each with its prevention.</p></div>
<div class="pm-grid">${(D.stories || []).map((s, i) => `<div class="pm-card"><span class="pm-k">Story ${i + 1}</span><h4>${s[0]}</h4><p>${s[1]}</p><div class="pm-prev"><b>Prevent:</b> ${s[2]}</div></div>`).join('')}</div>`);
  });

  // 10. SYNCORO 3R READINESS
  if (D.readiness && D.readiness.gates && D.readiness.gates.length) S.push(() => {
    const G = D.readiness.gates;
    return sec('readiness', 'Syncoro 3R Readiness', 'Three qualification gates: Market-Ready, Growth-Ready, Investment-Ready. Each is scored 1–5 from the Syncoro IQ factors and capped by your proof level.',
      gx(G.map(g => ring(g.level / 5 * 100, `${g.level}/5`, g.name)), 's') +
      gx(G.map(g => card(`<h3>${g.name}</h3><p class="sm">${g.question}</p><p style="margin-top:8px"><span class="chip ${g.level >= 4 ? 'g' : g.level <= 2 ? 'u' : ''}">${g.band}</span></p><p class="rd-meta"><b>Raw score:</b> ${g.raw}</p><p class="rd-meta"><b>Limited by:</b> ${g.limited}</p><p class="rd-meta"><b>Next unlock:</b> ${g.unlock}</p>`)), 's') +
      ((D.readiness.calc || []).length ? `<details class="card"><summary>How these were calculated</summary><ul class="calc-list">${D.readiness.calc.map(c => `<li>${c}</li>`).join('')}</ul></details>` : ''));
  });

  // 11. FINAL SCORECARD & SOUNDBOARD
  S.push(() => {
    const eligible = D.soundboard ? D.soundboard === 'eligible' : a >= 6.5 || pf >= 3;
    return sec('score', 'Final Scorecard & Strategic Next Steps', '',
      (SC.length ? card(SC.map((r, i) => bar(r[0], r[1] * 10, r[1] + ' / 10', r[2] ? 'c2' : 'c1', i)).join('')) : '') +
      card(`<h3>Operator Verdict</h3><p style="font-size:16px;color:var(--ink);line-height:1.5;font-weight:600"><b>${a.toFixed(1)} / 10 · ${V}.</b> ${D.final || ''}</p>`) +
      ((D.acts && D.acts.length) ? `<div class="acts">${D.acts.map(x => `<div style="background:color-mix(in srgb,var(--${x[2]}) 18%,transparent)"><b style="color:${x[2] == 'up' ? 'var(--ink)' : 'var(--' + x[2] + ')'}">${x[0]}</b>${x[1]}</div>`).join('')}</div>` : '') +
      `<div class="soundboard-card ${eligible ? 'eligible' : 'locked'}" style="margin-top:16px">
<div class="sb-header"><span class="chip ${eligible ? 'g' : 'u'}">${eligible ? '✓ Eligible for Soundboard' : '🔒 Qualification Benchmark'}</span><span style="font-size:12px;color:var(--mu);font-weight:600">Syncoro Ventures Partner Office</span></div>
<h3>Syncoro Soundboard Advisory Session</h3>
<p style="font-size:14px;color:var(--tx);line-height:1.5">${eligible
        ? 'Your venture meets the qualification standard (Syncoro IQ ≥ 6.5 or Proof Level ≥ E3). You are eligible to book a 60-minute venture stress-test session with Syncoro partners and advisors.'
        : `The Syncoro Soundboard is reserved for ventures at <strong>Proof Level E3 (Paid pilots)</strong> or <strong>Syncoro IQ 6.5+</strong>. Your current standing: <strong>${a.toFixed(1)} / 6.5 IQ</strong> and <strong>Proof Level E${pf}</strong>. Prove demand with paying customers to unlock partner advisory.`}</p>
${eligible ? '<a class="sb-btn" href="https://productica.in/coming-soon" target="_top">Apply for Syncoro Soundboard →</a>' : `<div class="sm" style="color:var(--mu);font-weight:600">Target to unlock: ${D.unlockTarget || 'reach Proof Level E3 with paying customers.'}</div>`}
</div>`);
  });

  // 12. HOW PRODUCTICA CAN HELP (static)
  S.push(() => {
    const roadmap = [
      ['01', 'Diagnose', 'Turn the raw idea into a decision-ready venture thesis', ['Syncoro IP · IQ diagnostic', 'Productica IP · Idea validation']],
      ['02', 'Sharpen', 'Define the buyer, venture signature, positioning and the real moat', ['Syncoro IP · Venture intelligence', 'Productica IP · ICP + MOAT']],
      ['03', 'Validate', 'Convert assumptions into evidence through interviews, pilots and market tests', ['Syncoro IP · Evidence framework', 'Productica IP · PMF + PASR']],
      ['04', 'Decide', 'Make the next capital, product or go-to-market decision from live evidence', ['Syncoro IP · Decision intelligence', 'Productica IP · Decision OS + agents']],
      ['05', 'Scale', 'Keep the venture intelligence layer alive as the company changes', ['Syncoro IP · Strategic intelligence', 'Productica IP · Venture intelligence platform']],
    ];
    return sec('help', 'How Productica can help', 'A shared operating roadmap: Syncoro brings the intelligence layer; Productica turns that intelligence into repeatable founder decisions, evidence and execution.', `
<div class="help-shell"><div class="help-intro"><div class="help-callout"><span class="eyebrow" style="color:var(--up)">The Combined Thesis</span><h3>From idea → evidence → venture intelligence.</h3><p>Productica is not another static report. The system progressively reduces uncertainty, captures empirical evidence, and turns every validated signal into the founder's next move.</p></div>
<div class="ip-grid"><div class="ip-card"><span class="ip-label">Syncoro IP</span><h4>Intelligence Layer</h4><p>Diagnostic frameworks, venture patterns, strategic interpretation and evidence-led judgment.</p></div><div class="ip-card"><span class="ip-label">Productica IP</span><h4>Execution Engine</h4><p>Idea validation, ICP qualification, MOAT testing, PASR, autonomous agents, and a living decision OS.</p></div></div></div>
<div class="roadmap">${roadmap.map(r => `<div class="road-step"><div class="road-num">${r[0]}</div><div class="road-card"><h4>${r[1]}</h4><p>${r[2]}</p><div class="road-ip">${r[3].map(x => { const [owner, ...rest] = x.split(' · '); return `<span><b>${owner}</b>${rest.join(' · ')}</span>`; }).join('')}</div></div></div>`).join('')}</div>
<div class="outcome"><b>End state:</b> The founder moves from “Should I build this?” to “What does the evidence say, what changed, and what should I do next?” — with Syncoro and Productica reinforcing the same decision loop.</div></div>`);
  });

  const body = S.map(fn => { try { return fn(); } catch (e) { console.error('[idea-report] section failed', e); return ''; } }).join('');
  return { name: D.name, hero, body };
}

// Runtime inside the iframe: scroll-in animations, count-up numbers, (?) toggles, progress bar, print support.
const RUNTIME = `
(function(){
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
function q(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
function cu(e){var s=e.dataset.t||(e.dataset.t=e.textContent),t0=performance.now();if(rm)return;
setTimeout(function(){e.textContent=s},1600);
(function f(){var p=Math.min((performance.now()-t0)/1400,1),k=1-Math.pow(1-p,3);
e.textContent=s.replace(/\\d[\\d,]*\\.?\\d*/g,function(m){var n=parseFloat(m.replace(/,/g,'')),d=(m.split('.')[1]||'').length,v=(n*k).toFixed(d);return m.indexOf(',')>-1?(+v).toLocaleString('en-US',{maximumFractionDigits:d}):v});
if(p<1)requestAnimationFrame(f)})(t0)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');q('.cn',e.target).forEach(cu);io.unobserve(e.target)}})},{threshold:.1});
q('header,section').forEach(function(x){io.observe(x)});
addEventListener('scroll',function(){var h=document.documentElement,p=document.getElementById('pr');if(p)p.style.width=h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight)*100+'%'},{passive:true});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.qm');if(!b)return;var o=b.getAttribute('aria-expanded')!='true';b.setAttribute('aria-expanded',o);document.getElementById(b.getAttribute('aria-controls')).classList.toggle('open',o)});
addEventListener('beforeprint',function(){q('header,section').forEach(function(x){x.classList.add('on')});q('.qx').forEach(function(x){x.classList.add('open')});q('details').forEach(function(x){x.open=true})});
})();`;

export function buildReportDocument(R, { theme, grantsHref } = {}) {
  const { name, hero, body } = buildReportBody(R);
  const grants = grantsHref ? `<section id="grants"><div class="wrap"><div class="soundboard-card eligible">
<div class="sb-header"><span class="chip g">Next step</span><span style="font-size:12px;color:var(--mu);font-weight:600">Separate tool · also works on its own</span></div>
<h3>See which grants fit this idea.</h3>
<p style="font-size:14px;color:var(--tx);line-height:1.5">This report is sent into grant matching, so both tools stay on the same venture. You can also open /grants later on its own.</p>
<a class="sb-btn" href="${E(grantsHref)}" target="_top">Check grants →</a>
</div></div></section>` : '';
  return `<!doctype html><html lang="en"${theme ? ` data-theme="${theme}"` : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${name} · Idea Validation Report | Productica</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600;700&display=swap">
<style>${reportCss}</style></head><body>
<div class="top"><div><div class="brand-lockup"><b>Productica</b><span>Powered by Syncoro Ventures</span></div><span style="color:var(--mu);font-weight:600">${name} · Idea Validation Report</span></div><div id="pr"></div></div>
${hero}${body}
${grants}
<footer><div class="wrap"><b>Productica</b> <span style="opacity:.8;font-size:13px">· Powered by Syncoro Ventures</span><p>Prepared with AI-assisted research from public information. A decision aid, not investment, legal or financial advice. Scores, ratings and readiness checks are Productica's estimates until tested. Syncoro IQ, Productica Lens, and Venture Archetypes are proprietary decision-support methodologies.</p></div></footer>
<script>${RUNTIME}</script></body></html>`;
}
