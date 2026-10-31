'use client';

export function Field({ label, hint, error, className, children, htmlFor }) {
  return (
    <div className={className}>
      {label && <label htmlFor={htmlFor} className="a-label">{label}</label>}
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
