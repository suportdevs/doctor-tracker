'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '@/hooks';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/ui';

/**
 * Search box (debounced, so typing doesn't fire a request per key) + any filter controls + "Clear".
 * On phones the filter controls fold behind a "Filters" button to keep the list visible.
 *   <FilterBar search={filters.q} onSearch={(q) => setFilters({ q })} active={2} onReset={reset}>…selects…</FilterBar>
 */
export default function FilterBar({ search, onSearch, placeholder, active = 0, onReset, children }) {
  const [text, setText] = useState(search || '');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(text);

  useEffect(() => { setText(search || ''); }, [search]);
  useEffect(() => {
    if (debounced !== (search || '')) onSearch(debounced);
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-white/5">
      <div className="flex items-center gap-2">
        <SearchInput value={text} onChange={setText} placeholder={placeholder} className="flex-1 lg:max-w-sm" />
        {children && (
          <button type="button" onClick={() => setOpen(!open)} className={cn('a-btn-secondary shrink-0 lg:hidden', open && 'border-brand-400 text-brand-700')} aria-expanded={open}>
            <SlidersHorizontal className="h-4 w-4" />Filters{active > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{active}</span>}
          </button>
        )}
        {active > 0 && (
          <button type="button" onClick={() => { setText(''); onReset(); }} className="a-btn-ghost hidden text-rose-600 lg:ml-auto lg:inline-flex">
            <RotateCcw className="h-4 w-4" />Clear filters ({active})
          </button>
        )}
      </div>
      <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center', !open && 'hidden lg:flex')}>{children}</div>
      {active > 0 && (
        <button type="button" onClick={() => { setText(''); onReset(); }} className="a-btn-ghost self-start text-rose-600 lg:hidden">
          <RotateCcw className="h-4 w-4" />Clear ({active})
        </button>
      )}
    </div>
  );
}

// "From – To" date inputs used by doctor and patient filters.
export function DateRange({ from, to, onChange, label = 'Date' }) {
  return (
    <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
      <input type="date" className="a-input min-w-0 flex-1 lg:w-36 lg:flex-none" value={from} max={to || undefined} onChange={(e) => onChange({ from: e.target.value })} aria-label={`${label} from`} title={`${label} from`} />
      <span className="text-ink-400">–</span>
      <input type="date" className="a-input min-w-0 flex-1 lg:w-36 lg:flex-none" value={to} min={from || undefined} onChange={(e) => onChange({ to: e.target.value })} aria-label={`${label} to`} title={`${label} to`} />
    </div>
  );
}
