import { useEffect } from 'react';
import { PrismaHero } from '@/components/ui/prisma-hero';

interface Props {
  title: string;
  eyebrow: string;
  description: string;
  detail: string;
  ctaLabel: string;
  onEnter: () => void;
}

/** Full-screen hero in front of a tool. The page does not scroll until the visitor continues. */
export default function ToolLanding({ title, eyebrow, description, detail, ctaLabel, onEnter }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    const prevHtml = root.style.overflow;
    const prevBody = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    lenis?.stop();
    return () => {
      root.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      lenis?.start();
    };
  }, []);

  return (
    <div className="vl-landing-screen vl-hero fixed inset-0 z-40 overflow-hidden" style={{ background: '#000' }}>
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
    </div>
  );
}
