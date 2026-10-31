'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import { formatNumber } from '@/lib/utils';

// "Patients per doctor" as a ranked bar list: each row shows who the doctor is (photo, specialty)
// next to a bar scaled to the busiest doctor. Plain HTML, so it needs no chart library.
export const TopDoctors = memo(function TopDoctors({ data }) {
  const max = Math.max(...data.map((d) => d.patients), 1);
  return (
    <ol className="space-y-3.5">
      {data.map((d, i) => (
        <li key={d.id}>
          <Link href={`/admin/doctors/${d.id}`} className="group flex items-center gap-3">
            <span className="w-4 text-right text-xs font-semibold tabular-nums text-ink-400">{i + 1}</span>
            <Avatar name={d.name} src={d.photo} size={36} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{d.name}</p>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-ink-900 dark:text-white">{formatNumber(d.patients)}</p>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-white/5">
                  <div className="h-full rounded-full bg-brand-600 transition-all dark:bg-brand-400" style={{ width: `${(d.patients / max) * 100}%` }} />
                </div>
                <p className="w-28 shrink-0 truncate text-right text-xs text-ink-400">{d.specialization}</p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
});
