'use client';

import { useState } from 'react';
import { cn, initials } from '@/lib/utils';

// Shows the photo when there is one (and it loads); otherwise the person's initials.
export function Avatar({ name, src, size = 36, className }) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.36 };

  if (src && !broken) {
    return (
      <img src={src} alt={name || ''} width={size} height={size} loading="lazy" onError={() => setBroken(true)}
        style={style} className={cn('shrink-0 rounded-full bg-ink-100 object-cover dark:bg-white/5', className)} />
    );
  }
  return (
    <span style={style} className={cn('grid shrink-0 place-items-center rounded-full bg-brand-100 font-heading font-bold text-brand-800 dark:bg-brand-500/15 dark:text-brand-200', className)}>
      {initials(name)}
    </span>
  );
}
