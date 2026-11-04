/** VentureLab wordmarks in `public/venture/`. */
export const VENTURELAB_LOGO_WHITE = '/venture/venturelab-logo-white.png';
export const VENTURELAB_LOGO_BLACK = '/venture/venturelab-logo-black.png';

export type VentureLabLogoSurface = 'dark' | 'light';

export function ventureLabLogoSrc(surface: VentureLabLogoSurface) {
  return surface === 'light' ? VENTURELAB_LOGO_BLACK : VENTURELAB_LOGO_WHITE;
}

interface Props {
  /** Dark = white logo on dark backgrounds; light = black logo on light backgrounds. */
  surface?: VentureLabLogoSurface;
  href?: string;
  className?: string;
  imgClassName?: string;
  showProductica?: boolean;
  producticaClassName?: string;
}

export default function VentureLabLogo({
  surface = 'dark',
  href = '/',
  className = '',
  imgClassName = 'h-[18px] w-auto object-contain md:h-[22px]',
  showProductica = false,
  producticaClassName = 'block text-[10px] font-mono uppercase tracking-[0.22em] text-white/40',
}: Props) {
  const img = (
    <img
      src={ventureLabLogoSrc(surface)}
      alt="VentureLab"
      className={imgClassName}
      width={120}
      height={28}
      decoding="async"
    />
  );

  if (!href) {
    return (
      <span className={`inline-flex flex-col gap-1 leading-none ${className}`}>
        {showProductica && <span className={producticaClassName}>Productica</span>}
        {img}
      </span>
    );
  }

  return (
    <a href={href} className={`inline-flex flex-col gap-1 shrink-0 leading-none ${className}`}>
      {showProductica && <span className={producticaClassName}>Productica</span>}
      {img}
    </a>
  );
}
