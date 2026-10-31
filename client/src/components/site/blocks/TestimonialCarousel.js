'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { cn, initials } from '@/lib/utils';

// One big quote at a time. Slides every 6 seconds; pauses while the mouse is over it.
export default function TestimonialCarousel({ items, inverse }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (paused || count < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (!count) return null;
  const t = items[index];
  const go = (step) => setIndex((i) => (i + step + count) % count);

  return (
    <div className="reveal mx-auto max-w-4xl text-center" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* key={index} replays the fade on every change */}
      <figure key={index} className="animate-fade-up">
        <div className={cn('flex justify-center gap-1', inverse ? 'text-accent' : 'text-amber-400')}>
          {Array.from({ length: Number(t.rating) || 5 }, (_, s) => <Star key={s} className="h-5 w-5 fill-current" />)}
        </div>
        <blockquote className="mt-8 text-balance font-heading text-2xl font-semibold leading-snug tracking-tight sm:text-4xl">“{t.quote}”</blockquote>
        <figcaption className="mt-10 flex items-center justify-center gap-3">
          <span className={cn('grid h-12 w-12 place-items-center rounded-full font-heading font-bold', inverse ? 'bg-accent text-ink-950' : 'bg-primary text-white')}>{initials(t.name)}</span>
          <span className="text-left">
            <span className="block font-semibold">{t.name}</span>
            <span className="block text-sm opacity-60">{t.role}</span>
          </span>
        </figcaption>
      </figure>
      {count > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(-1)} className={cn('grid h-11 w-11 place-items-center rounded-full border transition', inverse ? 'border-white/20 hover:bg-white/10' : 'border-ink-200 hover:bg-ink-100')} aria-label="Previous quote"><ArrowLeft className="h-4 w-4" /></button>
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Quote ${i + 1}`}
                className={cn('h-2 rounded-full transition-all duration-300', i === index ? 'w-8 bg-primary' : cn('w-2', inverse ? 'bg-white/30' : 'bg-ink-300'))} />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} className={cn('grid h-11 w-11 place-items-center rounded-full border transition', inverse ? 'border-white/20 hover:bg-white/10' : 'border-ink-200 hover:bg-ink-100')} aria-label="Next quote"><ArrowRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
