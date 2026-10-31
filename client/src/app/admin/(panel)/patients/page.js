'use client';

import { Suspense } from 'react';
import PatientsTable from '@/components/patients/PatientsTable';
import RequirePermission from '@/components/auth/RequirePermission';
import { PageHeader } from '@/components/ui';

export default function PatientsPage() {
  return (
    <RequirePermission permission="patients">
      <PageHeader title="Patients" description="Every patient across all doctors. Search, filter by date, condition, age or doctor." />
      <Suspense fallback={null}><PatientsTable /></Suspense>
    </RequirePermission>
  );
}
