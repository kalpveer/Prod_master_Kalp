import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef, type CSSProperties } from 'react';
import './prisma-hero.css';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4';

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: CSSProperties;
}

export const WordsPullUp = ({ text, className = '', showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(' ');

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : '0.25em' }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: CSSProperties;
}

export const WordsPullUpMultiStyle = ({ segments, className = '', style }: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const words: { word: string; className?: string }[] = [];
  segments.forEach(seg => {
    seg.text.split(' ').forEach(w => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ''}`}
          style={{ marginRight: '0.25em' }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- Hero ---------------- */
export interface PrismaHeroNavItem {
  label: string;
  href: string;
}

export interface PrismaHeroProps {
  title?: string;
  showAsterisk?: boolean;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  /** Short line under the description. Full-screen landing only. */
  detail?: string;
  /** Small label above the description. Full-screen landing only. */
  eyebrow?: string;
  /** Quiet second action, kept in the banner so the page does not need another title row. */
  secondary?: { label: string; href: string };
  navItems?: PrismaHeroNavItem[];
  videoSrc?: string;
  /** Sits in the page header instead of covering the screen. */
  compact?: boolean;
  /** Fills its parent instead of the viewport. Used by the full-screen tool landing. */
  fill?: boolean;
}

const PrismaHero = ({
  title = 'Prisma',
  showAsterisk = true,
  description = 'Prisma is a worldwide network of visual artists, filmmakers and storytellers bound not by place, status or labels but by passion and hunger to unlock potential through our unique perspectives.',
  ctaLabel = 'Join the lab',
  ctaHref = '#',
  onCta,
  secondary,
  videoSrc = VIDEO_SRC,
  compact = false,
  fill = false,
  detail,
  eyebrow,
}: PrismaHeroProps) => {
  return (
    <section className={compact ? 'vl-hero h-full min-h-[240px] md:min-h-[280px] w-full' : fill ? 'vl-hero h-full w-full' : 'vl-hero h-dvh w-full'}>
      <div className={`relative h-full w-full overflow-hidden ${fill ? '' : compact ? 'rounded-3xl' : 'rounded-2xl md:rounded-[2rem]'}`}>

        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
        />

        {/* Noise overlay */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        {compact && <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/15" />}

        {/* Hero content */}
        <div className={compact
          ? 'relative z-10 flex h-full min-h-[280px] flex-col justify-end px-6 py-6 md:min-h-[300px] md:px-8 md:py-7'
          : fill
            ? 'absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-6 sm:pb-10 md:px-10 md:pb-12 lg:pb-14'
            : 'absolute bottom-0 left-0 right-0 px-4 pb-2 sm:px-6 md:px-10'}>
          <div className={compact
            ? 'flex flex-col items-start gap-4'
            : fill
              ? 'grid grid-cols-1 items-end gap-5 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-4'
              : 'grid grid-cols-12 items-end gap-4'}>

            <div className={compact ? '' : fill ? 'col-span-1 lg:col-span-7 lg:-translate-y-8 xl:-translate-y-12' : 'col-span-12 lg:col-span-8'}>
              <h1
                className={compact
                  ? 'font-medium leading-[0.9] tracking-[-0.05em] text-5xl sm:text-6xl'
                  : fill
                    ? 'font-medium leading-[0.85] tracking-[-0.07em] text-[18vw] sm:text-[16vw] md:text-[13vw] lg:text-[10vw] xl:text-[9vw]'
                    : 'font-medium leading-[0.85] tracking-[-0.07em] text-[22vw] sm:text-[20vw] md:text-[16vw] lg:text-[12vw] xl:text-[11vw]'}
                style={{ color: '#E1E0CC' }}
              >
                <WordsPullUp text={title} showAsterisk={showAsterisk} />
              </h1>
            </div>

            <div className={compact
              ? 'flex flex-col items-start gap-4 max-w-xl'
              : fill
                ? 'col-span-1 w-full max-w-xl pb-1 lg:col-span-5 lg:col-start-8 lg:max-w-none lg:pb-2'
                : 'col-span-12 flex flex-col gap-5 pb-8 lg:col-span-4 lg:pb-12'}>
              <div className={fill ? 'vl-landing-copy-glass flex flex-col gap-4' : 'flex flex-col gap-5'}>

              {!compact && eyebrow && (
                <motion.p
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[10px] font-medium uppercase tracking-[0.28em]"
                  style={{ color: fill ? 'rgba(225, 224, 204, 0.78)' : 'rgba(225, 224, 204, 0.7)' }}
                >
                  {eyebrow}
                </motion.p>
              )}

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={compact ? 'text-sm text-primary/80' : fill ? 'text-sm sm:text-base' : 'text-sm text-primary/80 sm:text-base'}
                style={{
                  lineHeight: compact ? 1.2 : 1.4,
                  ...(!compact && fill ? { color: 'rgba(225, 224, 204, 0.96)' } : {}),
                }}
              >
                {description}
              </motion.p>

              {!compact && detail && (
                <motion.p
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xs sm:text-sm"
                  style={{ color: fill ? 'rgba(225, 224, 204, 0.82)' : 'rgba(225, 224, 204, 0.62)', lineHeight: 1.45 }}
                >
                  {detail}
                </motion.p>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-0.5">
                <motion.a
                  href={ctaHref}
                  onClick={event => {
                    if (!onCta) return;
                    event.preventDefault();
                    onCta();
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className={`group inline-flex items-center gap-2 self-start rounded-full py-1 pl-5 pr-1 text-sm font-medium transition-all hover:gap-3 sm:text-base ${fill ? 'vl-landing-cta' : 'bg-primary text-black'}`}
                >
                  {ctaLabel}
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform group-hover:scale-110 sm:h-10 sm:w-10 ${fill ? 'vl-landing-cta-icon' : 'bg-black'}`}>
                    <ArrowRight className="h-4 w-4" style={{ color: '#E1E0CC' }} />
                  </span>
                </motion.a>
                {secondary && (
                  <a href={secondary.href} className="text-sm font-medium" style={{ color: 'rgba(225, 224, 204, 0.8)' }}>
                    {secondary.label}
                  </a>
                )}
              </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { PrismaHero };
