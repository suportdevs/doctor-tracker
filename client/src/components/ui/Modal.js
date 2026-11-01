'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panel = useRef(null);
  // Latest onClose in a ref, so a parent re-render (new function) doesn't re-run the effect and move focus.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Focus the first field (or, with no fields, the first button) so keyboard users can start typing.
    (panel.current?.querySelector('input, select, textarea') || panel.current?.querySelector('button'))?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-ink-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={panel} className={cn('relative flex max-h-[92vh] w-full animate-scale-in flex-col rounded-t-2xl border border-ink-200/70 bg-white shadow-xl dark:border-white/10 dark:bg-ink-900 sm:rounded-2xl', width)}>
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
          <div>
            <h2 className="text-base font-semibold text-ink-950 dark:text-white">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="a-btn-ghost a-btn-icon -mr-2" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="a-scroll flex-1 overflow-y-auto px-6 pb-6 pt-3">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pb-5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
