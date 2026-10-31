import { cache } from 'react';
import { unstable_noStore as noStore } from 'next/cache';

// Server-side fetches for the public website. Responses are cached by Next.js and refreshed
// every minute, or instantly when the admin saves content (revalidateTag('cms') in /api/revalidate).
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const CMS_TAG = 'cms';

async function get(path) {
  try {
    const res = await fetch(`${API_URL}/api/public${path}`, { next: { revalidate: 60, tags: [CMS_TAG] } });
    if (res.status >= 500) throw new Error(`API error ${res.status}`);
    if (!res.ok) return null; // e.g. 404 → page not found
    return await res.json();
  } catch {
    // API unreachable (or failing): never cache this render. During `docker build` this keeps the
    // fallback out of the prerendered HTML; at runtime Next keeps serving the last good page.
    noStore();
    return null;
  }
}

// cache() de-duplicates calls within one request (layout + page + metadata share a result).
export const getBootstrap = cache(() => get('/bootstrap'));
export const getPage = cache((slug) => (slug ? get(`/pages/${encodeURIComponent(slug)}`) : get('/home')));
export const getPublishedPages = () => get('/pages');
