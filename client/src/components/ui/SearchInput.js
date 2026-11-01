'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Search box with a clear (×) button once something is typed.
export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="a-input pl-9 pr-8" aria-label={placeholder} />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded text-ink-400 hover:text-ink-700" aria-label="Clear search">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
