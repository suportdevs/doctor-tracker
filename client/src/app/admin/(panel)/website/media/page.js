'use client';

import { MediaGrid } from '@/components/cms/MediaLibrary';
import RequirePermission from '@/components/auth/RequirePermission';
import { PageHeader } from '@/components/ui';

export default function MediaPage() {
  return (
    <RequirePermission permission="website">
      <PageHeader title="Media library" description="Images used on your website pages, logo and settings." />
      <div className="a-card p-5"><MediaGrid /></div>
    </RequirePermission>
  );
}
