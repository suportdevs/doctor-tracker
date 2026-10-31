'use client';

import { cn } from '@/lib/utils';

// One headline number. `tone` only colours the small icon chip, so the numbers stay neutral.
export function StatCard({ label, value, icon: Icon, hint, tone = 'brand', loading }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
    indigo: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  };
  return (
    <div className="a-card group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center gap-3">
        {Icon && <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tones[tone])}><Icon className="h-[18px] w-[18px]" /></span>}
        <p className="text-sm font-medium text-ink-500 dark:text-ink-400">{label}</p>
      </div>
      {loading
        ? <div className="mt-4 h-9 w-24 animate-pulse rounded-lg bg-ink-100 dark:bg-white/5" />
        : <p className="mt-4 font-heading text-[2.1rem] font-bold leading-none tracking-tight text-ink-950 dark:text-white">{value}</p>}
      {hint && <div className="mt-3 text-xs text-ink-500">{hint}</div>}
    </div>
  );
}
