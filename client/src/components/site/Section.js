import Link from 'next/link';
import { cn, isExternal } from '@/lib/utils';
import Reveal from './Reveal';

const BACKGROUNDS = {
  default: 'bg-white text-ink-900',
  muted: 'bg-ink-50 text-ink-900',
  tint: 'bg-primary/[.06] text-ink-900',
  primary: 'bg-primary text-white',
  dark: 'bg-site-dark text-white',
};
const SPACING = { compact: 'py-10 sm:py-14', normal: 'py-16 sm:py-24', large: 'py-20 sm:py-28' };

export const isInverse = (style) => ['primary', 'dark'].includes(style?.background);

// Wraps every block: background, vertical spacing, an anchor id and the scroll-in animation.
export function Section({ style = {}, id, className, children }) {
  return (
    <section id={id} className={cn(BACKGROUNDS[style.background] || BACKGROUNDS.default, SPACING[style.spacing] || SPACING.normal, className)}>
      <Reveal className="container-site">{children}</Reveal>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, inverse, align = 'center' }) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <div className={cn('mb-10 max-w-2xl sm:mb-14', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && <span className={cn('eyebrow reveal', inverse && 'text-accent')}>{eyebrow}</span>}
      {title && <h2 className={cn('section-title reveal', inverse && 'text-white')} style={{ '--i': 1 }}>{title}</h2>}
      {subtitle && <p className="reveal mt-4 text-base leading-relaxed sm:text-lg" style={{ '--i': 2 }}><span className="opacity-70">{subtitle}</span></p>}
    </div>
  );
}

// Internal links use Next.js navigation; external, mailto: and tel: links use a plain <a>.
export function SmartLink({ href, className, children }) {
  if (!href) return null;
  if (isExternal(href)) {
    const newTab = href.startsWith('http');
    return <a href={href} className={className} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;
  }
  return <Link href={href} className={className}>{children}</Link>;
}

export function Buttons({ data, inverse, center }) {
  if (!data.primaryLabel && !data.secondaryLabel) return null;
  return (
    <div className={cn('mt-8 flex flex-wrap gap-3', center && 'justify-center')}>
      {data.primaryLabel && <SmartLink href={data.primaryUrl || '#'} className={inverse ? 'btn-accent' : 'btn-primary'}>{data.primaryLabel}</SmartLink>}
      {data.secondaryLabel && (
        <SmartLink href={data.secondaryUrl || '#'} className={inverse ? 'btn border border-white/25 text-white hover:bg-white/10' : 'btn-outline'}>{data.secondaryLabel}</SmartLink>
      )}
    </div>
  );
}
