'use client';

import { cn } from '@/lib/utils';

export function Card({ className, children, title, description, actions, bodyClassName }) {
  return (
    <div className={cn('a-card', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-5">
          <div className="min-w-0">
            {title && <h3 className="font-heading text-[17px] font-semibold tracking-tight text-ink-950 dark:text-white">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-ink-400">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </div>
  );
}
