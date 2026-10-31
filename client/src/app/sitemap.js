import { getBootstrap, getPublishedPages } from '@/services/server-api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap() {
  const [pages, boot] = await Promise.all([getPublishedPages(), getBootstrap()]);
  const home = boot?.settings.general.homePage || 'home';
  return (pages?.items || []).map((p) => ({
    url: p.slug === home ? SITE_URL : `${SITE_URL}/${p.slug}`,
    lastModified: p.updatedAt,
  }));
}

// Re-render at most once a minute (or immediately after an admin save via revalidateTag).
export const revalidate = 60;
