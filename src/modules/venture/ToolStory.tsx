import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { ArrowRight, ArrowUpRight, Check, Download } from 'lucide-react';
import ProducticaFooter from './ProducticaFooter';
import { landingStory, type FeatureTab, type LandingKind } from './landingContent';
import './landingStory.css';

function StrokeIcon({ children, className = 'ls-icon' }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {children}
    </svg>
  );
}

const icons = {
  spark: (
    <StrokeIcon>
      <path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3Z" />
    </StrokeIcon>
  ),
  flag: (
    <StrokeIcon>
      <path d="M5 22V3m0 1c4-3 9 3 14 0v10c-5 3-10-3-14 0" />
    </StrokeIcon>
  ),
  bulb: (
    <StrokeIcon>
      <path d="M9 18h6m-5 3h4M8.5 15a7 7 0 1 1 7 0c-.8.5-1.2 1.4-1.2 3H9.7c0-1.6-.4-2.5-1.2-3Z" />
    </StrokeIcon>
  ),
  cap: (
    <StrokeIcon>
      <path d="m2 9 10-5 10 5-10 5ZM6 11v6c4 3 8 3 12 0v-6M22 9v7" />
    </StrokeIcon>
  ),
  lens: (
    <StrokeIcon>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5M7 10.5h7m-3.5-3.5v7" />
    </StrokeIcon>
  ),
  chart: (
    <StrokeIcon>
      <path d="M4 4v16h17M8 15v-4m5 4V7m5 8v-6" />
    </StrokeIcon>
  ),
  people: (
    <StrokeIcon>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m1 5a5 5 0 0 1 3 5" />
    </StrokeIcon>
  ),
  grid: (
    <StrokeIcon>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </StrokeIcon>
  ),
  route: (
    <StrokeIcon>
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M5 7v6a4 4 0 0 0 4 4h6m-2-4 4 4-4 4M12 5h7m-3-3 3 3-3 3" />
    </StrokeIcon>
  ),
  check: (
    <StrokeIcon>
      <path d="m5 12 4 4L19 6" />
    </StrokeIcon>
  ),
};

const tabIcon: Record<FeatureTab['panel'], ReactNode> = {
  lens: icons.lens,
  iq: icons.chart,
  market: icons.people,
  model: icons.grid,
  next: icons.route,
  'grant-lens': icons.spark,
  eligibility: icons.check,
  stage: icons.route,
  sector: icons.grid,
  apply: icons.flag,
};

const useIcon = {
  people: icons.people,
  grid: icons.grid,
  bulb: icons.bulb,
  flag: icons.flag,
};

function useLandingMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.classList.add('ls-ready');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = [...el.querySelectorAll<HTMLElement>('[data-in]')];
    if (reduce) {
      nodes.forEach(node => node.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '80px 0px 25% 0px', threshold: 0.01 });
    nodes.forEach(node => io.observe(node));
    const fallback = window.setTimeout(() => {
      nodes.forEach(node => node.classList.add('is-in'));
    }, 1800);
    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
    };
  }, [root]);
}

export default function ToolStory({ kind, onCta }: { kind: LandingKind; onCta: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useLandingMotion(rootRef);
  const story = landingStory[kind];
  const [tab, setTab] = useState(story.tabs[0].id);
  const active = story.tabs.find(item => item.id === tab) ?? story.tabs[0];
  const sample = story.sampleHref ? encodeURI(story.sampleHref) : '';

  const moveTab = (delta: number) => {
    const index = story.tabs.findIndex(item => item.id === tab);
    const next = story.tabs[(index + delta + story.tabs.length) % story.tabs.length];
    setTab(next.id);
  };

  return (
    <div className="vl-ls" id="story" data-kind={kind} ref={rootRef}>
      <div className="ls-strip" aria-label="Questions this tool helps you explore">
        <div className="ls-wrap">
          {story.questions.flatMap((question, i) => [
            i > 0 ? <span key={`spark-${question}`} aria-hidden>{icons.spark}</span> : null,
            <span key={question}>{question}</span>,
          ])}
        </div>
      </div>

      <section className="ls-intro ls-wrap" id="report">
        <div data-in="copy">
          <p className="ls-eyebrow">{story.introEyebrow}</p>
          <h2>
            {story.introTitle[0]}
            <br />
            <span className="ls-muted">{story.introTitle[1]}</span>
          </h2>
          <p className="ls-lead" style={{ marginTop: 28 }}>{story.introLead}</p>
          <p className="ls-intro-body">{story.introBody}</p>
          <div className="ls-intro-note">
            <span className="ls-mark" aria-hidden>↗</span>
            <p>{story.introNote}</p>
          </div>
        </div>
        {kind === 'idea' ? <ReportStage href={sample} /> : <GrantStage />}
      </section>

      <section className="ls-audience ls-section" id="audience">
        <div className="ls-wrap">
          <div className="ls-audience-head">
            <h2>{story.audienceTitle}</h2>
            <p>{story.audienceSub}</p>
          </div>
          <div className="ls-rows">
            {story.audiences.map((row, i) => (
              <article key={row.id} data-in="row" style={{ '--i': i } as CSSProperties} className={`ls-row ${row.tone === 'ink' ? 'ls-row-ink' : row.tone === 'soft' ? 'ls-row-soft' : ''}`}>
                <span className="ls-row-icon">{icons[row.icon]}</span>
                <h3>{row.title}</h3>
                <p>{row.body}</p>
                <span className="ls-outcome">{icons.check} {row.outcome}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ls-features ls-section" id="features">
        <div className="ls-wrap">
          <div className="ls-split-head">
            <div>
              <p className="ls-eyebrow">{story.featuresEyebrow}</p>
              <h2>
                {story.featuresTitle[0]}
                <br />
                {story.featuresTitle[1]}
              </h2>
            </div>
            <p>
              {story.featuresSub}
              <span className="ls-quiet">{story.featuresNote}</span>
            </p>
          </div>

          <div className="ls-explorer" data-in="copy">
            <div className="ls-tabs" role="tablist" aria-label={kind === 'idea' ? 'Report features' : 'Match features'} aria-orientation="vertical">
              {story.tabs.map((item, index) => {
                const selected = item.id === active.id;
                return (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    className="ls-tab"
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={`panel-${item.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setTab(item.id)}
                    onKeyDown={event => {
                      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); moveTab(1); }
                      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); moveTab(-1); }
                      if (event.key === 'Home') { event.preventDefault(); setTab(story.tabs[0].id); }
                      if (event.key === 'End') { event.preventDefault(); setTab(story.tabs[story.tabs.length - 1].id); }
                    }}
                  >
                    <span className="ls-idx">{String(index + 1).padStart(2, '0')}</span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.blurb}</small>
                    </span>
                    {icons.spark}
                  </button>
                );
              })}
            </div>
            <article className="ls-panel" id={`panel-${active.id}`} role="tabpanel" aria-labelledby={`tab-${active.id}`} tabIndex={0}>
              <div className="ls-panel-top">
                <span>{tabIcon[active.panel]} {active.kicker}</span>
                {kind === 'idea' && <span className="ls-sample">From the sample</span>}
              </div>
              <h3>{active.heading}</h3>
              <p>{active.body}</p>
              <FeatureBody panel={active.panel} />
              <div className="ls-take">
                <span>Your takeaway</span>
                <p>{active.takeaway}</p>
              </div>
            </article>
          </div>

          <div className="ls-feature-foot">
            <p>{icons.check} {story.featuresFoot}</p>
            {sample && story.sampleLabel && (
              <a className="ls-text-link" href={sample} target="_blank" rel="noopener noreferrer">
                {story.sampleLabel} <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="ls-section ls-wrap" id="benefits">
        <div className="ls-split-head">
          <div>
            <p className="ls-eyebrow">{story.benefitsEyebrow}</p>
            <h2>
              {story.benefitsTitle[0]}
              <br />
              {story.benefitsTitle[1]}
            </h2>
          </div>
        </div>
        <div className="ls-benefits-grid">
          <div className="ls-art" aria-hidden>
            <div className="ls-mess">
              {story.messy.map(tag => <span key={tag}>{tag}</span>)}
              <svg viewBox="0 0 330 190">
                <path d="M26 115c49-136 290 81 230-46S57 204 51 85s274-56 226 46S37 30 126 51s112 129 129 26" />
              </svg>
            </div>
            <span className="ls-arrow">↓</span>
            <div className="ls-clear">
              <Check size={18} />
              <span>{story.clarity}</span>
            </div>
            <span className="ls-art-cap">{story.artCaption}</span>
          </div>
          <div className="ls-benefit-list">
            {story.benefits.map((item, i) => (
              <article key={item.title} data-in="step" style={{ '--i': i } as CSSProperties}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ls-how ls-section" id="how-it-works">
        <div className="ls-wrap">
          <div className="ls-split-head">
            <div>
              <p className="ls-eyebrow">{story.howEyebrow}</p>
              <h2>
                {story.howTitle[0]}
                <br />
                {story.howTitle[1]}
              </h2>
            </div>
            <button type="button" className="ls-btn-ghost" onClick={onCta}>
              {story.howCta} <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="ls-steps">
            {story.steps.map((step, i) => (
              <article key={step.title} data-in="step" style={{ '--i': i } as CSSProperties}>
                <span className="ls-step-n">{String(i + 1).padStart(2, '0')}<span>↗</span></span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ls-section ls-wrap" id="use">
        <div className="ls-split-head">
          <div>
            <p className="ls-eyebrow">{story.useEyebrow}</p>
            <h2>{story.useTitle}</h2>
          </div>
          <p>{story.useSub}</p>
        </div>
        <div className="ls-uses">
          {story.uses.map((item, i) => (
            <article key={item.title} data-in="step" style={{ '--i': i } as CSSProperties}>
              <span className="ls-use-icon">{useIcon[item.icon]}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {story.download && (
        <section className="ls-wrap ls-download" id="download" data-in="copy">
          <div className="ls-file" aria-hidden>
            <Download size={48} strokeWidth={1.1} />
            <span>Yours to explore</span>
          </div>
          <div>
            <p className="ls-eyebrow">{story.download.eyebrow}</p>
            <h2>
              {story.download.title[0]}
              <br />
              {story.download.title[1]}
            </h2>
            <p>{story.download.body}</p>
            <div className="ls-download-actions">
              <a className="ls-btn" href={encodeURI(story.download.href)} download="Productica-Idea-Validation-Sample.html">
                {story.download.primary} <Download size={16} />
              </a>
              <a className="ls-text-link" href={encodeURI(story.download.href)} target="_blank" rel="noopener noreferrer">
                {story.download.secondary} <ArrowUpRight size={14} />
              </a>
            </div>
            <span className="ls-download-detail">{story.download.detail}</span>
          </div>
        </section>
      )}

      <section className="ls-faq ls-section ls-wrap" id="faqs" data-in="copy">
        <div className="ls-faq-intro">
          <p className="ls-eyebrow">{story.faqEyebrow}</p>
          <h2>
            {story.faqTitle[0]}
            <br />
            {story.faqTitle[1]}
          </h2>
          <p>{story.faqSub}</p>
        </div>
        <div className="ls-faq-list">
          {story.faqs.map(item => (
            <details key={item.q} id={item.id}>
              <summary>{item.q}<span className="ls-plus" aria-hidden /></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="ls-final" aria-labelledby="final-title" data-in="copy">
        <div className="ls-wrap">
          <p className="ls-eyebrow">{story.finalEyebrow}</p>
          <h2 id="final-title">
            {story.finalTitle[0]}
            <br />
            <span>{story.finalTitle[1]}</span>
          </h2>
          <p>{story.finalBody}</p>
          <button type="button" className="ls-btn-accent" onClick={onCta}>
            {story.finalCta} <ArrowRight size={16} />
          </button>
          <span className="ls-final-detail">{story.finalDetail}</span>
        </div>
      </section>

      <section className="ls-cross ls-wrap" id="cross" data-in="copy">
        <div>
          <p className="ls-eyebrow">{icons.spark} {story.crossEyebrow}</p>
          <h2>
            {story.crossTitle[0]}
            <br />
            {story.crossTitle[1]}
            {story.crossTitle[2] && <>
              <br />
              <span>{story.crossTitle[2]}</span>
            </>}
          </h2>
          <p>{story.crossBody}</p>
          <a className="ls-text-link" href={story.crossHref}>
            {story.crossLink} <ArrowRight size={14} />
          </a>
        </div>
        {kind === 'idea' ? <GrantStage compact /> : <ReportStage compact href={sample || encodeURI('/landing page design idea/sample-report.html')} />}
      </section>

      <ProducticaFooter tone="light" />
    </div>
  );
}

function ReportStage({ href, compact }: { href: string; compact?: boolean }) {
  if (compact) {
    return (
      <div className="ls-stage ls-stage--compact" data-in="paper">
        <div className="ls-stage-top"><span><span className="ls-dot" /> A look inside</span><span>Idea → insight</span></div>
        <div className="ls-paper-back" aria-hidden />
        <article className="ls-paper">
          <div className="ls-paper-brand">productica<em>.</em><span className="ls-paper-ed">Idea validation</span></div>
          <div className="ls-rule" />
          <span className="ls-paper-label">The idea, sharpened</span>
          <h3>Freelancer<br />SafePay<span>.</span></h3>
          <p className="ls-paper-sum">A scored report before you build.</p>
          <div className="ls-score ls-score--compact">
            <div>
              <span className="ls-paper-label">Syncoro IQ</span>
              <strong>4.8<span>/10</span></strong>
              <span className="ls-verdict">Verdict: pivot</span>
            </div>
          </div>
        </article>
        {href && (
          <a className="ls-stage-link" href={href} target="_blank" rel="noopener noreferrer">
            <span>See the sample report</span>
            <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="ls-stage" data-in="paper">
      <div className="ls-stage-top">
        <span><span className="ls-dot" /> A look inside</span>
        <span>Idea → insight → action</span>
      </div>
      <div className="ls-paper-back" aria-hidden />
      <article className="ls-paper">
        <div className="ls-paper-brand">productica<em>.</em><span className="ls-paper-ed">Idea validation</span></div>
        <div className="ls-rule" />
        <span className="ls-paper-label">The idea, sharpened</span>
        <h3>Freelancer<br />SafePay<span>.</span></h3>
        <p className="ls-paper-sum">A clearer money picture for<br />India’s independent workforce.</p>
        <div className="ls-score">
          <div>
            <span className="ls-paper-label">Syncoro IQ</span>
            <strong>4.8<span>/10</span></strong>
            <span className="ls-verdict">Verdict: pivot</span>
          </div>
          <svg viewBox="0 0 145 95" role="img" aria-label="Syncoro IQ score: 4.8 out of 10">
            <path className="ls-gauge-track" d="M15 77a57 57 0 0 1 114 0" />
            <path className="ls-gauge-fill" d="M15 77a57 57 0 0 1 114 0" pathLength="100" />
            <text x="72" y="69" textAnchor="middle">4.8</text>
            <text className="ls-gauge-unit" x="72" y="89" textAnchor="middle">OUT OF 10</text>
          </svg>
        </div>
        <div className="ls-insight">
          <span aria-hidden>↗</span>
          <p><b>The next move</b> Test the safe-to-withdraw ritual with real freelancers before building a full tax app.</p>
        </div>
        <div className="ls-paper-foot"><span>Clarity before code.</span><span>01 / 13</span></div>
      </article>
      <div className="ls-note">
        {icons.spark}
        <span>A pivot can<br />be progress.</span>
      </div>
      {href && (
        <a className="ls-stage-link" href={href} target="_blank" rel="noopener noreferrer">
          <span>Real sample. Real strategic questions.</span>
          <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  );
}

function GrantStage({ compact }: { compact?: boolean }) {
  return (
    <div className={`ls-grant-visual${compact ? ' ls-grant-visual--compact' : ''}`} aria-label="Grant matching considers your idea, stage and eligibility">
      <div className="ls-grant-in">
        <span className="ls-grant-ico">{icons.bulb}</span>
        <div>
          <span className="ls-paper-label">The starting point</span>
          <strong>Your idea.</strong>
        </div>
      </div>
      <div className="ls-connect"><i /><span>Find the fit</span><i /></div>
      <div className="ls-match">
        <div className="ls-paper-label" style={{ marginBottom: 10 }}>Your grant matching lens</div>
        {['Idea & sector relevance', 'Venture stage alignment', 'Eligibility to review'].map(row => (
          <div key={row} className="ls-match-row">
            <span>{row}</span>
            {icons.check}
          </div>
        ))}
        <div className="ls-match-result">
          A shortlist worth exploring <ArrowUpRight size={14} />
        </div>
      </div>
      {!compact && (
        <p className="ls-grant-note">A relevant match is a starting point.<br />Eligibility and selection remain with each grant provider.</p>
      )}
    </div>
  );
}

function FeatureBody({ panel }: { panel: FeatureTab['panel'] }) {
  if (panel === 'lens') {
    return (
      <>
        <div className="ls-arch">
          <span className="ls-arch-glyph" aria-hidden>✳</span>
          <div>
            <span className="ls-paper-label">Sample archetype</span>
            <h4>The Efficiency Engine</h4>
            <p>A product that saves customers time or money.</p>
          </div>
        </div>
        <div className="ls-fits">
          <span><i />Tailwind</span>
          <span className="watch"><i />Budget</span>
          <span className="watch"><i />Reach</span>
          <span className="focus"><i />Stickiness</span>
          <span className="focus"><i />Trust</span>
        </div>
      </>
    );
  }
  if (panel === 'iq') {
    return (
      <div className="ls-bars">
        {[
          ['Innovation', '40%', '4.0'],
          ['Value', '53%', '5.3'],
          ['Market', '60%', '6.0'],
          ['Profitability', '43%', '4.3'],
          ['X Factor', '40%', '4.0'],
        ].map(([name, value, score], i) => (
          <div key={name}>
            <span>{name}</span>
            <div><i style={{ '--value': value, '--i': i } as CSSProperties} /></div>
            <strong>{score}</strong>
          </div>
        ))}
      </div>
    );
  }
  if (panel === 'market') {
    return (
      <div className="ls-mini">
        <div><span className="ls-paper-label">Sample customer segment</span><span className="ls-paper-label">Priority</span></div>
        <div><strong>Established multiclient freelancers</strong><span className="ls-pri on">Start here</span></div>
        <div><span>New full-time freelancers</span><span className="ls-pri">Pilot</span></div>
        <div><span>High-earning creators</span><span className="ls-pri">Later</span></div>
      </div>
    );
  }
  if (panel === 'model') {
    return (
      <>
        <div className="ls-canvas">
          <div><span>Problem</span><p>“How much can I safely withdraw?”</p></div>
          <div><span>Solution</span><p>A withdrawal number + tax reserve</p></div>
          <div><span>First customer</span><p>Multiclient Indian freelancers</p></div>
          <div><span>Revenue to test</span><p>Monthly subscription</p></div>
        </div>
        <div className="ls-risk">
          <span>Critical assumption</span>
          <p>Will customers trust a new brand enough to link their bank account?</p>
        </div>
      </>
    );
  }
  if (panel === 'next') {
    return (
      <>
        <div className="ls-rings">
          {['Market Ready', 'Growth Ready', 'Investment Ready'].map(label => (
            <div key={label}>
              <span className="ls-ring">1</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
        <div className="ls-next">
          <span>Do next ↗</span>
          <p>Run a manual concierge test with 10 multiclient freelancers before building a full tax product.</p>
        </div>
      </>
    );
  }
  if (panel === 'grant-lens' || panel === 'eligibility') {
    return (
      <div className="ls-mini">
        {['Idea & sector relevance', 'Venture stage alignment', 'Eligibility to review'].map(row => (
          <div key={row}><span>{row}</span>{icons.check}</div>
        ))}
      </div>
    );
  }
  if (panel === 'stage') {
    return (
      <div className="ls-mini">
        <div><strong>Ready</strong><span className="ls-pri on">Apply now</span></div>
        <div><span>Later</span><span className="ls-pri">After the next milestone</span></div>
      </div>
    );
  }
  if (panel === 'sector') {
    return (
      <div className="ls-canvas">
        <div><span>Sector</span><p>Closest fit, not a perfect taxonomy</p></div>
        <div><span>Based in</span><p>State schemes follow this</p></div>
        <div><span>National</span><p>Still appear on the shortlist</p></div>
        <div><span>Applicant</span><p>Who is allowed to apply</p></div>
      </div>
    );
  }
  return (
    <div className="ls-next">
      <span>Official page ↗</span>
      <p>Each ready match carries the provider, a short why, and the scheme site. We never submit the form.</p>
    </div>
  );
}
