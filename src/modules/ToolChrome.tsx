import type { ReactNode } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { grantsHref, ideaHref, markWorkspaceOpen } from './venture/landingGate';
import VentureLabLogo from './venture/VentureLabLogo';
import { useVentureTheme } from './venture/theme';

interface Props {
  active: 'idea' | 'grants';
  account?: string | null;
  onSignOut: () => void;
  children?: ReactNode;
}

const tab = (on: boolean) =>
  `rounded-full px-3 py-1.5 transition-colors ${on ? 'bg-white text-black' : 'text-white/55 hover:text-white'}`;

export default function ToolChrome({ active, account, onSignOut, children }: Props) {
  const { theme, toggle } = useVentureTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
        <VentureLabLogo
          surface={theme === 'dark' ? 'dark' : 'light'}
          showProductica
          imgClassName="h-[18px] w-auto object-contain md:h-[21px]"
        />

        <nav className="flex items-center gap-1 text-sm">
          <a href={ideaHref()} onClick={markWorkspaceOpen} aria-current={active === 'idea' ? 'page' : undefined} className={tab(active === 'idea')}>Validate</a>
          <a href={grantsHref()} onClick={markWorkspaceOpen} aria-current={active === 'grants' ? 'page' : undefined} className={tab(active === 'grants')}>Grants</a>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-3 min-w-0">
          <div className="hidden lg:flex items-center gap-4 text-xs text-white/45">
            {children}
          </div>
          <span className="hidden md:block max-w-[140px] truncate text-xs text-white/45">{account}</span>
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={onSignOut} className="flex items-center gap-1.5 text-xs text-white/55 hover:text-white">
            <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
