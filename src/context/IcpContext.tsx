/* eslint-disable */
import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { HOME_ICP_BY_ID, HOME_ICP_HASHES, type HomeIcpId } from '../data/icpHome';

interface IcpContextValue {
  selectedIcp: HomeIcpId | null;
  setSelectedIcp: (id: HomeIcpId | null, opts?: { syncHash?: boolean; scroll?: boolean }) => void;
}

const IcpContext = createContext<IcpContextValue | null>(null);

function isHomeIcpHash(hash: string): hash is HomeIcpId {
  return (HOME_ICP_HASHES as string[]).includes(hash);
}

export function IcpProvider({ children }: { children: ReactNode }) {
  const [selectedIcp, setSelectedIcpState] = useState<HomeIcpId | null>(null);

  const setSelectedIcp = useCallback(
    (id: HomeIcpId | null, opts?: { syncHash?: boolean; scroll?: boolean }) => {
      const syncHash = opts?.syncHash !== false;
      const scroll = opts?.scroll === true;

      setSelectedIcpState(id);

      if (syncHash && typeof window !== 'undefined') {
        const next = id ? `#${id}` : '#why-choose';
        if (window.location.hash !== next) {
          window.history.replaceState(null, '', next);
        }
      }

      if (scroll && typeof document !== 'undefined') {
        const el = document.getElementById('why-choose');
        if (el) {
          const lenis = (window as any).lenis;
          if (lenis?.scrollTo) {
            lenis.scrollTo(el, { offset: -20, duration: 1.1 });
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    },
    []
  );

  // Hydrate from hash on load / back-forward (shareable without full navigation)
  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, '');
      if (isHomeIcpHash(raw) && HOME_ICP_BY_ID[raw]) {
        setSelectedIcpState(raw);
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  return (
    <IcpContext.Provider value={{ selectedIcp, setSelectedIcp }}>
      {children}
    </IcpContext.Provider>
  );
}

export function useIcpSelection() {
  const ctx = useContext(IcpContext);
  if (!ctx) {
    throw new Error('useIcpSelection must be used within IcpProvider');
  }
  return ctx;
}
