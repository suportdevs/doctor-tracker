'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import RequirePermission from '@/components/auth/RequirePermission';
import { useForm } from '@/hooks/useForm';
import { Avatar, Badge, ConfirmDialog, Field, Modal, PageHeader, Pagination, Select, Spinner, TableSkeleton, Toggle } from '@/components/ui';
import { api } from '@/services/api';
import { ROLE_LABELS } from '@/constants';
import { useApi } from '@/hooks';
import { formatDate, timeAgo } from '@/lib/utils';

const ROLE_INFO = {
  admin: 'Full access to everything.',
  manager: 'Dashboard, doctors, patients and messages.',
  editor: 'Dashboard, website pages/menus/settings and messages.',
};

function UserForm({ user, onClose, onSaved }) {
  const form = useForm(user ? { ...user, password: '' } : { name: '', email: '', role: 'manager', isActive: true, password: '' });
  const { errors, bind, values } = form;

  const save = async (e) => {
    e.preventDefault();
    const body = { name: values.name, email: values.email, role: values.role, isActive: values.isActive, ...(values.password && { password: values.password }) };
    const saved = await form.submit(() => (user ? api.put(`/users/${user._id}`, body) : api.post('/users', body)), user ? 'User updated' : 'User created');
    if (saved) onSaved();
  };

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Name" htmlFor="name" error={errors.name}><input className="a-input" {...bind('name')} /></Field>
      <Field label="Email" htmlFor="email" error={errors.email}><input className="a-input" type="email" {...bind('email')} /></Field>
      <Field label="Role" htmlFor="role" error={errors.role} hint={ROLE_INFO[values.role]}>
        <Select id="role" value={values.role} onChange={(v) => form.set('role', v)} options={Object.entries(ROLE_LABELS)} />
      </Field>
      <Field label={user ? 'New password (optional)' : 'Password'} htmlFor="password" error={errors.password} hint="At least 8 characters.">
        <input className="a-input" type="password" autoComplete="new-password" {...bind('password')} />
      </Field>
      <div className="sm:col-span-2"><Toggle checked={values.isActive} onChange={(v) => form.set('isActive', v)} label="Active" description="Disabled users can’t sign in." /></div>
      <div className="flex justify-end gap-2 border-t border-ink-100 pt-4 dark:border-white/5 sm:col-span-2">
        <button type="button" className="a-btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="a-btn-primary" disabled={form.submitting}>{form.submitting && <Spinner />}Save</button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, mutate } = useApi('/users', { page });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const confirmDelete = async () => {
    try {
      await api.del(`/users/${deleting._id}`);
      toast.success('User deleted');
      setDeleting(null);
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <RequirePermission permission="users">
      <PageHeader title="Users" description="People who can sign in to this admin panel, and what each role may do."
        actions={<button type="button" className="a-btn-primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" />Add user</button>} />
      <div className="a-card overflow-hidden">
        <div className="a-scroll overflow-x-auto">
          <table className="a-table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last sign-in</th><th>Created</th><th className="text-right">Actions</th></tr></thead>
            {isLoading && !data ? <TableSkeleton cols={6} rows={3} /> : (
              <tbody>
                {data?.items.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div><p className="font-semibold text-ink-900 dark:text-white">{u.name}{u._id === me._id && <span className="ml-1 text-xs text-ink-400">(you)</span>}</p><p className="text-xs text-ink-400">{u.email}</p></div>
                      </div>
                    </td>
                    <td><Badge color={u.role === 'admin' ? 'brand' : 'blue'}>{ROLE_LABELS[u.role]}</Badge></td>
                    <td><Badge color={u.isActive ? 'green' : 'gray'} dot>{u.isActive ? 'Active' : 'Disabled'}</Badge></td>
                    <td className="text-ink-500">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never'}</td>
                    <td className="text-ink-500">{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditing(u)} className="a-btn-ghost a-btn-icon" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                        {u._id !== me._id && <button type="button" onClick={() => setDeleting(u)} className="a-btn-ghost a-btn-icon hover:text-rose-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <Pagination meta={data?.meta} onPage={setPage} />
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit user' : 'Add user'}>
        {editing && <UserForm key={editing._id || 'new'} user={editing._id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); mutate(); }} />}
      </Modal>
      <ConfirmDialog open={!!deleting} title="Delete user?" message={deleting && `${deleting.name} will no longer be able to sign in.`} onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
    </RequirePermission>
  );
}
