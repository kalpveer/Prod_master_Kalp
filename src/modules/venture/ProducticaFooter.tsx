import { grantsHref, ideaHref, markWorkspaceOpen } from './landingGate';
import VentureLabLogo from './VentureLabLogo';

const company = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Privacy Policy', href: '/terms#privacy' },
  { label: 'Terms', href: '/terms' },
];

const socials = [
  { label: 'Twitter', href: 'https://x.com/Productica_in' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/productica-ai/' },
  { label: 'Instagram', href: 'https://www.instagram.com/productica.in/' },
];

type FooterTone = 'light' | 'dark';

const toneStyles: Record<
  FooterTone,
  { shell: string; copy: string; label: string; link: string; rule: string; copyright: string }
> = {
  light: {
    shell: 'border-t border-black/10',
    copy: 'text-black/55',
    label: 'text-black/35',
    link: 'text-black/65 hover:text-black',
    rule: 'bg-black/15',
    copyright: 'border-t border-black/10 text-black/40',
  },
  dark: {
    shell: 'border-t border-white/10',
    copy: 'text-white/55',
    label: 'text-white/35',
    link: 'text-white/70 hover:text-white',
    rule: 'bg-white/25',
    copyright: 'border-t border-white/10 text-white/35',
  },
};

export default function ProducticaFooter({ tone = 'dark' }: { tone?: FooterTone }) {
  const t = toneStyles[tone];
  const logoSurface = tone === 'light' ? 'light' : 'dark';

  return (
    <footer className={t.shell}>
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              <a href="/" className="inline-flex items-center gap-2.5 shrink-0">
                <img src="/8.png" alt="" className="h-8 w-8 rounded-md object-cover md:h-9 md:w-9" />
                <span
                  className={`text-sm font-semibold tracking-tight ${tone === 'light' ? 'text-neutral-900' : 'text-white'}`}
                >
                  Productica
                </span>
              </a>
              <span className={`hidden h-6 w-px shrink-0 sm:block ${t.rule}`} aria-hidden />
              <VentureLabLogo
                href="/"
                surface={logoSurface}
                imgClassName="h-8 w-auto object-contain md:h-9"
              />
            </div>
            <p className={`mt-5 max-w-sm text-sm leading-relaxed ${t.copy}`}>
              Tools and insights to help founders validate ideas, discover opportunities, and build smarter.
            </p>
          </div>

          <nav aria-label="Tools">
            <p className={`text-[10px] font-mono uppercase tracking-[0.25em] ${t.label}`}>Tools</p>
            <ul className="mt-4 grid gap-2.5">
              <li>
                <a href={ideaHref()} onClick={markWorkspaceOpen} className={`text-sm transition-colors ${t.link}`}>
                  Idea Validation
                </a>
              </li>
              <li>
                <a href={grantsHref()} onClick={markWorkspaceOpen} className={`text-sm transition-colors ${t.link}`}>
                  Grant Matching
                </a>
              </li>
            </ul>
          </nav>
          <FooterColumn title="Company" links={company} tone={tone} />
          <FooterColumn title="Social" links={socials} external tone={tone} />
        </div>

        <p className={`mt-12 pt-6 text-xs font-mono ${t.copyright}`}>
          © {new Date().getFullYear()} Productica Ai Pvt. Ltd.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  external,
  tone,
}: {
  title: string;
  links: { label: string; href: string }[];
  external?: boolean;
  tone: FooterTone;
}) {
  const t = toneStyles[tone];
  return (
    <nav aria-label={title}>
      <p className={`text-[10px] font-mono uppercase tracking-[0.25em] ${t.label}`}>{title}</p>
      <ul className="mt-4 grid gap-2.5">
        {links.map(link => (
          <li key={link.label}>
            <a
              href={link.href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={`text-sm transition-colors ${t.link}`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
