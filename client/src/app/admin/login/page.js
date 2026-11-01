'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { api, tokenStore } from '@/services/api';
import { Input, Spinner } from '@/components/ui';
import AuthLayout from '@/components/auth/AuthLayout';

const DEMO_EMAIL = 'admin@doctortracker.dev';
const DEMO_PASSWORD = 'Admin@123';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Only allow redirects back into the admin (never to another site).
  const next = params.get('next')?.startsWith('/admin') ? params.get('next') : '/admin';

  useEffect(() => {
    if (tokenStore.get()) router.replace(next);
  }, [router, next]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.post('/auth/login', form);
      tokenStore.set(token);
      router.replace(next);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage doctors and patients.">
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="a-label">Email</label>
          <Input icon={Mail} id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@clinic.com" />
        </div>
        <div>
          <label htmlFor="password" className="a-label">Password</label>
          <div className="relative">
            <Input icon={Lock} id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} inputClassName="pr-9" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">{error}</p>}
        <button type="submit" disabled={loading || !form.email || !form.password} className="a-btn-primary w-full">{loading && <Spinner />}Sign in</button>
      </form>

      <button
        type="button"
        onClick={() => setForm({ email: DEMO_EMAIL, password: DEMO_PASSWORD })}
        className="mt-8 w-full rounded-xl border border-dashed border-ink-200 p-4 text-left transition hover:bg-ink-50"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-ink-400">Demo account · click to fill</p>
        <p className="mt-2 text-sm"><span className="font-semibold text-ink-700">{DEMO_EMAIL}</span> <span className="text-ink-400">/ {DEMO_PASSWORD}</span></p>
      </button>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
