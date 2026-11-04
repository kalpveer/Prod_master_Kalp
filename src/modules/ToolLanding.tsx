import { ChevronDown } from 'lucide-react';
import { PrismaHero } from '@/components/ui/prisma-hero';
import ToolStory from './venture/ToolStory';

interface Props {
  kind: 'idea' | 'grants';
  title: string;
  eyebrow: string;
  description: string;
  detail: string;
  ctaLabel: string;
  onEnter: () => void;
}

function scrollToStory() {
  const el = document.getElementById('story');
  if (!el) return;
  const lenis = (window as unknown as { lenis?: { scrollTo: (target: Element, opts?: object) => void } }).lenis;
  if (lenis?.scrollTo) lenis.scrollTo(el, { offset: 0, duration: 1.15 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

/** Full-screen hero, then the tool story. */
export default function ToolLanding({ kind, title, eyebrow, description, detail, ctaLabel, onEnter }: Props) {
  return (
    <div>
      <div className="vl-landing-screen vl-hero relative h-dvh overflow-hidden" style={{ background: '#000' }}>
      <PrismaHero
        fill
        title={title}
        eyebrow={eyebrow}
        description={description}
        detail={detail}
        ctaLabel={ctaLabel}
        ctaHref="#"
        onCta={onEnter}
      />
      <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 md:pt-4">
        <div className="vl-landing-island pointer-events-auto flex items-center gap-2.5 rounded-full py-2 pl-4 pr-2 md:gap-3 md:pl-5">
          <span className="vl-landing-island__label text-[13px] font-semibold tracking-tight md:text-sm">
            VentureLab
          </span>
          <span className="vl-landing-island__rule h-3 w-px shrink-0" aria-hidden />
          <button type="button" onClick={onEnter} className="vl-landing-island__try">
            Try
          </button>
        </div>
      </header>
      <button
        type="button"
        className="vl-landing-scroll"
        onClick={scrollToStory}
        aria-label="Scroll to the story"
      >
        <span className="vl-landing-scroll__ring" aria-hidden>
          <span className="vl-landing-scroll__track">
            <span className="vl-landing-scroll__bead" />
          </span>
        </span>
        <span className="vl-landing-scroll__label">
          Scroll
          <ChevronDown size={11} strokeWidth={2.4} />
        </span>
      </button>
      </div>
      <ToolStory kind={kind} onCta={onEnter} />
    </div>
  );
}
