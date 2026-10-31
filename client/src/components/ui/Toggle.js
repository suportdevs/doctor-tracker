'use client';

import { cn } from '@/lib/utils';

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition', checked ? 'bg-brand-600' : 'bg-ink-200 dark:bg-white/10')}
      >
        <span className={cn('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition', checked && 'translate-x-4')} />
      </button>
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-semibold text-ink-700 dark:text-ink-200">{label}</span>}
          {description && <span className="block text-xs text-ink-400">{description}</span>}
        </span>
      )}
    </label>
  );
}
