import { Plus, Quote, Star } from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { Section, SectionHeading, isInverse } from '../Section';
import TestimonialCarousel from './TestimonialCarousel';

export function Testimonials({ data, style }) {
  if (data.variant === 'carousel') {
    return (
      <Section style={style}>
        <SectionHeading eyebrow={data.eyebrow} inverse={isInverse(style)} />
        <TestimonialCarousel items={data.items || []} inverse={isInverse(style)} />
      </Section>
    );
  }
  return (
    <Section style={style}>
      <SectionHeading {...data} inverse={isInverse(style)} />
      <div className="grid gap-5 md:grid-cols-3">
        {(data.items || []).map((t, i) => (
          <figure key={i} style={{ '--i': i }} className={cn('reveal flex flex-col rounded-theme-lg p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl', i === 1 ? 'bg-ink-950 text-white md:mt-[-16px]' : 'border border-ink-200/70 bg-white text-ink-900')}>
            <div className="flex items-center justify-between">
              <div className={cn('flex gap-0.5', i === 1 ? 'text-accent' : 'text-amber-400')}>
                {Array.from({ length: Number(t.rating) || 5 }, (_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}
              </div>
              <Quote className={cn('h-7 w-7', i === 1 ? 'text-white/20' : 'text-primary/20')} />
            </div>
            <blockquote className={cn('mt-5 flex-1 text-[17px] leading-relaxed', i === 1 ? 'text-white/85' : 'text-ink-700')}>“{t.quote}”</blockquote>
            <figcaption className="mt-7 flex items-center gap-3">
              <span className={cn('grid h-11 w-11 place-items-center rounded-full font-heading text-sm font-bold', i === 1 ? 'bg-accent text-ink-950' : 'bg-primary/10 text-primary')}>{initials(t.name)}</span>
              <span>
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className={cn('block text-xs', i === 1 ? 'text-white/55' : 'text-ink-500')}>{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

// Native <details> gives an accessible accordion without any JavaScript.
export function Faq({ data, style }) {
  return (
    <Section style={style}>
      <SectionHeading {...data} inverse={isInverse(style)} />
      <div className="mx-auto max-w-3xl space-y-3">
        {(data.items || []).map((item, i) => (
          <details key={i} style={{ '--i': i }} className="reveal group rounded-theme-lg border border-ink-200/70 bg-white text-ink-900 transition open:shadow-lg">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-heading text-[17px] font-semibold sm:px-6 [&::-webkit-details-marker]:hidden">
              {item.question}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-600 transition group-open:rotate-45 group-open:bg-primary group-open:text-white"><Plus className="h-4 w-4" /></span>
            </summary>
            <p className="px-5 pb-6 leading-relaxed text-ink-600 sm:px-6">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
