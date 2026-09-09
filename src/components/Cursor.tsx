/* eslint-disable */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hide native OS cursor
    document.documentElement.style.cursor = 'none';

    // ── Move: dot is instant, ring lags slightly ──
    const onMove = (e: MouseEvent) => {
      setVisible(true);

      // Dot — no lag, sits exactly on pointer
      gsap.set(dotRef.current, { x: e.clientX, y: e.clientY });

      // Ring — soft follow
      gsap.to(ringRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.18,
        ease: 'power3.out',
      });
    };

    // ── Hover: ring expands + fills, dot disappears ──
    const onOver = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('a, button')) return;
      gsap.to(ringRef.current, {
        scale: 2.2,
        opacity: 0.6,
        duration: 0.35,
        ease: 'power2.out',
      });
      gsap.to(dotRef.current, {
        scale: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
    };

    const onOut = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('a, button')) return;
      gsap.to(ringRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
      });
      gsap.to(dotRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'back.out(2)',
      });
    };

    // ── Click: quick squeeze on ring ──
    const onClick = () => {
      gsap.timeline()
        .to(ringRef.current, { scale: 0.7, duration: 0.1, ease: 'power2.in' })
        .to(ringRef.current, { scale: 1,   duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click',     onClick);
    document.addEventListener('mouseover',  onOver);
    document.addEventListener('mouseout',   onOut);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click',     onClick);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mouseout',   onOut);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  const base: React.CSSProperties = {
    position:     'fixed',
    top:          0,
    left:         0,
    mixBlendMode: 'difference',
    pointerEvents:'none',
  };

  return (
    <div
      className="hidden md:block"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
    >
      {/* Small solid dot — sits exactly on pointer */}
      <div
        ref={dotRef}
        style={{
          ...base,
          width:         '6px',
          height:        '6px',
          borderRadius:  '50%',
          background:    'white',
          transform:     'translate(-50%, -50%)',
          zIndex:        9999,
        }}
      />

      {/* Hollow ring — lags behind */}
      <div
        ref={ringRef}
        style={{
          ...base,
          width:         '32px',
          height:        '32px',
          borderRadius:  '50%',
          border:        '1.5px solid white',
          transform:     'translate(-50%, -50%)',
          zIndex:        9998,
        }}
      />
    </div>
  );
}
