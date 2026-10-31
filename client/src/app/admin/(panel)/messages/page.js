'use client';

import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { CalendarDays, Check, Inbox, Mail, Phone, Reply, Stethoscope, Trash2 } from 'lucide-react';
import FilterBar from '@/components/common/FilterBar';
import RequirePermission from '@/components/auth/RequirePermission';
import { Badge, ConfirmDialog, EmptyState, PageHeader, Pagination, Select } from '@/components/ui';
import { api } from '@/services/api';
import { useApi, useUrlFilters } from '@/hooks';
import { cn, formatDate, timeAgo } from '@/lib/utils';

const STATUS = { unread: ['brand', 'Unread'], read: ['gray', 'Read'], replied: ['green', 'Replied'] };

function Messages() {
  const [filters, setFilters, reset] = useUrlFilters({ q: '', status: '', kind: '', page: 1 });
  const { data, mutate } = useApi('/messages', filters);
  const [openId, setOpenId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const setStatus = async (message, status) => {
    try {
      await api.patch(`/messages/${message._id}`, { status });
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggle = (m) => {
    setOpenId(openId === m._id ? null : m._id);
    if (m.status === 'unread') setStatus(m, 'read');
  };

  const confirmDelete = async () => {
    try {
      await api.del(`/messages/${deleting._id}`);
      toast.success('Message deleted');
      setDeleting(null);
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader title="Messages" description="Contact messages and appointment requests sent from the website." />
      <div className="a-card overflow-hidden">
        <FilterBar search={filters.q} onSearch={(q) => setFilters({ q })} placeholder="Search messages…" active={['q', 'status', 'kind'].filter((k) => filters[k]).length} onReset={reset}>
          <Select value={filters.kind} onChange={(v) => setFilters({ kind: v })} placeholder="All types" options={[['appointment', 'Appointments'], ['contact', 'Contact']]} className="lg:w-40" aria-label="Type" />
          <Select value={filters.status} onChange={(v) => setFilters({ status: v })} placeholder="Any status" options={Object.entries(STATUS).map(([v, [, l]]) => [v, l])} className="lg:w-36" aria-label="Status" />
        </FilterBar>
        {data?.items.length === 0 && <EmptyState icon={Inbox} title="No messages" description="Messages from the website’s contact and appointment forms appear here." />}
        <ul className="divide-y divide-ink-100 dark:divide-white/5">
          {data?.items.map((m) => (
            <li key={m._id}>
              <button type="button" onClick={() => toggle(m)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ink-50/70 dark:hover:bg-white/[.02]">
                <span className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', m.status === 'unread' ? 'bg-brand-600' : 'bg-transparent')} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={cn('text-ink-900 dark:text-white', m.status === 'unread' ? 'font-bold' : 'font-semibold')}>{m.name}</span>
                    <Badge color={m.kind === 'appointment' ? 'blue' : 'gray'}>{m.kind === 'appointment' ? 'Appointment' : 'Contact'}</Badge>
                    <Badge color={STATUS[m.status][0]}>{STATUS[m.status][1]}</Badge>
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-500">{m.subject ? `${m.subject} — ` : ''}{m.message}</span>
                </span>
                <span className="shrink-0 text-xs text-ink-400">{timeAgo(m.createdAt)}</span>
              </button>
              {openId === m._id && (
                <div className="animate-fade-in border-t border-ink-100 bg-ink-50/50 px-4 py-4 pl-9 dark:border-white/5 dark:bg-white/[.02]">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600 dark:text-ink-300">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 hover:text-brand-600"><Mail className="h-4 w-4" />{m.email}</a>
                    {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-brand-600"><Phone className="h-4 w-4" />{m.phone}</a>}
                    {m.doctor && <span className="flex items-center gap-1.5"><Stethoscope className="h-4 w-4" />{m.doctor.name} · {m.doctor.specialization}</span>}
                    {m.preferredDate && <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Preferred: {formatDate(m.preferredDate)}</span>}
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-800 dark:text-ink-100">{m.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || (m.kind === 'appointment' ? 'Your appointment request' : 'Your message')}`)}`} onClick={() => setStatus(m, 'replied')} className="a-btn-primary h-9"><Reply className="h-4 w-4" />Reply by email</a>
                    {m.status !== 'replied' && <button type="button" onClick={() => setStatus(m, 'replied')} className="a-btn-secondary h-9"><Check className="h-4 w-4" />Mark replied</button>}
                    {m.status !== 'unread' && <button type="button" onClick={() => setStatus(m, 'unread')} className="a-btn-ghost h-9">Mark unread</button>}
                    <button type="button" onClick={() => setDeleting(m)} className="a-btn-ghost h-9 text-rose-600"><Trash2 className="h-4 w-4" />Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        <Pagination meta={data?.meta} onPage={(page) => setFilters({ page })} />
      </div>
      <ConfirmDialog open={!!deleting} title="Delete message?" message={deleting && `The message from ${deleting.name} will be permanently deleted.`} onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
    </>
  );
}

export default function MessagesPage() {
  return (
    <RequirePermission permission="messages">
      <Suspense fallback={null}><Messages /></Suspense>
    </RequirePermission>
  );
}
