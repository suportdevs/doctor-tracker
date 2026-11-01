'use client';

import { useAuth } from '@/context/AuthContext';
import { useForm } from '@/hooks/useForm';
import { Lock, Mail, UserRound } from 'lucide-react';
import { Card, Field, Input, PageHeader, Spinner } from '@/components/ui';
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
        <Field label="Name" htmlFor="name" error={form.errors.name}><Input icon={UserRound} {...form.bind('name')} /></Field>
        <Field label="Email" htmlFor="email" error={form.errors.email}><Input icon={Mail} type="email" {...form.bind('email')} /></Field>
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
        <Field label="Current password" htmlFor="currentPassword" error={form.errors.currentPassword}><Input icon={Lock} type="password" autoComplete="current-password" {...form.bind('currentPassword')} /></Field>
        <Field label="New password" htmlFor="newPassword" error={form.errors.newPassword} hint="At least 8 characters."><Input icon={Lock} type="password" autoComplete="new-password" {...form.bind('newPassword')} /></Field>
        <Field label="Confirm new password" htmlFor="confirm" error={form.errors.confirm}><Input icon={Lock} type="password" autoComplete="new-password" {...form.bind('confirm')} /></Field>
        <button type="submit" className="a-btn-primary" disabled={form.submitting}>{form.submitting && <Spinner />}Update password</button>
      </form>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="My profile" description="Your details and password." />
      <div className="grid max-w-4xl items-start gap-6 lg:grid-cols-2">
        <ProfileForm />
        <PasswordForm />
      </div>
    </>
  );
}
