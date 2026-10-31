'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Copy, ExternalLink, FileText, Home, Pencil, Plus, Trash2 } from 'lucide-react';
import FilterBar from '@/components/common/FilterBar';
import RequirePermission from '@/components/auth/RequirePermission';
import { Badge, ConfirmDialog, EmptyState, PageHeader, Pagination, Select, TableSkeleton } from '@/components/ui';
import { api } from '@/services/api';
import { useApi, useUrlFilters } from '@/hooks';
import { timeAgo } from '@/lib/utils';

function PagesList() {
  const [filters, setFilters, reset] = useUrlFilters({ q: '', status: '', page: 1 });
  const { data, isLoading, mutate } = useApi('/pages', filters);
  const { data: settings } = useApi('/settings');
  const [deleting, setDeleting] = useState(null);
  const homeSlug = settings?.general.homePage || 'home';

  const duplicate = async (page) => {
    try {
      await api.post(`/pages/${page._id}/duplicate`);
      toast.success('Page duplicated as a draft');
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.del(`/pages/${deleting._id}`);
      toast.success('Page deleted');
      setDeleting(null);
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Website pages"
        description="Every page of the public website. Build them from sections — no code needed."
        actions={<Link href="/admin/website/pages/new" className="a-btn-primary"><Plus className="h-4 w-4" />New page</Link>}
      />
      <div className="a-card overflow-hidden">
        <FilterBar search={filters.q} onSearch={(q) => setFilters({ q })} placeholder="Search pages…" active={['q', 'status'].filter((k) => filters[k]).length} onReset={reset}>
          <Select value={filters.status} onChange={(v) => setFilters({ status: v })} placeholder="All statuses" options={[['published', 'Published'], ['draft', 'Draft']]} className="lg:w-40" aria-label="Status" />
        </FilterBar>
        <div className="a-scroll overflow-x-auto">
          <table className="a-table">
            <thead><tr><th>Title</th><th>Address</th><th>Status</th><th>Updated</th><th className="text-right">Actions</th></tr></thead>
            {isLoading && !data ? <TableSkeleton cols={5} /> : (
              <tbody>
                {data?.items.map((p) => {
                  const isHome = p.slug === homeSlug;
                  const url = isHome ? '/' : `/${p.slug}`;
                  return (
                    <tr key={p._id}>
                      <td>
                        <Link href={`/admin/website/pages/${p._id}`} className="flex items-center gap-2 font-semibold text-ink-900 hover:text-brand-600 dark:text-white">
                          {isHome ? <Home className="h-4 w-4 text-brand-600" /> : <FileText className="h-4 w-4 text-ink-400" />}{p.title}
                          {isHome && <Badge color="brand">Home page</Badge>}
                        </Link>
                      </td>
                      <td className="font-mono text-xs text-ink-500">{url}</td>
                      <td><Badge color={p.status === 'published' ? 'green' : 'gray'} dot>{p.status === 'published' ? 'Published' : 'Draft'}</Badge></td>
                      <td className="whitespace-nowrap text-ink-500">{timeAgo(p.updatedAt)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          {p.status === 'published' && <a href={url} target="_blank" rel="noopener noreferrer" className="a-btn-ghost a-btn-icon" title="View on website" aria-label="View"><ExternalLink className="h-4 w-4" /></a>}
                          <Link href={`/admin/website/pages/${p._id}`} className="a-btn-ghost a-btn-icon" title="Edit" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                          <button type="button" onClick={() => duplicate(p)} className="a-btn-ghost a-btn-icon" title="Duplicate" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
                          <button type="button" onClick={() => setDeleting(p)} className="a-btn-ghost a-btn-icon hover:text-rose-600" title="Delete" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
        {data?.items.length === 0 && <EmptyState icon={FileText} title="No pages found" action={<Link href="/admin/website/pages/new" className="a-btn-primary"><Plus className="h-4 w-4" />New page</Link>} />}
        <Pagination meta={data?.meta} onPage={(page) => setFilters({ page })} />
      </div>
      <ConfirmDialog
        open={!!deleting}
        title="Delete page?"
        message={deleting && `“${deleting.title}” will be removed from the website. Menu links pointing to it will show “page not found”.`}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

export default function PagesPage() {
  return (
    <RequirePermission permission="website">
      <Suspense fallback={null}><PagesList /></Suspense>
    </RequirePermission>
  );
}
