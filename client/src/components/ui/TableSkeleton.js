'use client';

// Grey placeholder rows while a table loads for the first time.
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <tbody>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c}><div className="h-4 animate-pulse rounded bg-ink-100 dark:bg-white/5" style={{ width: `${50 + ((r + c) % 4) * 12}%` }} /></td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
