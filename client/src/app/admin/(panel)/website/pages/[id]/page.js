'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageBuilder from '@/components/cms/PageBuilder';
import RequirePermission from '@/components/auth/RequirePermission';
import { EmptyState, PageLoader } from '@/components/ui';
import { useApi } from '@/hooks';

function EditPage() {
  const { id } = useParams();
  // The builder keeps its own copy while editing, so don't refetch in the background.
  const { data, error } = useApi(`/pages/${id}`, null, { revalidateIfStale: false, keepPreviousData: false });
  if (error) return <EmptyState title="Page not found" description={error.message} action={<Link href="/admin/website/pages" className="a-btn-secondary">Back to pages</Link>} />;
  if (!data) return <PageLoader />;
  return <PageBuilder key={data._id} initial={data} />;
}

export default function EditPageRoute() {
  return <RequirePermission permission="website"><EditPage /></RequirePermission>;
}
