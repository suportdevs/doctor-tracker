'use client';

import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function pageNumbers(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export const Pagination = memo(function Pagination({ meta, onPage, onLimit }) {
  if (!meta) return null;
  const { page, pages, total, limit } = meta;
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-100 px-4 py-3 text-sm dark:border-white/5 sm:flex-row">
      <div className="flex items-center gap-3 text-ink-500">
        <span>Showing <b className="text-ink-800 dark:text-ink-100">{from}–{to}</b> of <b className="text-ink-800 dark:text-ink-100">{total.toLocaleString()}</b></span>
        {onLimit && (
          <select value={limit} onChange={(e) => onLimit(Number(e.target.value))} className="a-input h-8 w-auto py-0 pr-7 text-xs" aria-label="Rows per page">
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        )}
      </div>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button type="button" className="a-btn-ghost a-btn-icon h-8 w-8" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        {pageNumbers(page, pages).map((p, i) => (p === '…'
          ? <span key={`gap-${i}`} className="px-1 text-ink-400">…</span>
          : (
            <button key={p} type="button" onClick={() => onPage(p)} aria-current={p === page ? 'page' : undefined}
              className={cn('h-8 min-w-8 rounded-lg px-2 text-sm font-semibold transition', p === page ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/5')}
            >{p}</button>
          )))}
        <button type="button" className="a-btn-ghost a-btn-icon h-8 w-8" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </nav>
    </div>
  );
});
