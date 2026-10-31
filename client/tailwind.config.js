/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;
// Text sizes are multiplied by --fs (the admin “Font size” option; 1 everywhere else).
const size = (rem, lineHeight) => [`calc(${rem}rem * var(--fs, 1))`, { lineHeight }];

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Public website colours — set from Admin → Website → Settings via CSS variables.
        primary: v('--c-primary'),
        accent: v('--c-accent'),
        // Admin accent colour: CSS variables set by the Customize panel (indigo by default, see globals.css).
        brand: Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [n, v(`--brand-${n}`)])),
        // …on cool slate neutrals (also used for website text).
        ink: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b', 850: '#172033', 900: '#0f172a', 950: '#020617',
        },
      },
      fontSize: {
        xs: size(0.75, '1rem'), sm: size(0.875, '1.25rem'), base: size(1, '1.5rem'), lg: size(1.125, '1.75rem'),
        xl: size(1.25, '1.75rem'), '2xl': size(1.5, '2rem'), '3xl': size(1.875, '2.25rem'), '4xl': size(2.25, '2.5rem'),
        '5xl': size(3, '1'), '6xl': size(3.75, '1'), '7xl': size(4.5, '1'),
      },
      borderRadius: { theme: 'var(--radius)', 'theme-lg': 'calc(var(--radius) * 1.6)' },
      fontFamily: {
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 6px 20px -8px rgb(15 23 42 / 0.08)',
        lift: '0 2px 4px rgb(15 23 42 / 0.04), 0 18px 40px -16px rgb(15 23 42 / 0.18)',
        glow: '0 10px 30px -10px rgb(var(--c-primary) / 0.6)',
        'brand-glow': '0 8px 20px -8px rgb(var(--brand-600) / 0.55)',
      },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'scale-in': { from: { opacity: 0, transform: 'scale(.97)' }, to: { opacity: 1, transform: 'none' } },
        'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'hero-zoom': { from: { transform: 'scale(1.12)' }, to: { transform: 'scale(1.02)' } },
        pulse2: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.2,.7,.2,1) both',
        'fade-in': 'fade-in .15s ease-out both',
        'scale-in': 'scale-in .18s ease-out both',
        'slide-in': 'slide-in .22s ease-out both',
        'slide-in-right': 'slide-in-right .3s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        blink: 'pulse2 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
