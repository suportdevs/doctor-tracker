'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { api } from '@/services/api';
import { Spinner } from '@/components/ui';
import AuthLayout from '@/components/auth/AuthLayout';
import { cn } from '@/lib/utils';

// Simple strength hint: length, a number, upper + lower case, a symbol.
function strength(password) {
  const checks = [password.length >= 8, /\d/.test(password), /[a-z]/.test(password) && /[A-Z]/.test(password), /[^A-Za-z0-9]/.test(password)];
  return checks.filter(Boolean).length;
}
const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

function ResetForm() {
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const score = strength(password);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setDone(res.message);
    } catch (err) {
      setError(err.data?.errors?.[0]?.message || err.message);
    } finally {
      setLoading(false);
    }
    return undefined;
  };

  if (!token) {
    return (
      <AuthLayout title="Link missing" subtitle="This page needs the link from the reset email.">
        <Link href="/admin/forgot-password" className="a-btn-primary mt-8 w-full">Request a new link</Link>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Password updated">
        <div className="mt-8 flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><p>{done}</p></div>
        <Link href="/admin/login" className="a-btn-primary mt-4 w-full">Sign in</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="You’ll be signed out everywhere else.">
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="a-label">New password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input id="password" type={show ? 'text' : 'password'} autoComplete="new-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="a-input px-9" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={cn('h-1.5 flex-1 rounded-full', i <= score ? STRENGTH_COLOR[score] : 'bg-ink-200')} />)}</div>
              <span className="w-16 text-right text-xs font-medium text-ink-500">{STRENGTH[score]}</span>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="confirm" className="a-label">Confirm password</label>
          <input id="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="a-input" />
        </div>
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">{error}</p>}
        <button type="submit" disabled={loading || password.length < 8 || !confirm} className="a-btn-primary w-full">{loading && <Spinner />}Update password</button>
      </form>
      <Link href="/admin/login" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" />Back to sign in</Link>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
