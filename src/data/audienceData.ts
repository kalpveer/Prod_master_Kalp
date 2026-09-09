import {
  Lightbulb,
  Search,
  Users,
  Target,
  BarChart,
  LineChart,
  ClipboardList,
  MessageSquare,
  Activity,
  BookOpen,
  Globe,
  PieChart,
  ShieldAlert,
  Scale,
  Zap,
  TrendingUp,
  FileText,
  Building2
} from 'lucide-react';

export type AudienceSegment = 'founders' | 'incubators' | 'investors' | 'researchers' | 'universities';

export interface AudienceData {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    trustIndicators: string[];
  };
  problems: {
    title: string;
    intro?: string;
    list: string[];
  };
  howItHelps: {
    title: string;
    subtitle?: string;
    cards: {
      icon: React.ComponentType<any>;
      title: string;
      desc: string;
    }[];
  };
  deliverables: {
    title: string;
    list: string[];
  };
  whyProductica: {
    title: string;
    desc: string;
    checkmarks: string[];
  };
  finalCta: {
    headline: string;
    cta: string;
  };
}

const sharedWhyProductica = {
  title: 'Why Productica?',
  desc: 'Unlike generic AI tools that generate surface-level answers, Productica combines market intelligence, startup frameworks, commercialization expertise, and structured reasoning to deliver actionable decisions-not just information.',
  checkmarks: [
    'Built specifically for innovation ecosystems',
    'Evidence-backed recommendations',
    'Structured reports, not chat responses',
    'Trusted by founders, researchers, universities, and incubators'
  ]
};

export const audienceData: Record<AudienceSegment, AudienceData> = {
  founders: {
    hero: {
      headline: 'Build What the Market Actually Wants.',
      subheadline: 'Validate your startup idea, discover product-market fit, evaluate competition, and build a business backed by evidence-not assumptions.',
      cta: 'Validate Your Startup',
      trustIndicators: ['✔ AI-powered market intelligence', '✔ Structured reports', '✔ Built for innovation ecosystems'],
    },
    problems: {
      title: 'The Reality for Founders',
      intro: 'Most startups don\'t fail because they can\'t build. They fail because they build something nobody wants.',
      list: [
        'No product-market fit',
        'No ICP clarity',
        'Weak GTM strategy',
        'Poor pricing',
        'Unknown competitors',
        'Building on intuition'
      ]
    },
    howItHelps: {
      title: 'How Productica Helps',
      cards: [
        { icon: Lightbulb, title: 'Validate Before You Build', desc: 'Know whether your idea deserves your time.' },
        { icon: Target, title: 'Discover Product-Market Fit', desc: 'Find who truly needs your product.' },
        { icon: Users, title: 'Identify Your Ideal Customer', desc: 'Stop selling to everyone.' },
        { icon: BarChart, title: 'Analyze Competitors', desc: 'Understand where the market is saturated and where opportunities exist.' },
        { icon: TrendingUp, title: 'Build Your GTM Strategy', desc: 'Receive actionable recommendations instead of generic advice.' },
        { icon: ClipboardList, title: 'Prepare for Investors', desc: 'Generate reports that help answer difficult due diligence questions.' }
      ]
    },
    deliverables: {
      title: 'What You Receive',
      list: [
        'Market Validation Report',
        'PMF Score',
        'TAM / SAM / SOM',
        'Customer Personas',
        'Competitor Landscape',
        'Pricing Insights',
        'GTM Strategy',
        'Risk Assessment',
        'Opportunity Matrix',
        'Investor Readiness Report'
      ]
    },
    whyProductica: sharedWhyProductica,
    finalCta: {
      headline: 'Build with confidence-not assumptions.',
      cta: 'Validate My Startup'
    }
  },
  incubators: {
    hero: {
      headline: 'Empower Every Startup in Your Incubator.',
      subheadline: 'Help founders validate ideas faster, mentor more effectively, and improve startup success rates.',
      cta: 'Partner with Productica',
      trustIndicators: ['✔ AI-powered market intelligence', '✔ Structured reports', '✔ Built for innovation ecosystems'],
    },
    problems: {
      title: 'The Reality for Incubators',
      intro: 'Incubators support dozens or hundreds of startups. Mentors often spend time answering the same strategic questions repeatedly.',
      list: [
        'Unvalidated startups',
        'Repetitive mentoring',
        'Weak commercialization',
        'Poor market understanding',
        'Low funding readiness',
        'Limited ecosystem analytics'
      ]
    },
    howItHelps: {
      title: 'How Productica Helps',
      subtitle: '',
      cards: [
        { icon: FileText, title: 'Standardized Validation', desc: 'Every startup begins with a structured market assessment.' },
        { icon: MessageSquare, title: 'Better Mentorship', desc: 'Mentors spend less time explaining basics and more time creating impact.' },
        { icon: Activity, title: 'Startup Monitoring', desc: 'Track validation progress across every startup.' },
        { icon: LineChart, title: 'Funding Readiness', desc: 'Prepare startups before investor meetings.' },
        { icon: Globe, title: 'Research Commercialization', desc: 'Support faculty innovations alongside startups.' },
        { icon: PieChart, title: 'Institutional Analytics', desc: 'Understand ecosystem trends across your incubator.' }
      ]
    },
    deliverables: {
      title: 'Benefits',
      list: [
        'Better startup quality',
        'Faster validation',
        'Improved mentor productivity',
        'Higher investment readiness',
        'Data-driven incubation',
        'Centralized reporting'
      ]
    },
    whyProductica: sharedWhyProductica,
    finalCta: {
      headline: 'Build a stronger startup ecosystem.',
      cta: 'Partner with Productica'
    }
  },
  researchers: {
    hero: {
      headline: 'Transform Research into Real-World Innovation.',
      subheadline: 'Commercialize your research with market intelligence, validation, and commercialization support.',
      cta: 'Commercialize My Research',
      trustIndicators: ['✔ AI-powered market intelligence', '✔ Structured reports', '✔ Built for innovation ecosystems'],
    },
    problems: {
      title: 'The Reality for Researchers',
      intro: 'Thousands of valuable research projects never reach industry.',
      list: [
        'Unknown market demand',
        'Commercialization uncertainty',
        'Licensing challenges',
        'Startup viability',
        'Customer discovery',
        'Industry mapping'
      ]
    },
    howItHelps: {
      title: 'How Productica Helps',
      cards: [
        { icon: BarChart, title: 'Commercialization Analysis', desc: 'Evaluate whether your research solves a real market problem.' },
        { icon: Search, title: 'Industry Opportunity Mapping', desc: 'Identify industries that can adopt your innovation.' },
        { icon: ShieldAlert, title: 'Patent Intelligence', desc: 'Understand novelty and competitive landscape.' },
        { icon: Lightbulb, title: 'Startup Potential', desc: 'Know whether your research can become a venture.' },
        { icon: Target, title: 'Commercialization Roadmap', desc: 'Clear next steps after publication.' },
        { icon: Zap, title: 'Technology Positioning', desc: 'Understand how to position your innovation.' }
      ]
    },
    deliverables: {
      title: 'What You Receive',
      list: [
        'Market Validation',
        'Industry Mapping',
        'Customer Discovery',
        'Commercialization Strategy',
        'Startup Readiness',
        'Licensing Opportunities',
        'Competitive Landscape',
        'Technology Positioning'
      ]
    },
    whyProductica: sharedWhyProductica,
    finalCta: {
      headline: 'Research deserves impact beyond publications.',
      cta: 'Explore Commercialization'
    }
  },
  investors: {
    hero: {
      headline: 'Reduce Risk Before You Invest.',
      subheadline: 'Evaluate startups using structured market intelligence and evidence-backed validation.',
      cta: 'Strengthen Due Diligence',
      trustIndicators: ['✔ AI-powered market intelligence', '✔ Structured reports', '✔ Built for innovation ecosystems'],
    },
    problems: {
      title: 'The Reality for Investors',
      intro: 'Early-stage investing is filled with uncertainty.',
      list: [
        'Optimistic assumptions',
        'Weak market validation',
        'Inflated TAM',
        'Poor competitor research',
        'Hidden risks',
        'Limited due diligence'
      ]
    },
    howItHelps: {
      title: 'How Productica Helps',
      cards: [
        { icon: Scale, title: 'Independent Validation', desc: 'Verify founder claims.' },
        { icon: Target, title: 'Product-Market Assessment', desc: 'Understand whether customers actually need the solution.' },
        { icon: Search, title: 'Competitive Intelligence', desc: 'Measure market positioning.' },
        { icon: ShieldAlert, title: 'Risk Analysis', desc: 'Identify hidden weaknesses before investing.' },
        { icon: FileText, title: 'Due Diligence Support', desc: 'Receive structured reports alongside founder decks.' },
        { icon: Activity, title: 'Portfolio Monitoring', desc: 'Track startup validation over time.' }
      ]
    },
    deliverables: {
      title: 'Reports Include',
      list: [
        'Market Opportunity',
        'PMF Analysis',
        'Customer Validation',
        'Competitive Landscape',
        'Risk Matrix',
        'Market Timing',
        'Business Model Review',
        'Investment Readiness'
      ]
    },
    whyProductica: sharedWhyProductica,
    finalCta: {
      headline: 'Invest with more confidence.',
      cta: 'Request Investor Access'
    }
  },
  universities: {
    hero: {
      headline: 'Accelerate Innovation Across Campus.',
      subheadline: 'Support student founders, faculty innovators, and university spinouts through AI-powered market validation.',
      cta: 'Bring Productica to Campus',
      trustIndicators: ['✔ AI-powered market intelligence', '✔ Structured reports', '✔ Built for innovation ecosystems'],
    },
    problems: {
      title: 'The Reality for Universities',
      intro: 'Universities produce incredible ideas. Only a small fraction become companies.',
      list: [
        'Low commercialization',
        'Weak entrepreneurship support',
        'No market validation',
        'Limited startup guidance',
        'Poor investor readiness',
        'Fragmented innovation ecosystem'
      ]
    },
    howItHelps: {
      title: 'How Productica Helps',
      cards: [
        { icon: Users, title: 'Student Entrepreneurship', desc: 'Validate startup ideas before hackathons or incubation.' },
        { icon: Lightbulb, title: 'Faculty Innovation', desc: 'Help research reach industry.' },
        { icon: Zap, title: 'Spinout Support', desc: 'Evaluate commercialization opportunities.' },
        { icon: BookOpen, title: 'Entrepreneurship Programs', desc: 'Provide AI-powered startup guidance at scale.' },
        { icon: Building2, title: 'Incubation Integration', desc: 'Support campus incubators with structured validation.' },
        { icon: LineChart, title: 'Innovation Analytics', desc: 'Measure entrepreneurial outcomes institution-wide.' }
      ]
    },
    deliverables: {
      title: 'Benefits',
      list: [
        'Better startup success rates',
        'Increased research commercialization',
        'Stronger innovation ecosystem',
        'Improved entrepreneurship education',
        'Faster spinout creation',
        'Better industry collaboration'
      ]
    },
    whyProductica: sharedWhyProductica,
    finalCta: {
      headline: 'Build the next generation of innovators.',
      cta: 'Partner With Productica'
    }
  }
};
