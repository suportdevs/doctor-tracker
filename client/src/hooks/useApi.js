'use client';

import useSWR from 'swr';
import { api } from '@/services/api';

/**
 * Data fetching with SWR: cached per URL, de-duplicated, and keeps the previous page visible
 * while the next one loads (no flashing tables when paging or filtering).
 *   const { data, isLoading, mutate } = useApi('/doctors', { page: 1 });
 */
export function useApi(path, params, options) {
  const key = path ? [path, params || {}] : null;
  return useSWR(key, ([p, q]) => api.get(p, q), { keepPreviousData: true, revalidateOnFocus: false, ...options });
}
