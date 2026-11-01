'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useDebounce } from '@/hooks';
import { cn, formatDate } from '@/lib/utils';
import { Input, SearchInput } from '@/components/ui';

/**
 * List toolbar, in three tidy rows:
 *   1. search box (debounced) · "Filters" button · sort control
 *   2. filter panel (opens from the button) with labelled <FilterField>s
 *   3. chips for every active filter (click × to remove one) + "Clear all"
 *
 *   <FilterBar search={q} onSearch={…} sort={<Select …/>} chips={[{ label, onRemove }]} onReset={reset}>
 *     <FilterField label="Status"><Select …/></FilterField>
 *   </FilterBar>
 */
export default function FilterBar({ search, onSearch, placeholder, sort, chips = [], onReset, children }) {
  const [text, setText] = useState(search || '');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(text);

  useEffect(() => { setText(search || ''); }, [search]);
  useEffect(() => {
    if (debounced !== (search || '')) onSearch(debounced);
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearAll = () => {
    setText('');
    onReset();
  };

  return (
    <div className="space-y-3 border-b border-ink-100 p-4 dark:border-white/5">
      <div className="flex items-center gap-2">
        <SearchInput value={text} onChange={setText} placeholder={placeholder} className="min-w-0 flex-1 sm:max-w-xs" />
        {children && (
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
            className={cn('a-btn-secondary shrink-0', open && 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-200')}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {chips.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">{chips.length}</span>}
            <ChevronDown className={cn('hidden h-4 w-4 transition sm:block', open && 'rotate-180')} />
          </button>
        )}
        {sort && <div className="ml-auto hidden w-44 shrink-0 sm:block">{sort}</div>}
      </div>

      {open && children && (
        <div className="grid animate-fade-in grid-cols-1 gap-3 rounded-xl border border-ink-100 bg-ink-50/70 p-3 dark:border-white/5 dark:bg-white/[.02] sm:grid-cols-2 lg:grid-cols-4">
          {children}
          {sort && <FilterField label="Sort by" className="sm:hidden">{sort}</FilterField>}
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span key={chip.label} className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white py-0.5 pl-2.5 pr-1 text-xs font-medium text-ink-700 dark:border-white/10 dark:bg-white/5 dark:text-ink-200">
              {chip.label}
              <button type="button" onClick={chip.onRemove} className="grid h-4 w-4 place-items-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10" aria-label={`Remove filter ${chip.label}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button type="button" onClick={clearAll} className="text-xs font-medium text-ink-500 hover:text-rose-600">Clear all</button>
        </div>
      )}
    </div>
  );
}

// A labelled control inside the filter panel.
export function FilterField({ label, className, children }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="mb-1 text-xs font-medium text-ink-500">{label}</p>
      {children}
    </div>
  );
}

// "From – To" date inputs used by doctor and patient filters (takes two grid columns).
export function DateRange({ from, to, onChange, label = 'Date' }) {
  return (
    <FilterField label={label} className="sm:col-span-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input icon={CalendarDays} type="date" className="min-w-0 flex-1" value={from} max={to || undefined} onChange={(e) => onChange({ from: e.target.value })} aria-label={`${label} from`} />
        <span className="hidden text-ink-400 sm:block">–</span>
        <Input icon={CalendarDays} type="date" className="min-w-0 flex-1" value={to} min={from || undefined} onChange={(e) => onChange({ to: e.target.value })} aria-label={`${label} to`} />
      </div>
    </FilterField>
  );
}

// Chip text for a date range: "Joined: Jan 1, 2026 – Mar 1, 2026", "Joined: from Jan 1, 2026"…
// (yyyy-mm-dd values are read as UTC, so they're formatted in UTC to show the same day.)
const day = (value) => formatDate(value, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export function dateRangeLabel(label, from, to) {
  if (from && to) return `${label}: ${day(from)} – ${day(to)}`;
  return from ? `${label}: from ${day(from)}` : `${label}: until ${day(to)}`;
}
