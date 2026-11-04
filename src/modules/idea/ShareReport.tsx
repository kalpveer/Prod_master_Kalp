import { useEffect, useState } from 'react';
import ReportFrame from './ReportFrame';
import { ideaApi } from './ideaApi';
import type { IdeaAnswers } from './types';
import { VentureTheme } from '../venture/theme';

export default function ShareReport({ token }: { token: string }) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'missing' }
    | { status: 'error'; message: string }
    | { status: 'ready'; markdown: string; answers: IdeaAnswers; deckName: string | null }
  >({ status: 'loading' });

  useEffect(() => {
    document.title = 'Shared report · VentureLab';
    let alive = true;
    void ideaApi.getShared(token).then(row => {
      if (!alive) return;
      if (!row?.markdown) {
        setState({ status: 'missing' });
        return;
      }
      document.title = `${row.startup_name || row.title || 'Shared report'} · VentureLab`;
      setState({
        status: 'ready',
        markdown: row.markdown,
        deckName: row.deck_name,
        answers: {
          startupName: row.startup_name || '',
          idea: row.idea,
          audience: row.audience,
          different: row.different,
          stage: row.stage,
          revenue: row.revenue || '',
        },
      });
    }).catch(e => {
      if (!alive) return;
      const msg = (e as Error).message || '';
      if (/function|schema cache|permission denied/i.test(msg)) setState({ status: 'missing' });
      else setState({ status: 'error', message: msg });
    });
    return () => {
      alive = false;
    };
  }, [token]);

  const inner = state.status === 'loading' ? (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-label="Loading" />
    </div>
  ) : state.status !== 'ready' ? (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md">
        <h1 className="text-3xl font-light tracking-tight">This link is not available.</h1>
        <p className="mt-3 text-sm text-white/50">
          {state.status === 'error' ? state.message : 'The report may have been deleted, or the link is incomplete.'}
        </p>
      </div>
    </div>
  ) : (
    <ReportFrame
      markdown={state.markdown}
      answers={state.answers}
      deckName={state.deckName}
      shareOnly
    />
  );

  return <VentureTheme>{inner}</VentureTheme>;
}
