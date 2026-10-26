import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { normalizeUsername, validatePassword, validateUsername } from './redirect';

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
  return (
    <div className="mt-8 first:mt-10">
      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-2" htmlFor={id}>{label}</label>
      <input
        id={id} type={type} autoComplete={autoComplete} autoFocus={autoFocus} required value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-white/30 focus:border-white/80 outline-none text-xl font-light placeholder:text-white/20 py-3 transition-colors"
      />
    </div>
  );
}

const isCredentialFail = (message: string) => {
  const m = message.toLowerCase();
  return m.includes('incorrect') || m.includes('invalid login') || m.includes('invalid credentials') || m.includes('not found');
};

export default function LoginScreen({ title }: { title: string }) {
  const { signIn, signUp, requestPasswordReset, updatePassword, passwordRecovery } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
    const missing = id.includes('@') ? 'Add a username and confirm your password to create the account.' : 'Add your email and confirm your password to create the account.';
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
    setBusy(true);
    setError('');
    const err = await signUp({ username, email, password });
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
  const needConfirm = !confirm;
  const signupCopy = needUsername
    ? 'We kept your email and password. Add a username and confirm the password.'
    : needEmail
      ? 'We kept your username and password. Add your email and confirm the password.'
      : 'Confirm the password, then create the account.';

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
      ? (notice ? signupCopy : 'Username, email, and a password. Your reports stay on this account.')
      : mode === 'forgot'
        ? 'Enter the email on your account. We will send a reset link to this same site — not to localhost.'
        : 'Use your username or email, and your password. New here? Sign in anyway — we will move you to create an account.';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <a href="/" className="text-lg font-semibold tracking-tight">Productica</a>
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">{title}</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md">
          {!passwordRecovery && (
            <div className="flex items-center gap-6 mb-8 text-[10px] font-mono uppercase tracking-[0.25em]">
              <button type="button" onClick={toSignIn} className={mode === 'signin' ? 'text-white' : 'text-white/35 hover:text-white'}>Sign in</button>
              <button type="button" onClick={() => toSignUp(identifier || email || username, '')} className={mode === 'signup' ? 'text-white' : 'text-white/35 hover:text-white'}>Create account</button>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-light tracking-tighter leading-[1.02]">{heading}</h1>
          <p className="mt-4 text-sm md:text-base text-white/50">{copy}</p>

          {passwordRecovery ? (
            <form onSubmit={onRecovery}>
              <Field id="new-password" label="New password" type="password" autoComplete="new-password" autoFocus value={nextPassword} onChange={setNextPassword} placeholder="At least 8 characters" />
              <Field id="new-password-confirm" label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={setConfirm} />
              <button type="submit" disabled={busy || nextPassword.length < 8} className="mt-8 flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none">
                {busy ? 'Saving…' : 'Save password'} <ArrowRight size={16} />
              </button>
            </form>
          ) : mode === 'signup' ? (
            <form onSubmit={onSignUp}>
              <Field id="signup-username" label="Username" type="text" autoComplete="username" autoFocus={needUsername} value={username} onChange={setUsername} placeholder="yourname" />
              <Field id="signup-email" label="Email" type="email" autoComplete="email" autoFocus={!needUsername && needEmail} value={email} onChange={setEmail} placeholder="you@company.com" />
              <Field id="signup-password" label="Password" type="password" autoComplete="new-password" value={password} onChange={setPassword} placeholder="Letter + number, 8+ characters" />
              <Field id="signup-confirm" label="Confirm password" type="password" autoComplete="new-password" autoFocus={!needUsername && !needEmail && needConfirm} value={confirm} onChange={setConfirm} />
              <button type="submit" disabled={busy || !email.includes('@') || !username || password.length < 8 || !confirm} className="mt-8 flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none">
                {busy ? 'Creating…' : 'Create account'} <ArrowRight size={16} />
              </button>
            </form>
          ) : mode === 'forgot' ? (
            <form onSubmit={onForgot}>
              <Field id="forgot-email" label="Email" type="email" autoComplete="email" autoFocus value={email} onChange={setEmail} placeholder="you@company.com" />
              <button type="submit" disabled={busy || !email.includes('@')} className="mt-8 flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none">
                {busy ? 'Sending…' : 'Send reset link'} <ArrowRight size={16} />
              </button>
              <button type="button" onClick={toSignIn} className="mt-6 text-xs text-white/40 hover:text-white transition-colors">Back to sign in</button>
            </form>
          ) : (
            <form onSubmit={onSignIn}>
              <Field id="login-id" label="Username or email" type="text" autoComplete="username" autoFocus value={identifier} onChange={setIdentifier} placeholder="yourname or you@company.com" />
              <Field id="login-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={setPassword} />
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button type="submit" disabled={busy || !identifier || !password} className="flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-white/90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none">
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
