'use client';

// 6-digit one-time code field: digits only, large and spaced so it's easy to read and type.
export default function CodeInput({ value, onChange, autoFocus, id = 'code' }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus={autoFocus}
      placeholder="••••••"
      aria-label="6-digit code"
      className="a-input h-14 text-center font-heading text-2xl font-bold tracking-[.6em] placeholder:tracking-[.6em]"
    />
  );
}
