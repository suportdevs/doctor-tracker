'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Text input (or textarea) with an optional icon on the left.
 *   <Input icon={Mail} type="email" {...form.bind('email')} />
 *   <Input as="textarea" icon={FileText} rows={3} />
 * `className` styles the wrapper (width, grid span); everything else goes to the input.
 */
export const Input = forwardRef(function Input({ icon: Icon, as = 'input', className, inputClassName, ...rest }, ref) {
  const Tag = as;
  return (
    <div className={cn('relative', className)}>
      {Icon && <Icon className={cn('pointer-events-none absolute left-3 h-4 w-4 text-ink-400', as === 'textarea' ? 'top-2.5' : 'top-1/2 -translate-y-1/2')} />}
      <Tag ref={ref} className={cn(as === 'textarea' ? 'a-textarea' : 'a-input', Icon && 'pl-9', inputClassName)} {...rest} />
    </div>
  );
});
