/*
 * Admin "Customize" panel: the options, their defaults and how they are applied.
 * Colours and fonts are CSS variables, so changing one updates every Tailwind class that uses it
 * (bg-brand-600, text-brand-700, font-sans …) without re-rendering the app.
 */

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Accent palettes (Tailwind's colour scales).
export const ACCENTS = {
  indigo: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b'],
  blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
  emerald: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22'],
  violet: ['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#2e1065'],
  rose: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337', '#4c0519'],
  amber: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#451a03'],
};

// `css` points at the font variables loaded in app/layout.js.
export const FONTS = {
  inter: { label: 'Inter', css: 'var(--font-inter)' },
  jakarta: { label: 'Plus Jakarta Sans', css: 'var(--font-jakarta)' },
  dmsans: { label: 'DM Sans', css: 'var(--font-dmsans)' },
  system: { label: 'System default', css: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
};

// Multiplies every Tailwind text size (see fontSize in tailwind.config.js).
export const FONT_SIZES = { sm: { label: 'Small', scale: 0.92 }, md: { label: 'Default', scale: 1 }, lg: { label: 'Large', scale: 1.08 } };

export const ZOOM_LEVELS = [90, 100, 110, 120];

export const DEFAULT_PREFERENCES = {
  theme: 'light', accent: 'indigo', layout: 'vertical', sidebarSide: 'left', sidebarCollapsed: false, font: 'inter', fontSize: 'md', zoom: 100,
};

// "#4f46e5" → "79 70 229" (Tailwind reads colours as rgb(var(--x) / alpha)).
const toRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

export const accentHex = (accent, shade = 600) => (ACCENTS[accent] || ACCENTS.indigo)[SHADES.indexOf(shade)];

// Writes the preferences onto <html>. Returns a function that removes them again (used when leaving the admin).
export function applyPreferences(prefs, dark) {
  const root = document.documentElement;
  const palette = ACCENTS[prefs.accent] || ACCENTS.indigo;
  SHADES.forEach((shade, i) => root.style.setProperty(`--brand-${shade}`, toRgb(palette[i])));
  root.style.setProperty('--font-body', (FONTS[prefs.font] || FONTS.inter).css);
  root.style.setProperty('--fs', String((FONT_SIZES[prefs.fontSize] || FONT_SIZES.md).scale));
  // Zoom = the root font size: every rem-based size (text, spacing, radius) scales together.
  root.style.fontSize = `${prefs.zoom || 100}%`;
  root.classList.toggle('dark', dark);

  return () => {
    SHADES.forEach((shade) => root.style.removeProperty(`--brand-${shade}`));
    ['--font-body', '--fs'].forEach((name) => root.style.removeProperty(name));
    root.style.fontSize = '';
    root.classList.remove('dark');
  };
}
