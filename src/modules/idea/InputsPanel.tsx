import type { IdeaAnswers } from './types';

const rows: { key: keyof IdeaAnswers; label: string }[] = [
  { key: 'startupName', label: 'Startup' },
  { key: 'idea', label: 'The idea' },
  { key: 'audience', label: 'Who it is for' },
  { key: 'different', label: 'What is different' },
  { key: 'stage', label: 'Stage' },
  { key: 'revenue', label: 'Revenue' },
];

export default function InputsPanel({
  answers,
  deckName,
}: {
  answers: IdeaAnswers;
  deckName?: string | null;
}) {
  return (
    <aside className="vl-inputs" data-lenis-prevent>
      <p className="vl-inputs__kicker">What you submitted</p>
      <dl>
        {rows.map(({ key, label }) => {
          const value = answers[key]?.trim();
          if (!value) return null;
          return (
            <div key={key} className="vl-inputs__row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          );
        })}
        {deckName && (
          <div className="vl-inputs__row">
            <dt>Pitch deck</dt>
            <dd>{deckName}</dd>
          </div>
        )}
      </dl>
    </aside>
  );
}
