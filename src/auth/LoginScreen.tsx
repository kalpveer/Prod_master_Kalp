import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { useAuth } from './useAuth';

const RESEND_SECONDS = 30;

// Surfaces errors Supabase puts in the URL hash when a magic link is expired or already used.
function hashError() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const desc = params.get('error_description');
  if (!desc) return '';
  return desc.toLowerCase().includes('expired') ? 'That sign-in link has expired. Request a new one.' : desc.replace(/\+/g, ' ');
}

export default function LoginScreen({ title }: { title: string }) {
  const { sendSignInEmail, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(hashError);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async () => {
    setBusy(true);
    setError('');
    const err = await sendSignInEmail(email);
    setBusy(false);
    if (err) return setError(err);
    setStep('sent');
    setCooldown(RESEND_SECONDS);
  };

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    if (email.includes('@') && !busy) void send();
  };

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6 || busy) return;
    setBusy(true);
    setError('');
    const err = await verifyCode(email, code);
    setBusy(false);
    if (err) setError(err); // on success the auth listener swaps this screen out
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <a href="/" className="text-lg font-semibold tracking-tight">Productica</a>
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">{title}</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-5">Sign in</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter leading-[1.02]">
            {step === 'email' ? <>Sign in to <span className="font-semibold">continue.</span></> : <>Check your <span className="font-semibold">inbox.</span></>}
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/50">
            {step === 'email'
              ? 'Enter your email and we’ll send you a sign-in link. Your reports are saved to your account, so you can come back to them any time.'
              : <>We sent a sign-in link to <span className="text-white/80">{email}</span>. Click it, or enter the code from the email below.</>}
          </p>

          {step === 'email' ? (
            <form onSubmit={submitEmail} className="mt-10">
              <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-2" htmlFor="login-email">Email</label>
              <input
                id="login-email" type="email" autoComplete="email" autoFocus required value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                className="w-full bg-transparent border-0 border-b border-white/30 focus:border-white/80 outline-none text-xl font-light placeholder:text-white/20 py-3 transition-colors"
              />
              <button
                type="submit" disabled={busy || !email.includes('@')}
                className="mt-8 flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <Mail size={16} /> {busy ? 'Sending…' : 'Send sign-in link'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitCode} className="mt-10">
              <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-2" htmlFor="login-code">Code from the email</label>
              <input
                id="login-code" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={8} value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456"
                className="w-full bg-transparent border-0 border-b border-white/30 focus:border-white/80 outline-none text-3xl font-light tracking-[0.4em] placeholder:text-white/20 placeholder:tracking-[0.4em] py-3 transition-colors"
              />
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="submit" disabled={busy || code.length < 6}
                  className="flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  {busy ? 'Checking…' : 'Verify code'} <ArrowRight size={16} />
                </button>
                <button
                  type="button" disabled={cooldown > 0 || busy} onClick={() => void send()}
                  className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
                </button>
              </div>
              <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }} className="mt-6 text-xs text-white/40 hover:text-white transition-colors">
                Use a different email
              </button>
            </form>
          )}

          {error && <p role="alert" className="mt-6 text-sm text-red-500">{error}</p>}
        </div>
      </main>
    </div>
  );
}
