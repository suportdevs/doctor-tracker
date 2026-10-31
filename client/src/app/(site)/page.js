import Link from 'next/link';
import BlockRenderer from '@/components/site/BlockRenderer';
import { getBootstrap, getPage } from '@/services/server-api';

export async function generateMetadata() {
  const result = await getPage();
  if (!result?.page) return {};
  const { seoTitle, seoDescription } = result.page;
  return { ...(seoTitle && { title: { absolute: seoTitle } }), ...(seoDescription && { description: seoDescription }) };
}

export default async function HomePage() {
  const [result, boot] = await Promise.all([getPage(), getBootstrap()]);

  // No published home page yet — point the admin to the page builder.
  if (!result?.page) {
    return (
      <div className="container-site py-32 text-center">
        <h1 className="text-3xl font-extrabold">Welcome</h1>
        <p className="mt-3 text-slate-500">There is no published home page yet.</p>
        <Link href="/admin/website/pages" className="btn-primary mt-6">Create it in the admin</Link>
      </div>
    );
  }
  return <BlockRenderer blocks={result.page.blocks} live={result.live} settings={boot?.settings} />;
}

// Re-render at most once a minute (or immediately after an admin save via revalidateTag).
export const revalidate = 60;
