import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { useVentureTheme } from '../modules/venture/theme';
import { useAuth } from './useAuth';
import { normalizePhone, normalizeUsername, validatePassword, validatePhone, validateUsername } from './redirect';

type Mode = 'signin' | 'signup' | 'forgot';

function Field({
  id, label, type, value, onChange, autoComplete, autoFocus, placeholder,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [shown, setShown] = useState(false);
  const secret = type === 'password';
  return (
    <div className="mt-3 first:mt-4">
      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-1" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id} type={secret && shown ? 'text' : type} autoComplete={autoComplete} autoFocus={autoFocus} required value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full bg-transparent border-0 border-b border-white/30 focus:border-white/80 outline-none text-lg font-light placeholder:text-white/20 py-1.5 transition-colors ${secret ? 'pr-10' : ''}`}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShown(v => !v)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-pressed={shown}
            className="absolute right-0 bottom-1.5 text-white/40 hover:text-white transition-colors"
          >
            {shown ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

const isCredentialFail = (message: string) => {
  const m = message.toLowerCase();
  return m.includes('incorrect') || m.includes('invalid login') || m.includes('invalid credentials') || m.includes('not found');
};

export default function LoginScreen({ title }: { title: string }) {
  const { signIn, signUp, requestPasswordReset, updatePassword, passwordRecovery } = useAuth();
  const { theme, toggle } = useVentureTheme();
  const [mode, setMode] = useState<Mode>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const applyIdentifier = (raw: string) => {
    const value = raw.trim();
    if (value.includes('@')) {
      setEmail(value.toLowerCase());
      return;
    }
    if (value) setUsername(normalizeUsername(value));
  };

  const toSignIn = () => {
    setMode('signin');
    setError('');
    setNotice('');
    setIdentifier(identifier || email || username);
  };

  const toSignUp = (from: string, why: string) => {
    applyIdentifier(from);
    setMode('signup');
    setError('');
    setNotice(why);
    setConfirm('');
  };

  const onSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    const err = await signIn(identifier, password);
    if (!err) {
      setBusy(false);
      return;
    }

    if (!isCredentialFail(err)) {
      setBusy(false);
      setError(err);
      return;
    }

    const id = identifier.trim();
    if (!id.includes('@')) {
      try {
        const { data: free } = await getSupabase().rpc('username_available', { p_username: normalizeUsername(id) });
        if (free === false) {
          setBusy(false);
          setError('Username or password is incorrect.');
          return;
        }
      } catch {
        // If the username check is unavailable, still offer sign-up instead of a dead end.
      }
    }

    setBusy(false);
    const missing = id.includes('@')
      ? 'Add a username, your phone number, and confirm the password.'
      : 'Add your email, your phone number, and confirm the password.';
    toSignUp(id, `No account yet. We kept what you typed. ${missing}`);
  };

  const onSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const nameErr = validateUsername(username);
    if (nameErr) return setError(nameErr);
    const passErr = validatePassword(password);
    if (passErr) return setError(passErr);
    if (password !== confirm) return setError('Passwords do not match.');
    const phoneErr = validatePhone(phone);
    if (phoneErr) return setError(phoneErr);
    setBusy(true);
    setError('');
    const err = await signUp({ username, email, password, phone });
    setBusy(false);
    if (err) {
      if (err.toLowerCase().includes('already')) {
        setIdentifier(email);
        setMode('signin');
        setNotice('');
        setError('That email already has an account. Check your password and sign in.');
        return;
      }
      if (err.toLowerCase().includes('account created')) {
        setMode('signin');
        setPassword('');
        setConfirm('');
        setError('');
        setNotice(err);
        setIdentifier(email);
        return;
      }
      setError(err);
    }
  };

  const onForgot = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const err = await requestPasswordReset(email);
    setBusy(false);
    if (err) return setError(err);
    setNotice('If an account exists for that email, we sent a reset link. Open it on this same device.');
  };

  const onRecovery = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const passErr = validatePassword(nextPassword);
    if (passErr) return setError(passErr);
    if (nextPassword !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    setError('');
    const err = await updatePassword(nextPassword);
    setBusy(false);
    if (err) setError(err);
  };

  const needUsername = !username.trim();
  const needEmail = !email.includes('@');
  const needPhone = !normalizePhone(phone);
  const needConfirm = !confirm;
  const signupCopy = notice
    ? 'We kept what you already typed. Fill the rest, including your phone number. It is saved on the account and is not used to sign in.'
    : 'Username, email, password, and a phone number. The number is saved on your account. Sign-in stays username or email.';

  const heading = passwordRecovery
    ? <>Set a <span className="font-semibold">new password.</span></>
    : mode === 'signup'
      ? notice
        ? <>Finish creating your <span className="font-semibold">account.</span></>
        : <>Create your <span className="font-semibold">account.</span></>
      : mode === 'forgot'
        ? <>Reset your <span className="font-semibold">password.</span></>
        : <>Sign in to <span className="font-semibold">continue.</span></>;

  const copy = passwordRecovery
    ? 'Choose a new password for this account. You will stay signed in after it is saved.'
    : mode === 'signup'
      ? signupCopy
      : mode === 'forgot'
        ? 'Enter the email on your account. We will send a reset link to this same site — not to localhost.'
        : '';

  useEffect(() => {
    const root = document.documentElement;
    const prevHtml = root.style.overflow;
    const prevBody = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    lenis?.stop();
    return () => {
      root.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      lenis?.start();
    };
  }, []);

  return (
    <div className="h-dvh overflow-hidden bg-black text-white flex flex-col selection:bg-white selection:text-black relative">
      <div className="vl-auth-glow" style={{ width: 460, height: 460, top: -140, left: -120, background: '#d9d3c4', opacity: 0.55 }} />
      <div className="vl-auth-glow" style={{ width: 380, height: 380, right: -120, bottom: -80, background: '#8ea0ae', opacity: 0.4 }} />
      <header className="relative z-10 shrink-0 flex items-center justify-between gap-4 px-6 md:px-12 py-4">
        <a href="/" className="leading-none">
          <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">Productica</span>
          <span className="block text-base font-semibold tracking-tight">VentureLab</span>
        </a>
        <div className="flex items-center gap-3">
          <nav className="hidden sm:flex items-center gap-3 text-sm text-white/50">
            <a href="/idea" className="hover:text-white">Validate</a>
            <a href="/grants" className="hover:text-white">Grants</a>
          </nav>
          <button type="button" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">{title}</span>
        </div>
      </header>

      <main className="relative z-10 min-h-0 flex-1 flex items-center justify-center px-6 py-3">
        <div className="vl-glass w-full max-w-md rounded-3xl px-6 py-4 md:px-8 md:py-5">
          {!passwordRecovery && (
            <div className="flex items-center gap-6 mb-4 text-[10px] font-mono uppercase tracking-[0.25em]">
              <button type="button" onClick={toSignIn} className={mode === 'signin' ? 'text-white' : 'text-white/35 hover:text-white'}>Sign in</button>
              <button type="button" onClick={() => toSignUp(identifier || email || username, '')} className={mode === 'signup' ? 'text-white' : 'text-white/35 hover:text-white'}>Create account</button>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-light tracking-tighter leading-[1.02]">{heading}</h1>
          {copy && <p className="mt-2 text-sm text-white/50">{copy}</p>}

          {passwordRecovery ? (
            <form onSubmit={onRecovery}>
              <Field id="new-password" label="New password" type="password" autoComplete="new-password" autoFocus value={nextPassword} onChange={setNextPassword} placeholder="At least 8 characters" />
              <Field id="new-password-confirm" label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={setConfirm} />
              <button type="submit" disabled={busy || nextPassword.length < 8} className="mt-5 flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none">
                {busy ? 'Saving…' : 'Save password'} <ArrowRight size={16} />
              </button>
            </form>
          ) : mode === 'signup' ? (
            <form onSubmit={onSignUp}>
              <Field id="signup-username" label="Username" type="text" autoComplete="username" autoFocus={needUsername} value={username} onChange={setUsername} placeholder="yourname" />
              <Field id="signup-email" label="Email" type="email" autoComplete="email" autoFocus={!needUsername && needEmail} value={email} onChange={setEmail} placeholder="you@company.com" />
              <Field id="signup-phone" label="Phone number" type="tel" autoComplete="tel" autoFocus={!needUsername && !needEmail && needPhone} value={phone} onChange={setPhone} placeholder="98765 43210" />
              <Field id="signup-password" label="Password" type="password" autoComplete="new-password" value={password} onChange={setPassword} placeholder="Letter + number, 8+ characters" />
              <Field id="signup-confirm" label="Confirm password" type="password" autoComplete="new-password" autoFocus={!needUsername && !needEmail && !needPhone && needConfirm} value={confirm} onChange={setConfirm} />
              <button type="submit" disabled={busy || !email.includes('@') || !username || password.length < 8 || !confirm || needPhone} className="mt-5 flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none">
                {busy ? 'Creating…' : 'Create account'} <ArrowRight size={16} />
              </button>
            </form>
          ) : mode === 'forgot' ? (
            <form onSubmit={onForgot}>
              <Field id="forgot-email" label="Email" type="email" autoComplete="email" autoFocus value={email} onChange={setEmail} placeholder="you@company.com" />
              <button type="submit" disabled={busy || !email.includes('@')} className="mt-5 flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none">
                {busy ? 'Sending…' : 'Send reset link'} <ArrowRight size={16} />
              </button>
              <button type="button" onClick={toSignIn} className="mt-6 text-xs text-white/40 hover:text-white transition-colors">Back to sign in</button>
            </form>
          ) : (
            <form onSubmit={onSignIn}>
              <Field id="login-id" label="Username or email" type="text" autoComplete="username" autoFocus value={identifier} onChange={setIdentifier} placeholder="yourname or you@company.com" />
              <Field id="login-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={setPassword} />
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button type="submit" disabled={busy || !identifier || !password} className="flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none">
                  {busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} />
                </button>
                <button type="button" onClick={() => { applyIdentifier(identifier); setMode('forgot'); setError(''); setNotice(''); }} className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                  Forgot password
                </button>
              </div>
            </form>
          )}

          {notice && <p className="mt-6 text-sm text-white/60">{notice}</p>}
          {error && <p role="alert" className="mt-6 text-sm text-red-500">{error}</p>}
        </div>
      </main>
    </div>
  );
}
