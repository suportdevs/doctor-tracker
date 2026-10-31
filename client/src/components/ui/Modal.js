'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('input, select, textarea, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={panel} className={cn('relative flex max-h-[92vh] w-full animate-scale-in flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-ink-900 sm:rounded-2xl', width)}>
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4 dark:border-white/5">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="a-btn-ghost a-btn-icon -mr-2" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="a-scroll flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-6 py-4 dark:border-white/5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
