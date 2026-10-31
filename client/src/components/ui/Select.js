'use client';

import { cn } from '@/lib/utils';

// Plain <select> taking [[value, label], …].
export function Select({ value, onChange, options, placeholder, className, ...rest }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cn('a-input pr-8', className)} {...rest}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
