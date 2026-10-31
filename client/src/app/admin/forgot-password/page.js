'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { api } from '@/services/api';
import { Spinner } from '@/components/ui';
import AuthLayout from '@/components/auth/AuthLayout';
import MailPreview from '@/components/auth/MailPreview';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(null); // API response once sent
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setSent(await api.post('/auth/forgot-password', { email }));
    } catch (err) {
      setError(err.data?.errors?.[0]?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we’ll send you a link to choose a new one.">
      {sent ? (
        <div className="mt-8 space-y-4">
          <div className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{sent.message} The link works for 30 minutes.</p>
          </div>
          <MailPreview preview={sent.preview} kind="link" />
          <button type="button" className="a-btn-secondary w-full" onClick={() => setSent(null)}>Use a different email</button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="a-label">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input id="email" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className="a-input pl-9" placeholder="you@clinic.com" />
            </div>
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">{error}</p>}
          <button type="submit" disabled={loading || !email} className="a-btn-primary w-full">{loading && <Spinner />}Send reset link</button>
        </form>
      )}
      <Link href="/admin/login" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" />Back to sign in</Link>
    </AuthLayout>
  );
}
