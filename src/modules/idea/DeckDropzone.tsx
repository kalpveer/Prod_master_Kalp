import { useRef, useState, type DragEvent } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { validateDeck } from './ideaApi';

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const prettySize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export default function DeckDropzone({ file, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const accept = (f: File | undefined | null) => {
    if (!f) return;
    const problem = validateDeck(f);
    setError(problem ?? '');
    if (!problem) onChange(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) accept(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <input
        ref={inputRef} type="file" className="hidden" disabled={disabled}
        accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={e => { accept(e.target.files?.[0]); e.target.value = ''; }}
      />

      {file ? (
        <div className="flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl border border-white/20 bg-white/[0.05] px-5 py-4">
          <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-none"><FileText size={18} /></span>
          <span className="min-w-0 flex-1 overflow-hidden">
            <span className="block truncate text-sm font-semibold">{file.name}</span>
            <span className="block text-xs text-white/40">{prettySize(file.size)}</span>
          </span>
          <button
            type="button" disabled={disabled} onClick={() => { onChange(null); setError(''); }} aria-label="Remove pitch deck"
            className="text-white/30 hover:text-white transition-colors disabled:pointer-events-none"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          type="button" disabled={disabled} onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
          onDragLeave={() => setDragging(false)} onDrop={onDrop}
          className={`w-full min-w-0 flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-dashed px-6 py-8 text-center transition-colors disabled:pointer-events-none ${
            dragging ? 'border-white/60 bg-white/10' : 'border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.05]'
          }`}
        >
          <Upload size={20} className="text-white/50" />
          <span className="max-w-full text-sm text-white/80">Drop your pitch deck here, or <span className="underline underline-offset-4">browse</span></span>
          <span className="max-w-full text-xs text-white/40 break-words">PDF or PowerPoint (.pptx) · up to 10 MB · we read the text of your slides</span>
        </button>
      )}

      {error && <p role="alert" className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
