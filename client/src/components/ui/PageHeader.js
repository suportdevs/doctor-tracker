'use client';

export function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        {back}
        <h1 className="font-heading text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 dark:text-white sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
