import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import DeckDropzone from './DeckDropzone';
import { STAGES, type IdeaAnswers } from './types';

export type FormBusy = null | 'uploading' | 'starting';

interface Props {
  initial?: Partial<IdeaAnswers>;
  busy: FormBusy;
  error: string;
  /** Shown in place of the shortcut hint, and the form cannot be submitted. */
  blocked?: string;
  onSubmit: (answers: IdeaAnswers, deck: File | null) => void;
}

const MIN = { startupName: 2, idea: 20, audience: 3, different: 5 } as const;

function Field({ n, label, hint, optional, children }: { n: string; label: string; hint: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="grid gap-3">
      <div>
        <p className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
          <span>{n}</span>
          {optional && <span className="border border-white/15 rounded px-1.5 py-0.5 text-white/40 tracking-widest">Optional</span>}
        </p>
        <h3 className="mt-2 text-xl md:text-2xl font-light tracking-tight">{label}</h3>
        <p className="mt-1 text-sm text-white/40">{hint}</p>
      </div>
      {children}
    </div>
  );
}

const underline =
  'w-full bg-transparent border-0 border-b border-white/25 focus:border-white/80 outline-none resize-none text-lg md:text-xl font-light leading-relaxed placeholder:text-white/20 py-2 transition-colors disabled:opacity-50';

// Startup name, the four validation questions, and the optional pitch deck live in one window.
export default function IdeaForm({ initial, busy, error, blocked, onSubmit }: Props) {
  const [a, setA] = useState<IdeaAnswers>({ startupName: '', idea: '', audience: '', different: '', stage: '', ...initial });
  const [deck, setDeck] = useState<File | null>(null);
  const [touched, setTouched] = useState(false);
  const disabled = busy !== null || Boolean(blocked);

  const set = (k: keyof IdeaAnswers) => (v: string) => setA(p => ({ ...p, [k]: v }));
  const problems = {
    startupName: a.startupName.trim().length < MIN.startupName ? 'Name your startup.' : '',
    idea: a.idea.trim().length < MIN.idea ? 'Describe your idea in a bit more detail (a couple of sentences).' : '',
    audience: a.audience.trim().length < MIN.audience ? 'Tell us who this is for.' : '',
    different: a.different.trim().length < MIN.different ? 'Tell us what makes it different.' : '',
    stage: a.stage ? '' : 'Pick your current stage.',
  };
  const valid = !Object.values(problems).some(Boolean);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (disabled || blocked) return;
    if (!valid) return setTouched(true);
    onSubmit({
      startupName: a.startupName.trim(),
      idea: a.idea.trim(),
      audience: a.audience.trim(),
      different: a.different.trim(),
      stage: a.stage,
    }, deck);
  };

  const showErr = (k: keyof typeof problems) => touched && problems[k] && <p className="text-xs text-red-500">{problems[k]}</p>;

  return (
    <form
      onSubmit={submit}
      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-10 grid gap-10"
    >
      <Field n="01" label="Startup name" hint="A working name is fine.">
        <input
          value={a.startupName} onChange={e => set('startupName')(e.target.value)} disabled={disabled} maxLength={80}
          placeholder="e.g. Niva" className={underline}
        />
        {showErr('startupName')}
      </Field>

      <Field n="02" label="The idea" hint="What it is, and the problem it solves.">
        <textarea
          value={a.idea} onChange={e => set('idea')(e.target.value)} disabled={disabled} rows={4} maxLength={4000}
          placeholder="e.g. An app that tells freelancers how much they can safely withdraw each week…" className={underline}
        />
        {showErr('idea')}
      </Field>

      <Field n="03" label="Who is it for?" hint="Who they are, and where they are.">
        <textarea
          value={a.audience} onChange={e => set('audience')(e.target.value)} disabled={disabled} rows={2} maxLength={1500}
          placeholder="e.g. Solo freelancers and creators in the US and UK with irregular income" className={underline}
        />
        {showErr('audience')}
      </Field>

      <Field n="04" label="What is different?" hint="Why someone would pick this.">
        <textarea
          value={a.different} onChange={e => set('different')(e.target.value)} disabled={disabled} rows={3} maxLength={3000}
          placeholder="e.g. One safe-to-withdraw number tied to real income, with automatic tax set-asides" className={underline}
        />
        {showErr('different')}
      </Field>

      <Field n="05" label="Stage" hint="Where it is today.">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Current stage">
          {STAGES.map(s => {
            const sel = a.stage === s.label;
            return (
              <button
                key={s.label} type="button" role="radio" aria-checked={sel} disabled={disabled} onClick={() => set('stage')(s.label)} title={s.hint}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all active:scale-[0.97] disabled:pointer-events-none ${
                  sel ? 'border-white/40 bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]' : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white'
                }`}
              >
                {sel && <Check size={14} />} {s.label}
              </button>
            );
          })}
        </div>
        {showErr('stage')}
      </Field>

      <Field n="06" label="Pitch deck" hint="Optional. Used in the report if you add one." optional>
        <DeckDropzone file={deck} onChange={setDeck} disabled={disabled} />
      </Field>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
        <button
          type="submit" disabled={disabled}
          className="flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          {busy === 'uploading' ? 'Uploading your deck…' : busy === 'starting' ? 'Starting your report…' : 'Generate my report'}
          {!busy && !blocked && <ArrowRight size={16} />}
        </button>
        {blocked ? (
          <span className="text-sm text-white/50 max-w-sm">{blocked}</span>
        ) : (
          <span className="text-[11px] font-mono text-white/30">or press <span className="text-white/50">Ctrl / ⌘ + Enter</span></span>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-red-500 -mt-4">{error}</p>}
    </form>
  );
}
