import { hexToRgb } from './utils';

// Website appearance settings → CSS variables consumed by Tailwind (bg-primary, rounded-theme…).
export const themeStyle = (appearance = {}) => ({
  '--c-primary': hexToRgb(appearance.primaryColor, '20 124 97'),
  '--c-accent': hexToRgb(appearance.accentColor, '196 238 92'),
  '--radius': `${Number(appearance.radius ?? 16)}px`,
});
