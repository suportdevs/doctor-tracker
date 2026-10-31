'use client';

import { memo, useCallback, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react';
import { api } from '@/services/api';
import { CONDITIONS, GENDERS, PATIENT_SORTS } from '@/constants';
import { useApi, useUrlFilters } from '@/hooks';
import { cn, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import FilterBar, { DateRange } from '@/components/common/FilterBar';
import PatientForm from './PatientForm';
import { Avatar, ConditionBadge, ConfirmDialog, EmptyState, Pagination, Select, TableSkeleton } from '@/components/ui';

const DEFAULTS = { q: '', condition: '', gender: '', doctor: '', from: '', to: '', minAge: '', maxAge: '', sort: 'newest', page: 1, limit: 10 };
const CONDITION_OPTIONS = Object.entries(CONDITIONS).map(([v, c]) => [v, c.label]);
const AGE_GROUPS = [['0-17', 'Under 18'], ['18-34', '18–34'], ['35-49', '35–49'], ['50-64', '50–64'], ['65-130', '65+']];

const PatientRow = memo(function PatientRow({ patient, showDoctor, canEdit, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <Avatar name={patient.name} size={36} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900 dark:text-white">{patient.name}</p>
            <p className="truncate text-xs text-ink-400">{patient.email || patient.phone || '—'}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap">{patient.age} · {GENDERS[patient.gender]}</td>
      <td className="max-w-[180px] truncate">{patient.diagnosis || <span className="text-ink-400">—</span>}</td>
      <td><ConditionBadge condition={patient.condition} /></td>
      {showDoctor && (
        <td className="max-w-[220px]">
          {patient.doctor ? (
            <Link href={`/admin/doctors/${patient.doctor._id}`} className="group flex items-center gap-2.5">
              <Avatar name={patient.doctor.name} src={patient.doctor.photo} size={30} />
              <span className="min-w-0">
                <span className="block truncate font-medium group-hover:text-brand-700">{patient.doctor.name}</span>
                <span className="block truncate text-xs text-ink-400">{patient.doctor.specialization}</span>
              </span>
            </Link>
          ) : '—'}
        </td>
      )}
      <td className="whitespace-nowrap text-ink-500">{formatDate(patient.visitDate)}</td>
      <td>
        <div className="flex justify-end gap-1">
          {canEdit && <button type="button" onClick={() => onEdit(patient)} className="a-btn-ghost a-btn-icon" aria-label={`Edit ${patient.name}`} title="Edit"><Pencil className="h-4 w-4" /></button>}
          <button type="button" onClick={() => onDelete(patient)} className="a-btn-ghost a-btn-icon hover:text-rose-600" aria-label={`Delete ${patient.name}`} title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      </td>
    </tr>
  );
});

function PatientCard({ patient, showDoctor, canEdit, onEdit, onDelete }) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900 dark:text-white">{patient.name}</p>
          <p className="text-xs text-ink-500">{patient.age} · {GENDERS[patient.gender]} · {formatDate(patient.visitDate)}</p>
        </div>
        <ConditionBadge condition={patient.condition} />
      </div>
      <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{patient.diagnosis || 'No diagnosis'}</p>
      {showDoctor && patient.doctor && <p className="mt-1 text-xs text-ink-400">{patient.doctor.name} · {patient.doctor.specialization}</p>}
      <div className="mt-2 flex justify-end gap-1">
        {canEdit && <button type="button" onClick={() => onEdit(patient)} className="a-btn-ghost a-btn-icon" aria-label="Edit"><Pencil className="h-4 w-4" /></button>}
        <button type="button" onClick={() => onDelete(patient)} className="a-btn-ghost a-btn-icon hover:text-rose-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

/**
 * Searchable, filterable, paginated patient list.
 *  - doctorId: only that doctor's patients; "Add" creates patients under the doctor.
 *  - without doctorId: all patients, with a doctor column and doctor filter.
 */
export default function PatientsTable({ doctorId, onChanged }) {
  const { can } = useAuth();
  const [filters, setFilters, reset] = useUrlFilters(DEFAULTS);
  const endpoint = doctorId ? `/doctors/${doctorId}/patients` : '/patients';
  const { data, error, isLoading, isValidating, mutate } = useApi(endpoint, filters);
  const { data: doctors } = useApi(doctorId ? null : '/doctors/options');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const showDoctor = !doctorId;
  const canEdit = can('patients');
  const onEdit = useCallback((p) => setEditing(p), []);
  const onDelete = useCallback((p) => setDeleting(p), []);
  const ageValue = filters.minAge !== '' ? `${filters.minAge}-${filters.maxAge}` : '';
  const activeFilters = ['q', 'condition', 'gender', 'doctor', 'from', 'to', 'minAge'].filter((k) => filters[k] !== '').length;

  const refresh = () => {
    mutate();
    onChanged?.();
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.del(doctorId ? `/doctors/${doctorId}/patients/${deleting._id}` : `/patients/${deleting._id}`);
      toast.success(`${deleting.name} removed`);
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const items = data?.items || [];
  const rowProps = { showDoctor, canEdit, onEdit, onDelete };

  return (
    <div className="a-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h2 className="font-heading text-[17px] font-semibold tracking-tight text-ink-950 dark:text-white">{doctorId ? 'Patients of this doctor' : 'All patients'} {data && <span className="font-normal text-ink-400">({data.meta.total.toLocaleString()})</span>}</h2>
        <button type="button" className="a-btn-primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" />Add patient</button>
      </div>

      <FilterBar search={filters.q} onSearch={(q) => setFilters({ q })} placeholder="Search name, phone, diagnosis…" active={activeFilters} onReset={reset}>
        <Select value={filters.condition} onChange={(v) => setFilters({ condition: v })} placeholder="All conditions" options={CONDITION_OPTIONS} className="lg:w-44" aria-label="Condition" />
        <Select value={filters.gender} onChange={(v) => setFilters({ gender: v })} placeholder="Any gender" options={Object.entries(GENDERS)} className="lg:w-36" aria-label="Gender" />
        <Select value={ageValue} onChange={(v) => { const [minAge = '', maxAge = ''] = v ? v.split('-') : []; setFilters({ minAge, maxAge }); }} placeholder="Any age" options={AGE_GROUPS} className="lg:w-32" aria-label="Age group" />
        {showDoctor && (
          <Select value={filters.doctor} onChange={(v) => setFilters({ doctor: v })} placeholder="All doctors" options={(doctors?.items || []).map((d) => [d._id, d.name])} className="lg:w-48" aria-label="Doctor" />
        )}
        <DateRange from={filters.from} to={filters.to} onChange={setFilters} label="Visit date" />
        <Select value={filters.sort} onChange={(v) => setFilters({ sort: v })} options={PATIENT_SORTS} className="lg:ml-auto lg:w-40" aria-label="Sort" />
      </FilterBar>

      {error && <p className="p-4 text-sm text-rose-600">{error.message}</p>}

      <div className={cn('transition-opacity', isValidating && data && 'opacity-60')}>
        <div className="a-scroll hidden overflow-x-auto md:block">
          <table className="a-table">
            <thead>
              <tr>
                <th>Patient</th><th>Age · Gender</th><th>Diagnosis</th><th>Condition</th>
                {showDoctor && <th>Doctor</th>}
                <th>Visit date</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            {isLoading && !data ? <TableSkeleton cols={showDoctor ? 7 : 6} /> : (
              <tbody>{items.map((p) => <PatientRow key={p._id} patient={p} {...rowProps} />)}</tbody>
            )}
          </table>
        </div>
        <div className="divide-y divide-ink-100 dark:divide-white/5 md:hidden">
          {items.map((p) => <PatientCard key={p._id} patient={p} {...rowProps} />)}
        </div>
        {data && items.length === 0 && (
          <EmptyState icon={UserRound} title={activeFilters ? 'No patients match these filters' : 'No patients yet'}
            description={activeFilters ? 'Try another search or clear the filters.' : 'Add the first patient to start tracking.'}
            action={activeFilters && <button type="button" className="a-btn-secondary" onClick={reset}>Clear filters</button>} />
        )}
      </div>

      <Pagination meta={data?.meta} onPage={(page) => setFilters({ page })} onLimit={(limit) => setFilters({ limit })} />

      <PatientForm
        open={!!editing}
        patient={editing?._id ? editing : null}
        doctorId={editing?._id ? undefined : doctorId}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); refresh(); }}
      />
      <ConfirmDialog
        open={!!deleting}
        title={doctorId ? 'Remove patient from this doctor?' : 'Delete patient?'}
        message={deleting && `${deleting.name} and their record will be permanently deleted.`}
        loading={busy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
