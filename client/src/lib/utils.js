import clsx from 'clsx';

export const cn = (...args) => clsx(...args);

export function formatDate(value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', opts).format(new Date(value));
}

// yyyy-mm-dd for <input type="date">.
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const formatNumber = (n = 0) => new Intl.NumberFormat('en-US').format(n);

export function timeAgo(value) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const units = [[31536000, 'y'], [2592000, 'mo'], [604800, 'w'], [86400, 'd'], [3600, 'h'], [60, 'm']];
  for (const [secs, label] of units) if (diff >= secs) return `${Math.floor(diff / secs)}${label} ago`;
  return 'just now';
}

export const initials = (name = '') => name.replace(/^Dr\.\s*/, '').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

