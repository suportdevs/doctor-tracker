'use client';

import { memo, Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Building2, LayoutGrid, List, Mail, Pencil, Phone, Plus, Stethoscope, Trash2, Users } from 'lucide-react';
import DoctorForm from '@/components/doctors/DoctorForm';
import FilterBar, { DateRange } from '@/components/common/FilterBar';
import RequirePermission from '@/components/auth/RequirePermission';
import { Avatar, Badge, ConfirmDialog, EmptyState, PageHeader, Pagination, Select, TableSkeleton } from '@/components/ui';
import { api } from '@/services/api';
import { DOCTOR_SORTS } from '@/constants';
import { useApi, useUrlFilters } from '@/hooks';
import { cn, formatDate } from '@/lib/utils';

const DEFAULTS = { q: '', specialization: '', hospital: '', status: '', from: '', to: '', sort: 'newest', page: 1, limit: 10 };

const StatusBadge = ({ status }) => <Badge color={status === 'active' ? 'green' : 'gray'} dot>{status === 'active' ? 'Active' : 'Inactive'}</Badge>;

// Table or grid — remembered per browser (a display preference, not a filter).
function useViewMode() {
  const [view, setView] = useState('table');
  useEffect(() => {
    try { setView(localStorage.getItem('dt_doctor_view') === 'grid' ? 'grid' : 'table'); } catch { /* storage blocked */ }
  }, []);
  const change = (next) => {
    setView(next);
    try { localStorage.setItem('dt_doctor_view', next); } catch { /* storage blocked */ }
  };
  return [view, change];
}

// memo: a row only re-renders when its own doctor object changes.
const DoctorRow = memo(function DoctorRow({ doctor, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <Link href={`/admin/doctors/${doctor._id}`} className="group flex items-center gap-3">
          <Avatar name={doctor.name} src={doctor.photo} size={40} />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white">{doctor.name}</span>
            <span className="block truncate text-xs text-ink-400">{doctor.email}</span>
          </span>
        </Link>
      </td>
      <td><Badge color="brand">{doctor.specialization}</Badge></td>
      <td className="max-w-[200px] truncate">{doctor.hospital}</td>
      <td className="whitespace-nowrap tabular-nums">{doctor.phone}</td>
      <td>
        <Link href={`/admin/doctors/${doctor._id}`} className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-ink-800 hover:text-brand-700 dark:text-ink-100">
          <Users className="h-4 w-4 text-ink-400" />{doctor.patientCount}
        </Link>
      </td>
      <td><StatusBadge status={doctor.status} /></td>
      <td className="whitespace-nowrap text-ink-500">{formatDate(doctor.joinedAt)}</td>
      <td>
        <div className="flex justify-end gap-1">
          <button type="button" onClick={() => onEdit(doctor)} className="a-btn-ghost a-btn-icon" title="Edit" aria-label={`Edit ${doctor.name}`}><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => onDelete(doctor)} className="a-btn-ghost a-btn-icon hover:text-rose-600" title="Delete" aria-label={`Delete ${doctor.name}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </td>
    </tr>
  );
});

// Card layout for phones, where an 8-column table doesn't fit.
function DoctorCard({ doctor, onEdit, onDelete }) {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={doctor.name} src={doctor.photo} size={44} />
        <Link href={`/admin/doctors/${doctor._id}`} className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink-900 dark:text-white">{doctor.name}</p>
          <p className="text-xs font-medium text-brand-700 dark:text-brand-300">{doctor.specialization}</p>
        </Link>
        <StatusBadge status={doctor.status} />
      </div>
      <div className="mt-3 grid gap-1.5 text-xs text-ink-500">
        <p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />{doctor.hospital}</p>
        <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{doctor.phone}</p>
        <p className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5" />{doctor.email}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Link href={`/admin/doctors/${doctor._id}`} className="text-sm font-semibold text-brand-700 dark:text-brand-300">{doctor.patientCount} patients →</Link>
        <div className="flex gap-1">
          <button type="button" onClick={() => onEdit(doctor)} className="a-btn-ghost a-btn-icon" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => onDelete(doctor)} className="a-btn-ghost a-btn-icon hover:text-rose-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

// Grid view: a profile card with the doctor's photo.
const DoctorTile = memo(function DoctorTile({ doctor, onEdit, onDelete }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-ink-200/60 bg-white transition hover:-translate-y-0.5 hover:shadow-lift dark:border-white/[.06] dark:bg-ink-900">
      <Link href={`/admin/doctors/${doctor._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-50 dark:bg-white/5">
          {doctor.photo
            ? <img src={doctor.photo} alt={doctor.name} loading="lazy" className="h-full w-full object-cover object-[50%_25%] transition duration-500 group-hover:scale-105" />
            : <div className="grid h-full place-items-center"><Avatar name={doctor.name} size={72} /></div>}
          <div className="absolute left-3 top-3"><StatusBadge status={doctor.status} /></div>
        </div>
        <div className="p-4">
          <p className="truncate font-heading text-[15px] font-semibold text-ink-950 dark:text-white">{doctor.name}</p>
          <p className="text-xs font-medium text-brand-700 dark:text-brand-300">{doctor.specialization}</p>
          <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-ink-500"><Building2 className="h-3.5 w-3.5 shrink-0" />{doctor.hospital}</p>
        </div>
      </Link>
      <div className="flex items-center justify-between border-t border-ink-100 px-4 py-2 dark:border-white/5">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-ink-800 dark:text-ink-100"><Users className="h-4 w-4 text-ink-400" />{doctor.patientCount}</span>
        <div className="flex gap-0.5">
          <button type="button" onClick={() => onEdit(doctor)} className="a-btn-ghost a-btn-icon" aria-label={`Edit ${doctor.name}`}><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => onDelete(doctor)} className="a-btn-ghost a-btn-icon hover:text-rose-600" aria-label={`Delete ${doctor.name}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
});

function DoctorsList() {
  const [filters, setFilters, reset] = useUrlFilters(DEFAULTS);
  const { data, error, isLoading, isValidating, mutate } = useApi('/doctors', filters);
  const { data: options, mutate: refreshOptions } = useApi('/doctors/filters');
  const [view, setView] = useViewMode();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, doctor = edit
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  // Stable callbacks so memoised rows don't re-render on every parent render.
  const onEdit = useCallback((doctor) => setEditing(doctor), []);
  const onDelete = useCallback((doctor) => setDeleting(doctor), []);

  const activeFilters = ['q', 'specialization', 'hospital', 'status', 'from', 'to'].filter((k) => filters[k]).length;

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.del(`/doctors/${deleting._id}`);
      toast.success(`${deleting.name} deleted`);
      setDeleting(null);
      mutate();
      refreshOptions();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const items = data?.items || [];
  const viewButton = (mode, Icon, label) => (
    <button type="button" onClick={() => setView(mode)} aria-pressed={view === mode} title={label} aria-label={label}
      className={cn('grid h-8 w-8 place-items-center rounded-lg transition', view === mode ? 'bg-ink-100 text-ink-900 dark:bg-white/10 dark:text-white' : 'text-ink-400 hover:text-ink-700')}
    ><Icon className="h-4 w-4" /></button>
  );

  return (
    <>
      <PageHeader
        title="Doctors"
        description="Manage your doctors and see how many patients each one has."
        actions={(
          <>
            <div className="hidden rounded-xl border border-ink-200/80 bg-white p-1 dark:border-white/10 dark:bg-ink-900 md:flex">
              {viewButton('table', List, 'Table view')}
              {viewButton('grid', LayoutGrid, 'Grid view')}
            </div>
            <button type="button" className="a-btn-primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" />Add doctor</button>
          </>
        )}
      />

      <div className="a-card overflow-hidden">
        <FilterBar search={filters.q} onSearch={(q) => setFilters({ q })} placeholder="Search name, email, phone…" active={activeFilters} onReset={reset}>
          <Select value={filters.specialization} onChange={(v) => setFilters({ specialization: v })} placeholder="All specializations" options={(options?.specializations || []).map((s) => [s, s])} className="lg:w-48" aria-label="Specialization" />
          <Select value={filters.hospital} onChange={(v) => setFilters({ hospital: v })} placeholder="All hospitals" options={(options?.hospitals || []).map((h) => [h, h])} className="lg:w-48" aria-label="Hospital" />
          <Select value={filters.status} onChange={(v) => setFilters({ status: v })} placeholder="Any status" options={[['active', 'Active'], ['inactive', 'Inactive']]} className="lg:w-36" aria-label="Status" />
          <DateRange from={filters.from} to={filters.to} onChange={setFilters} label="Joined" />
          <Select value={filters.sort} onChange={(v) => setFilters({ sort: v })} options={DOCTOR_SORTS} className="lg:ml-auto lg:w-40" aria-label="Sort" />
        </FilterBar>

        {error && <p className="p-4 text-sm text-rose-600">{error.message}</p>}

        <div className={cn('transition-opacity', isValidating && data && 'opacity-60')}>
          {view === 'table' ? (
            <div className="a-scroll hidden overflow-x-auto md:block">
              <table className="a-table">
                <thead>
                  <tr><th>Doctor</th><th>Specialization</th><th>Hospital</th><th>Phone</th><th>Patients</th><th>Status</th><th>Joined</th><th className="text-right">Actions</th></tr>
                </thead>
                {isLoading && !data ? <TableSkeleton cols={8} /> : (
                  <tbody>{items.map((d) => <DoctorRow key={d._id} doctor={d} onEdit={onEdit} onDelete={onDelete} />)}</tbody>
                )}
              </table>
            </div>
          ) : (
            <div className="hidden gap-4 p-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((d) => <DoctorTile key={d._id} doctor={d} onEdit={onEdit} onDelete={onDelete} />)}
            </div>
          )}
          {/* Mobile cards */}
          <div className="divide-y divide-ink-100 dark:divide-white/5 md:hidden">
            {items.map((d) => <DoctorCard key={d._id} doctor={d} onEdit={onEdit} onDelete={onDelete} />)}
          </div>

          {data && items.length === 0 && (
            <EmptyState icon={Stethoscope} title={activeFilters ? 'No doctors match these filters' : 'No doctors yet'}
              description={activeFilters ? 'Try a different search or clear the filters.' : 'Add your first doctor to get started.'}
              action={activeFilters ? <button type="button" className="a-btn-secondary" onClick={reset}>Clear filters</button> : <button type="button" className="a-btn-primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" />Add doctor</button>} />
          )}
        </div>

        <Pagination meta={data?.meta} onPage={(page) => setFilters({ page })} onLimit={(limit) => setFilters({ limit })} />
      </div>

      <DoctorForm
        open={!!editing}
        doctor={editing?._id ? editing : null}
        suggestions={options}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); mutate(); refreshOptions(); }}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Delete doctor?"
        message={deleting && (deleting.patientCount
          ? `${deleting.name} still has ${deleting.patientCount} patient(s). Move or delete them first — the doctor can’t be deleted while patients are assigned.`
          : `${deleting.name} will be permanently removed.`)}
        loading={busy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

export default function DoctorsPage() {
  return (
    <RequirePermission permission="doctors">
      <Suspense fallback={null}><DoctorsList /></Suspense>
    </RequirePermission>
  );
}
