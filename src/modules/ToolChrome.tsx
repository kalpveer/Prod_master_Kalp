import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';

interface Props {
  active: 'idea' | 'grants';
  account?: string | null;
  onSignOut: () => void;
  children?: ReactNode;
}

const link = (on: boolean) =>
  `hover:text-white transition-colors ${on ? 'text-white' : 'text-white/40'}`;

export default function ToolChrome({ active, account, onSignOut, children }: Props) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 md:px-12 py-6 border-b border-white/10">
      <div className="flex items-center gap-8 min-w-0">
        <a href="/" className="text-lg font-semibold tracking-tight">Productica</a>
        <nav className="hidden md:flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest">
          <a href="/idea" className={link(active === 'idea')}>Idea validation</a>
          <a href="/grants" className={link(active === 'grants')}>Grants</a>
          {children}
        </nav>
      </div>
      <div className="flex items-center gap-4 min-w-0">
        <span className="hidden sm:block text-xs text-white/40 truncate">{account}</span>
        <button onClick={onSignOut} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </header>
  );
}
