'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { api, tokenStore } from '@/services/api';
import { Spinner } from '@/components/ui';
import AuthLayout from '@/components/auth/AuthLayout';
import CodeInput from '@/components/auth/CodeInput';
import MailPreview from '@/components/auth/MailPreview';

const DEMO = [
  ['Administrator', 'admin@doctortracker.dev'],
  ['Clinic manager', 'manager@doctortracker.dev'],
  ['Website editor', 'editor@doctortracker.dev'],
];

// Second step when two-factor authentication is on: the code emailed to the user.
function CodeStep({ twoFactor, onDone, onBack }) {
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState(twoFactor.preview);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const verify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.post('/auth/login/verify', { challenge: twoFactor.challenge, code });
      onDone(token);
    } catch (err) {
      setError(err.data?.errors?.[0]?.message || err.message);
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    try {
      const res = await api.post('/auth/login/resend', { challenge: twoFactor.challenge });
      setPreview(res.preview);
      setResent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={verify} className="mt-8 space-y-4" noValidate>
      <p className="text-sm text-ink-600">We emailed a 6-digit code to <b>{twoFactor.email}</b>. It expires in 10 minutes.</p>
      <MailPreview preview={preview} />
      <CodeInput value={code} onChange={setCode} autoFocus />
      {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">{error}</p>}
      <button type="submit" disabled={loading || code.length !== 6} className="a-btn-primary w-full">{loading && <Spinner />}Verify & sign in</button>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 font-medium text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" />Back</button>
        <button type="button" onClick={resend} className="font-semibold text-brand-600 hover:text-brand-700">{resent ? 'Code sent again ✓' : 'Resend code'}</button>
      </div>
    </form>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactor, setTwoFactor] = useState(null); // { challenge, email, preview } when a code is needed

  // Only allow redirects back into the admin (never to another site).
  const next = params.get('next')?.startsWith('/admin') ? params.get('next') : '/admin';

  useEffect(() => {
    if (tokenStore.get()) router.replace(next);
  }, [router, next]);

  const finish = (token) => {
    tokenStore.set(token);
    router.replace(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      if (res.twoFactor) {
        setTwoFactor(res);
        setLoading(false);
      } else {
        finish(res.token);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (twoFactor) {
    return (
      <AuthLayout title="Check your email" subtitle="Two-factor authentication is on for this account.">
        <CodeStep twoFactor={twoFactor} onDone={finish} onBack={() => setTwoFactor(null)} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your clinic and website.">
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="a-label">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="a-input pl-9" placeholder="you@clinic.com" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="a-label">Password</label>
            <Link href="/admin/forgot-password" className="mb-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="a-input px-9" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">{error}</p>}
        <button type="submit" disabled={loading || !form.email || !form.password} className="a-btn-primary w-full">{loading && <Spinner />}Sign in</button>
      </form>

      <div className="mt-8 rounded-2xl border border-ink-200/70 bg-ink-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-ink-400">Demo accounts · password Admin@123</p>
        <div className="mt-3 space-y-1.5">
          {DEMO.map(([role, email]) => (
            <button key={email} type="button" onClick={() => setForm({ email, password: 'Admin@123' })} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-white">
              <span className="font-semibold text-ink-700">{role}</span><span className="text-xs text-ink-400">{email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
