'use client';

import PageBuilder from '@/components/cms/PageBuilder';
import RequirePermission from '@/components/auth/RequirePermission';
import { BLOCKS, DEFAULT_STYLE } from '@/config/blocks';

// New pages start with a page header so they're never blank.
const initial = {
  title: '',
  slug: '',
  status: 'draft',
  seoTitle: '',
  seoDescription: '',
  blocks: [{ id: 'start', type: 'pageHeader', data: structuredClone(BLOCKS.pageHeader.defaults), style: { ...DEFAULT_STYLE } }],
};

export default function NewPage() {
  return <RequirePermission permission="website"><PageBuilder initial={initial} /></RequirePermission>;
}
