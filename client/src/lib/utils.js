import clsx from 'clsx';

export const cn = (...args) => clsx(...args);

export function formatDate(value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', opts).format(new Date(value));
}

// yyyy-mm-dd for <input type="date">.
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const formatNumber = (n = 0) => new Intl.NumberFormat('en-US').format(n);

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function timeAgo(value) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const units = [[31536000, 'y'], [2592000, 'mo'], [604800, 'w'], [86400, 'd'], [3600, 'h'], [60, 'm']];
  for (const [secs, label] of units) if (diff >= secs) return `${Math.floor(diff / secs)}${label} ago`;
  return 'just now';
}

export const initials = (name = '') => name.replace(/^Dr\.\s*/, '').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export const uid = () => Math.random().toString(36).slice(2, 10);

export const slugify = (s = '') =>
  s.toString().toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// "#0d9488" → "13 148 136" for CSS variables used as rgb(var(--x) / alpha).
export function hexToRgb(hex, fallback = '13 148 136') {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

// Links in menus/buttons can be internal ("/about") or external ("https://…", "tel:…").
export const isExternal = (url = '') => /^(https?:|mailto:|tel:)/i.test(url);
