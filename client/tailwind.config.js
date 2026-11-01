/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colour: CSS variables (indigo, see globals.css).
        brand: Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [n, v(`--brand-${n}`)])),
        // …on cool slate neutrals.
        ink: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b', 850: '#172033', 900: '#0f172a', 950: '#020617',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 6px 20px -8px rgb(15 23 42 / 0.08)',
        lift: '0 2px 4px rgb(15 23 42 / 0.04), 0 18px 40px -16px rgb(15 23 42 / 0.18)',
        'brand-glow': '0 8px 20px -8px rgb(var(--brand-600) / 0.55)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'scale-in': { from: { opacity: 0, transform: 'scale(.97)' }, to: { opacity: 1, transform: 'none' } },
        'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
      },
      animation: {
        'fade-in': 'fade-in .15s ease-out both',
        'scale-in': 'scale-in .18s ease-out both',
        'slide-in': 'slide-in .22s ease-out both',
      },
    },
  },
};
