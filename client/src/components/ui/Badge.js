'use client';

import { CONDITIONS } from '@/constants';
import { cn } from '@/lib/utils';

const BADGE = {
  gray: 'bg-ink-100 text-ink-600 dark:bg-white/5 dark:text-ink-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  red: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
};

export function Badge({ color = 'gray', children, dot, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', BADGE[color], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function ConditionBadge({ condition }) {
  const c = CONDITIONS[condition] || { label: condition, color: 'gray' };
  return <Badge color={c.color} dot>{c.label}</Badge>;
}
