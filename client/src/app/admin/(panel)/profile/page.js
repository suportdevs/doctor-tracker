'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { MailCheck, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from '@/hooks/useForm';
import { Badge, Card, Field, PageHeader, Spinner } from '@/components/ui';
import CodeInput from '@/components/auth/CodeInput';
import MailPreview from '@/components/auth/MailPreview';
import { api, tokenStore } from '@/services/api';
import { ROLE_LABELS } from '@/constants';

function ProfileForm() {
  const { user, setUser } = useAuth();
  const form = useForm({ name: user.name, email: user.email });

  const save = async (e) => {
    e.preventDefault();
    const res = await form.submit((values) => api.put('/auth/me', values), 'Profile updated');
    if (res) setUser(res.user);
  };

  return (
    <Card title="Profile" description={`Role: ${ROLE_LABELS[user.role]}`}>
      <form onSubmit={save} className="space-y-4" noValidate>
        <Field label="Name" htmlFor="name" error={form.errors.name}><input className="a-input" {...form.bind('name')} /></Field>
        <Field label="Email" htmlFor="email" error={form.errors.email}><input className="a-input" type="email" {...form.bind('email')} /></Field>
        <button type="submit" className="a-btn-primary" disabled={form.submitting}>{form.submitting && <Spinner />}Save profile</button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const form = useForm({ currentPassword: '', newPassword: '', confirm: '' });

  const save = async (e) => {
    e.preventDefault();
    const res = await form.submit(({ currentPassword, newPassword, confirm }) => {
      if (newPassword !== confirm) throw Object.assign(new Error('Passwords do not match'), { data: { errors: [{ path: 'confirm', message: 'Passwords do not match' }] } });
      return api.put('/auth/me/password', { currentPassword, newPassword });
    }, 'Password changed — other devices were signed out');
    if (res) {
      // Changing the password ends older sessions; this one continues with the fresh token.
      if (res.token) tokenStore.set(res.token);
      form.reset();
    }
  };

  return (
    <Card title="Change password" description="Signs you out on every other device.">
      <form onSubmit={save} className="space-y-4" noValidate>
        <Field label="Current password" htmlFor="currentPassword" error={form.errors.currentPassword}><input className="a-input" type="password" autoComplete="current-password" {...form.bind('currentPassword')} /></Field>
        <Field label="New password" htmlFor="newPassword" error={form.errors.newPassword} hint="At least 8 characters."><input className="a-input" type="password" autoComplete="new-password" {...form.bind('newPassword')} /></Field>
        <Field label="Confirm new password" htmlFor="confirm" error={form.errors.confirm}><input className="a-input" type="password" autoComplete="new-password" {...form.bind('confirm')} /></Field>
        <button type="submit" className="a-btn-primary" disabled={form.submitting}>{form.submitting && <Spinner />}Update password</button>
      </form>
    </Card>
  );
}

/**
 * Two-factor authentication by email. Turning it on: we email a code, the user types it back
 * (proves the inbox works). Turning it off asks for the password.
 */
function TwoFactorCard() {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState('idle'); // idle | code | disable
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (request) => {
    setBusy(true);
    setError('');
    try {
      return await request();
    } catch (err) {
      setError(err.data?.errors?.[0]?.message || err.message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const start = async () => {
    const res = await run(() => api.post('/auth/me/2fa/setup'));
    if (!res) return;
    toast.success(res.message);
    setPreview(res.preview || '');
    setCode('');
    setStep('code');
  };

  const enable = async (e) => {
    e.preventDefault();
    const res = await run(() => api.post('/auth/me/2fa/enable', { code }));
    if (!res) return;
    setUser(res.user);
    toast.success(res.message);
    setStep('idle');
  };

  const disable = async (e) => {
    e.preventDefault();
    const res = await run(() => api.post('/auth/me/2fa/disable', { password }));
    if (!res) return;
    setUser(res.user);
    toast.success(res.message);
    setPassword('');
    setStep('idle');
  };

  const on = user.twoFactorEnabled;

  return (
    <Card
      className="lg:col-span-2"
      title="Two-factor authentication"
      description="After your password, we email you a 6-digit code at every sign-in."
      actions={<Badge color={on ? 'green' : 'gray'} dot>{on ? 'On' : 'Off'}</Badge>}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${on ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-ink-100 text-ink-500 dark:bg-white/5'}`}>
          {on ? <ShieldCheck className="h-6 w-6" /> : <ShieldOff className="h-6 w-6" />}
        </span>

        <div className="min-w-0 flex-1 space-y-4">
          {step === 'idle' && (
            <>
              <p className="text-sm text-ink-600 dark:text-ink-300">
                {on
                  ? <>Codes are sent to <b>{user.email}</b>. Even if someone learns your password, they can’t sign in without your inbox.</>
                  : <>Add a second step to sign-in. Codes go to <b>{user.email}</b> and expire after 10 minutes.</>}
              </p>
              {on
                ? <button type="button" className="a-btn-secondary text-rose-600" onClick={() => { setStep('disable'); setError(''); }}><ShieldOff className="h-4 w-4" />Turn off</button>
                : <button type="button" className="a-btn-primary" onClick={start} disabled={busy}>{busy ? <Spinner /> : <MailCheck className="h-4 w-4" />}Turn on — email me a code</button>}
            </>
          )}

          {step === 'code' && (
            <form onSubmit={enable} className="max-w-sm space-y-3" noValidate>
              <p className="text-sm text-ink-600 dark:text-ink-300">Enter the code we just emailed to confirm.</p>
              <MailPreview preview={preview} />
              <CodeInput value={code} onChange={setCode} autoFocus />
              {error && <p className="text-sm font-medium text-rose-600" role="alert">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="a-btn-primary" disabled={busy || code.length !== 6}>{busy && <Spinner />}Confirm & turn on</button>
                <button type="button" className="a-btn-ghost" onClick={start} disabled={busy}>Resend code</button>
                <button type="button" className="a-btn-ghost" onClick={() => setStep('idle')}>Cancel</button>
              </div>
            </form>
          )}

          {step === 'disable' && (
            <form onSubmit={disable} className="max-w-sm space-y-3" noValidate>
              <Field label="Confirm with your password" htmlFor="twofa-password">
                <input id="twofa-password" className="a-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              </Field>
              {error && <p className="text-sm font-medium text-rose-600" role="alert">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" className="a-btn-danger" disabled={busy || !password}>{busy && <Spinner />}Turn off 2FA</button>
                <button type="button" className="a-btn-ghost" onClick={() => setStep('idle')}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="My profile" description="Your details, password and sign-in security." />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <ProfileForm />
        <PasswordForm />
        <TwoFactorCard />
      </div>
    </>
  );
}
