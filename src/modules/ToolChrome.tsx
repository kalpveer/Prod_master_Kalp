import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import type { VentureTool } from './venture/landingGate';
import VentureLabLogo from './venture/VentureLabLogo';
import ToolSwitch from './venture/ToolSwitch';
import { useVentureTheme } from './venture/theme';

interface Props {
  active: VentureTool;
  account?: string | null;
  onSignOut: () => void;
}

export default function ToolChrome({ active, account, onSignOut }: Props) {
  const { theme, toggle } = useVentureTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const who = account?.trim() || 'Account';
  const initial = (who.match(/[A-Za-z0-9]/) || ['A'])[0].toUpperCase();

  return (
    <header className="vl-chrome">
      <div className="vl-chrome__bar">
        <VentureLabLogo
          surface={theme === 'dark' ? 'dark' : 'light'}
          imgClassName="h-[20px] w-auto object-contain md:h-[22px]"
        />
        <ToolSwitch active={active} />
        <div className="vl-chrome__end" ref={menuRef}>
          <button
            type="button"
            className="vl-account"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen(v => !v)}
          >
            <span className="vl-account__mark" aria-hidden>{initial}</span>
            <span className="vl-account__who">{who}</span>
            <ChevronDown size={14} aria-hidden />
          </button>
          {open && (
            <div className="vl-account__menu" role="menu">
              <button type="button" role="menuitem" onClick={() => { toggle(); setOpen(false); }}>
                {theme === 'dark' ? <Sun size={15} aria-hidden /> : <Moon size={15} aria-hidden />}
                {theme === 'dark' ? 'Light appearance' : 'Dark appearance'}
              </button>
              <button type="button" role="menuitem" onClick={() => { setOpen(false); onSignOut(); }}>
                <LogOut size={15} aria-hidden />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
