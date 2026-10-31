'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, CalendarDays, Mail, Pencil, Phone, Users } from 'lucide-react';
import DoctorForm from '@/components/doctors/DoctorForm';
import PatientsTable from '@/components/patients/PatientsTable';
import RequirePermission from '@/components/auth/RequirePermission';
import { Avatar, Badge, EmptyState, PageLoader } from '@/components/ui';
import { useApi } from '@/hooks';
import { formatDate } from '@/lib/utils';

function DoctorDetail() {
  const { id } = useParams();
  const { data: doctor, error, mutate } = useApi(`/doctors/${id}`);
  const { data: options } = useApi('/doctors/filters');
  const [editing, setEditing] = useState(false);

  if (error) {
    return <EmptyState title="Doctor not found" description={error.message} action={<Link href="/admin/doctors" className="a-btn-secondary">Back to doctors</Link>} />;
  }
  if (!doctor) return <PageLoader />;

  const facts = [
    [Building2, 'Hospital', doctor.hospital],
    [Phone, 'Phone', doctor.phone, `tel:${doctor.phone}`],
    [Mail, 'Email', doctor.email, `mailto:${doctor.email}`],
    [CalendarDays, 'Joined', formatDate(doctor.joinedAt)],
    [Users, 'Patients', doctor.patientCount],
  ];

  return (
    <>
      <Link href="/admin/doctors" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" />All doctors
      </Link>

      <div className="a-card mb-6 overflow-hidden">
        <div className="relative h-28 overflow-hidden bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800">
          <div className="bg-dots absolute inset-0" />
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-sky-300/30 blur-3xl" />
          <div className="absolute left-1/3 top-6 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="px-5 pb-5 sm:px-6">
          {/* Only the photo overlaps the banner; the name starts below it. */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
              <Avatar name={doctor.name} src={doctor.photo} size={104} className="relative -mt-14 ring-4 ring-white dark:ring-ink-900" />
              <div className="sm:pt-3">
                <h1 className="font-heading text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 dark:text-white">{doctor.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge color="brand">{doctor.specialization}</Badge>
                  <Badge color={doctor.status === 'active' ? 'green' : 'gray'} dot>{doctor.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
            </div>
            <button type="button" className="a-btn-secondary sm:mt-3" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Edit doctor</button>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {facts.map(([Icon, label, value, href]) => (
              <div key={label} className="rounded-2xl border border-ink-100 bg-ink-50/60 p-3.5 dark:border-white/5 dark:bg-white/[.03]">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-400"><Icon className="h-3.5 w-3.5" />{label}</dt>
                <dd className="mt-1 truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{href ? <a href={href} className="hover:text-brand-700">{value}</a> : value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* onChanged refreshes the patient count above after adding/removing a patient. */}
      <PatientsTable doctorId={id} onChanged={() => mutate()} />

      <DoctorForm open={editing} doctor={doctor} suggestions={options} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); mutate(); }} />
    </>
  );
}

export default function DoctorPage() {
  return (
    <RequirePermission permission="doctors">
      <Suspense fallback={<PageLoader />}><DoctorDetail /></Suspense>
    </RequirePermission>
  );
}
