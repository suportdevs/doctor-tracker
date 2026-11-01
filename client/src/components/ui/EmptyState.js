'use client';

import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink-100 text-ink-400 dark:bg-white/5"><Icon className="h-6 w-6" /></span>
      <h3 className="mt-4 font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
