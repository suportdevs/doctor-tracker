'use client';

import { useCallback, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Filters stored in the URL (?q=&page=2…) so they survive refresh, back/forward and can be shared.
 *   const [filters, setFilters] = useUrlFilters({ q: '', page: 1 });
 *   setFilters({ status: 'active' })   // any change other than "page" resets to page 1
 */
export function useUrlFilters(defaults) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultsRef = useRef(defaults);

  const filters = useMemo(() => {
    const out = { ...defaultsRef.current };
    for (const key of Object.keys(out)) {
      const value = searchParams.get(key);
      if (value !== null) out[key] = typeof out[key] === 'number' ? Number(value) || out[key] : value;
    }
    return out;
  }, [searchParams]);

  const setFilters = useCallback((changes) => {
    const next = { ...filters, ...changes };
    if (!('page' in changes) && 'page' in next) next.page = 1;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value !== '' && value !== null && value !== undefined && value !== defaultsRef.current[key]) params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters, pathname, router]);

  const reset = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  return [filters, setFilters, reset];
}
