export type LandingKind = 'idea' | 'grants';

export interface AudienceRow {
  id: string;
  title: string;
  body: string;
  outcome: string;
  icon: 'flag' | 'bulb' | 'cap';
  tone: 'ink' | 'plain' | 'soft';
}

export interface FeatureTab {
  id: string;
  title: string;
  blurb: string;
  kicker: string;
  heading: string;
  body: string;
  takeaway: string;
  panel: 'lens' | 'iq' | 'market' | 'model' | 'next' | 'grant-lens' | 'eligibility' | 'stage' | 'sector' | 'apply';
}

export interface FaqItem {
  id?: string;
  q: string;
  a: string;
}

export interface LandingStoryCopy {
  questions: string[];
  introEyebrow: string;
  introTitle: [string, string];
  introLead: string;
  introBody: string;
  introNote: string;
  audienceTitle: string;
  audienceSub: string;
  audiences: AudienceRow[];
  featuresEyebrow: string;
  featuresTitle: [string, string];
  featuresSub: string;
  featuresNote: string;
  tabs: FeatureTab[];
  featuresFoot: string;
  sampleHref?: string;
  sampleLabel?: string;
  benefitsEyebrow: string;
  benefitsTitle: [string, string];
  messy: string[];
  clarity: string;
  artCaption: string;
  benefits: { title: string; body: string }[];
  howEyebrow: string;
  howTitle: [string, string];
  howCta: string;
  steps: { title: string; body: string }[];
  useEyebrow: string;
  useTitle: string;
  useSub: string;
  uses: { icon: 'people' | 'grid' | 'bulb' | 'flag'; title: string; body: string }[];
  download?: {
    eyebrow: string;
    title: [string, string];
    body: string;
    primary: string;
    secondary: string;
    href: string;
    detail: string;
  };
  faqEyebrow: string;
  faqTitle: [string, string];
  faqSub: string;
  faqs: FaqItem[];
  finalEyebrow: string;
  finalTitle: [string, string];
  finalBody: string;
  finalCta: string;
  finalDetail: string;
  crossEyebrow: string;
  crossTitle: [string, string, string?];
  crossBody: string;
  crossHref: string;
  crossLink: string;
}

const SAMPLE = '/landing page design idea/sample-report.html';

export const landingStory: Record<LandingKind, LandingStoryCopy> = {
  idea: {
    questions: ['Who will buy?', 'What makes it different?', 'Can the model work?', 'What should I test first?'],
    introEyebrow: 'So, what is it?',
    introTitle: ['A reality check.', 'And a route forward.'],
    introLead: 'Your idea, examined from the angles that matter to building a venture.',
    introBody:
      'The Idea Validation Report brings your customer, competition, business model and biggest assumptions into one structured view. It uses AI-assisted research and Productica’s frameworks to help you see what’s promising, what needs work and what to do next.',
    introNote: 'More than a score to screenshot. A working starting point for your founder journey.',
    audienceTitle: 'Who is this report for?',
    audienceSub: 'A clear view of your idea.\nA practical next move.',
    audiences: [
      { id: 'founders', title: 'Early-stage startup founders', body: 'Validate your assumptions, sharpen your target customer and focus your next sprint.', outcome: 'Build with focus', icon: 'flag', tone: 'ink' },
      { id: 'aspiring', title: 'Aspiring entrepreneurs', body: 'Assess the market, competition and business potential before committing your time and money.', outcome: 'Start with clarity', icon: 'bulb', tone: 'plain' },
      { id: 'students', title: 'Students with ideas', body: 'Take your project or startup concept beyond the classroom with a clear validation plan.', outcome: 'Turn ideas into action', icon: 'cap', tone: 'soft' },
    ],
    featuresEyebrow: 'What’s inside your report',
    featuresTitle: ['Big questions.', 'Meet the deeper dive.'],
    featuresSub: 'Explore the thinking behind the report.',
    featuresNote: 'Examples below come from the SafePay sample.',
    tabs: [
      { id: 'lens', title: 'The Productica Lens', blurb: 'Understand the kind of venture you’re building.', kicker: 'The Productica Lens', heading: 'Your venture has a pattern. Understand what makes it work.', body: 'Discover your venture archetype and examine how well your idea fits the way customers buy — through tailwind, budget, reach, stickiness and trust.', takeaway: 'See which strengths to build on and which gaps need customer evidence.', panel: 'lens' },
      { id: 'iq', title: 'Syncoro IQ Test', blurb: 'Five quotients. A more rounded view.', kicker: 'Syncoro IQ Test', heading: 'One idea. Five dimensions. A sharper perspective.', body: 'Innovation, Value, Market, Profitability and X Factor are weighted into one score out of 10. The useful part is understanding what sits behind the number.', takeaway: 'A diagnostic of the idea and its evidence — not a test of your intelligence.', panel: 'iq' },
      { id: 'market', title: 'Your market, mapped', blurb: 'First buyers, market size and competition.', kicker: 'Customer & market intelligence', heading: '“Everyone” isn’t your first customer.', body: 'Prioritise customer segments, explore TAM / SAM / SOM and compare competitors and alternatives. Find a focused starting market and a reason to choose you.', takeaway: 'Know who to speak to first, and what to learn from them.', panel: 'market' },
      { id: 'model', title: 'The model & the “what ifs”', blurb: 'Lean Canvas, risky assumptions and premortem.', kicker: 'Business model & risk', heading: 'Connect the dots. Question the weak links.', body: 'See your model in a one-page Lean Canvas, then pressure-test its riskiest assumptions. A premortem asks how the venture could fail while you can still act.', takeaway: 'Turn the biggest unknowns into specific things to test.', panel: 'model' },
      { id: 'next', title: 'Readiness & next moves', blurb: 'Syncoro 3R, verdict and practical priorities.', kicker: 'Syncoro 3R & strategic next steps', heading: 'Know where you stand. Choose where to go.', body: 'Check Market, Growth and Investment Readiness. Bring the analysis together with a final scorecard, an honest verdict and clear do / don’t / consider priorities.', takeaway: 'A practical direction for your next experiment, sprint or mentor conversation.', panel: 'next' },
    ],
    featuresFoot: 'Research sources, explained sections and an honest view of evidence gaps.',
    sampleHref: SAMPLE,
    sampleLabel: 'Explore the complete sample',
    benefitsEyebrow: 'What you walk away with',
    benefitsTitle: ['Keep the ambition.', 'Upgrade the game plan.'],
    messy: ['build an app?', 'who pays?', 'too many features', 'launch when?', 'market size??'],
    clarity: 'My next move.',
    artCaption: 'Less mental tabs. More direction.',
    benefits: [
      { title: 'Find your strongest starting point.', body: 'Sharpen the customer, problem and value proposition worth exploring first.' },
      { title: 'Spend effort where it counts.', body: 'Prioritise the assumptions that matter before investing in features, branding or acquisition.' },
      { title: 'See the upside. Spot the gaps.', body: 'Understand the opportunity alongside the competition, trust barriers and business risks.' },
      { title: 'Move forward with better questions.', body: 'Make your next conversation, experiment or course correction more focused.' },
    ],
    howEyebrow: 'From idea to action',
    howTitle: ['You bring the idea.', 'Get a clearer way forward.'],
    howCta: 'Let’s get into it',
    steps: [
      { title: 'Put your idea into words.', body: 'Explain the problem, who faces it and how you plan to solve it. A rough idea is a starting point. A pitch deck is optional.' },
      { title: 'Explore the analysis.', body: 'Review the opportunity, pressure points and recommended direction. Pay attention to what still needs evidence.' },
      { title: 'Make the next move.', body: 'Use the report to plan customer conversations, refine your MVP and test what matters first — or send the same venture into Grants.' },
    ],
    useEyebrow: 'Don’t just read it. Use it.',
    useTitle: 'Put your report to work.',
    useSub: 'A useful report should make it into your next week’s to-do list.',
    uses: [
      { icon: 'people', title: 'Talk to the right people.', body: 'Use the segment priorities to choose your first customer interviews.' },
      { icon: 'grid', title: 'Build a leaner MVP.', body: 'Turn critical assumptions into tests before adding another feature.' },
      { icon: 'bulb', title: 'Make mentor time count.', body: 'Bring a clear model and specific questions to your next advisory session.' },
      { icon: 'flag', title: 'Shape a stronger pitch.', body: 'Build your story around the opportunity, the risks and the proof you’re gathering.' },
    ],
    download: {
      eyebrow: 'Preview now. Download instantly.',
      title: ['See what clarity', 'looks like.'],
      body: 'Get the complete Freelancer SafePay sample report. Explore the frameworks, scores and next steps at your own pace.',
      primary: 'Download sample report',
      secondary: 'Read it online',
      href: SAMPLE,
      detail: 'Instant HTML download · Opens in your browser · No sign-up for the sample',
    },
    faqEyebrow: 'A few good questions',
    faqTitle: ['Before you', 'jump in.'],
    faqSub: 'Curiosity is a good place to start.',
    faqs: [
      { q: 'How developed does my idea need to be?', a: 'Start with a problem, a potential customer and your proposed solution. You don’t need a polished pitch deck. More specific input gives the analysis a more useful starting point; gaps become questions to explore.' },
      { q: 'Is the Syncoro IQ Test a test of me?', a: 'No. It evaluates the venture idea across Innovation, Value, Market, Profitability and X Factor. The weighted score reflects the idea and the evidence available, not your personal intelligence or potential as a founder.' },
      { q: 'Does a low score mean I should drop my idea?', a: 'A score helps you identify what needs attention. A narrower customer segment, stronger evidence or a revised model may change the picture. In the sample, a pivot points toward a more focused opportunity and an experiment to test it.' },
      { q: 'Does the report replace customer validation?', a: 'The report is a starting point for it. AI-assisted public research can surface opportunities and assumptions, but interviews, experiments and paying customers supply evidence that research alone cannot.' },
      { id: 'faq-grants', q: 'How does Idea–Grants Matching help?', a: 'The Idea–Grants Matching Report helps identify grants potentially relevant to your idea. Use the shortlist to review each programme’s sector focus, venture stage, eligibility, deadlines and application requirements. Matching does not guarantee eligibility, selection or funding.' },
      { q: 'What can I download from this page?', a: 'You can instantly download the complete Freelancer SafePay sample as an HTML report and open it in your browser. To analyse your own idea, start a validation on this page.' },
    ],
    finalEyebrow: 'Your idea has a next chapter',
    finalTitle: ['Let’s find the', 'strongest version.'],
    finalBody: 'Keep the spark. Add a little clarity. Build from there.',
    finalCta: 'Start a validation',
    finalDetail: 'Sign in to run your own report. Three free validations on this account.',
    crossEyebrow: 'Idea–Grants Matching Report',
    crossTitle: ['Good idea.', 'Could there be', 'a grant for that?'],
    crossBody: 'Connect your idea with potentially relevant grants. Get a more focused funding shortlist, so your search starts with a direction — and fewer open tabs.',
    crossHref: '/grants',
    crossLink: 'See how idea–grant matching helps',
  },
  grants: {
    questions: ['Who can apply?', 'Which sector?', 'What stage is it?', 'Where is it based?'],
    introEyebrow: 'So, what is it?',
    introTitle: ['A shorter list.', 'A clearer search.'],
    introLead: 'Public schemes, filtered through the venture you already described.',
    introBody:
      'Grant Matching looks at sector, location, applicant type and stage, then returns a shortlist of public schemes that may fit — with why they were suggested and the official page. A saved validation can skip the venture questions so you do not describe the idea twice.',
    introNote: 'A relevant match is a starting point. Eligibility and selection remain with each grant provider.',
    audienceTitle: 'Who is grant matching for?',
    audienceSub: 'A focused shortlist.\nThe official page next.',
    audiences: [
      { id: 'early', title: 'Early-stage startups', body: 'Explore schemes that may support product development, prototyping and early business growth.', outcome: 'Find a first fit', icon: 'flag', tone: 'ink' },
      { id: 'students', title: 'Student entrepreneurs', body: 'Discover potentially relevant grants, student innovation schemes and support for eligible projects.', outcome: 'Start the search', icon: 'cap', tone: 'plain' },
      { id: 'growing', title: 'Growing businesses', body: 'Explore schemes that may fit your sector, location, registration status and stage of growth.', outcome: 'Compare options', icon: 'bulb', tone: 'soft' },
    ],
    featuresEyebrow: 'What’s inside a match',
    featuresTitle: ['Fewer tabs.', 'A shortlist you can use.'],
    featuresSub: 'The same matching lens the tool applies to your answers.',
    featuresNote: 'Matching is a starting point, not an approval.',
    tabs: [
      { id: 'grant-lens', title: 'Your matching lens', blurb: 'Idea, sector, stage and eligibility together.', kicker: 'Grant matching lens', heading: 'The shortlist starts from your venture, not a directory.', body: 'We read the idea, sector, where it is based and who is applying. A saved validation already holds the venture answers, so Grants only asks what it still needs.', takeaway: 'You see why a scheme appeared, not just that it exists.', panel: 'grant-lens' },
      { id: 'eligibility', title: 'Eligibility to review', blurb: 'What to check before you spend a week on forms.', kicker: 'Eligibility to review', heading: 'Know what still has to be true.', body: 'Each suggestion includes the criteria that matter: applicant type, location, sector focus and stage. You still confirm the details on the official page.', takeaway: 'Use the shortlist to decide which official pages are worth opening.', panel: 'eligibility' },
      { id: 'stage', title: 'Stage alignment', blurb: 'Schemes for where you are, and for later.', kicker: 'Venture stage', heading: 'Ready now, or useful later.', body: 'Some schemes fit a prototype. Others wait for revenue or a registered entity. Matches are marked ready or later so you do not apply too early.', takeaway: 'A later tag is a bookmark, not a rejection.', panel: 'stage' },
      { id: 'sector', title: 'Sector and place', blurb: 'National schemes still show. State schemes follow the base.', kicker: 'Sector & location', heading: 'Where you work changes what you can claim.', body: 'State schemes follow the base you pick. National schemes still appear. Sector is the closest fit, not a perfect taxonomy.', takeaway: 'If the list is thin, try a broader sector or add more detail to the venture.', panel: 'sector' },
      { id: 'apply', title: 'Official apply path', blurb: 'The real form lives on the scheme site.', kicker: 'Apply on the official site', heading: 'We stop at the official page.', body: 'Each ready match carries the provider, a short why, and a link to the scheme site. You verify dates, documents and eligibility there.', takeaway: 'Matching never submits an application or promises funding.', panel: 'apply' },
    ],
    featuresFoot: 'Saved shortlists stay on this account so you can reopen a match later.',
    benefitsEyebrow: 'What you walk away with',
    benefitsTitle: ['Spend less time', 'searching portals.'],
    messy: ['which portal?', 'am I eligible?', 'too many PDFs', 'deadline when?', 'state or centre?'],
    clarity: 'A shortlist to open.',
    artCaption: 'Fewer open tabs. A direction.',
    benefits: [
      { title: 'Discover relevant grants.', body: 'Explore funding opportunities based on your startup’s profile and the information available.' },
      { title: 'Understand eligibility.', body: 'Review key requirements and identify which criteria your business may need to meet.' },
      { title: 'Compare opportunities.', body: 'Examine available funding details, intended beneficiaries and scheme requirements where information is available.' },
      { title: 'Take the next step.', body: 'Open official scheme sources to verify details and continue with the application process.' },
    ],
    howEyebrow: 'From profile to shortlist',
    howTitle: ['You describe the venture.', 'We find possible fits.'],
    howCta: 'Match grants',
    steps: [
      { title: 'Tell us about the startup.', body: 'Share the venture, then sector, where it is based and who is applying. A saved validation can skip the venture questions.' },
      { title: 'Discover your matches.', body: 'Explore funding schemes that may align with your profile and the available eligibility information.' },
      { title: 'Review and apply.', body: 'Verify the scheme details through official sources and follow the relevant application process.' },
    ],
    useEyebrow: 'Don’t just save it. Use it.',
    useTitle: 'Put the shortlist to work.',
    useSub: 'A useful match should become a set of official pages you actually open.',
    uses: [
      { icon: 'people', title: 'Pick who is applying.', body: 'Some schemes are limited to students, DPIIT startups or a registered entity.' },
      { icon: 'grid', title: 'Compare ready vs later.', body: 'Apply where the stage already fits. Keep later schemes for the next milestone.' },
      { icon: 'bulb', title: 'Carry the venture over.', body: 'A validation already has the idea, audience and stage, so Grants does not ask them again.' },
      { icon: 'flag', title: 'Open the official page.', body: 'Dates, documents and the real form live with the grant provider, not here.' },
    ],
    faqEyebrow: 'A few good questions',
    faqTitle: ['Before you', 'run a match.'],
    faqSub: 'Matching is research, not a decision.',
    faqs: [
      { q: 'Do I need a validation first?', a: 'No. Grants can ask the same venture questions. A saved validation simply skips them and keeps both tools on one idea.' },
      { q: 'Does a match mean I am eligible?', a: 'No. A match is a starting point based on sector, location, applicant type and stage. You still confirm eligibility, deadlines and documents on the official page.' },
      { q: 'Why are some schemes marked later?', a: 'They may fit this sector or place, but not the current stage — for example they want revenue, a registered company, or a later prototype. Keep them for when that is true.' },
      { q: 'Can I start on Grants and validate later?', a: 'Yes. The venture answers carry over. Validate can reuse the name, idea, audience and stage you already typed.' },
      { q: 'Does matching apply for me?', a: 'No. We stop at the official page. Applications, selection and funding stay with each grant provider.' },
    ],
    finalEyebrow: 'Your next funding search',
    finalTitle: ['Start with a', 'direction.'],
    finalBody: 'Describe the venture once. Open the official pages that may actually fit.',
    finalCta: 'Match grants',
    finalDetail: 'Sign in to run a match. Shortlists are saved on this account.',
    crossEyebrow: 'Idea Validation Report',
    crossTitle: ['Need the venture', 'scored first?'],
    crossBody: 'Validate writes the customer, competition, model and next move. The same answers can come back here so Grants does not ask them again.',
    crossHref: '/idea',
    crossLink: 'See how idea validation works',
  },
};
