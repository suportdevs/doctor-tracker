import { notFound } from 'next/navigation';
import BlockRenderer from '@/components/site/BlockRenderer';
import { getBootstrap, getPage } from '@/services/server-api';

// Any page created in Admin → Website → Pages is served here by its slug (/about, /contact…).
export async function generateMetadata({ params }) {
  const result = await getPage(params.slug);
  if (!result?.page) return { title: 'Page not found' };
  const { page } = result;
  return { title: page.seoTitle || page.title, description: page.seoDescription || undefined };
}

export default async function CmsPage({ params }) {
  const [result, boot] = await Promise.all([getPage(params.slug), getBootstrap()]);
  if (!result?.page) notFound();
  return <BlockRenderer blocks={result.page.blocks} live={result.live} settings={boot?.settings} />;
}

// Re-render at most once a minute (or immediately after an admin save via revalidateTag).
export const revalidate = 60;
