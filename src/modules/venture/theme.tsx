import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import './venture.css';

export type VentureThemeName = 'light' | 'dark';

const KEY = 'productica.venturelab.theme';

interface ThemeValue {
  theme: VentureThemeName;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

function initialTheme(): VentureThemeName {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* private mode */
  }
  return 'light';
}

export function VentureTheme({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<VentureThemeName>(initialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* private mode */
    }
  }, [theme]);

  const value: ThemeValue = {
    theme,
    toggle: () => setTheme(current => (current === 'dark' ? 'light' : 'dark')),
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className="vl" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useVentureTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useVentureTheme must be used inside VentureTheme');
  return ctx;
}
