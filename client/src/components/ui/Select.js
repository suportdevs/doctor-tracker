'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// <select> taking [[value, label], …], with an optional icon on the left.
// `className` styles the wrapper (width, grid span); other props go to the <select>.
export function Select({ value, onChange, options, placeholder, className, icon: Icon, ...rest }) {
  return (
    <div className={cn('relative', className)}>
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />}
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cn('a-input cursor-pointer appearance-none pr-9', Icon && 'pl-9')} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}
