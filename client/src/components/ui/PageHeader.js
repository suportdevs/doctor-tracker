'use client';

export function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back}
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
