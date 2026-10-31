'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Image grid with a lightbox: click to enlarge, ← / → to browse, Esc to close.
export default function GalleryGrid({ images, gridClass }) {
  const [index, setIndex] = useState(null);
  const open = index !== null;
  const step = useCallback((dir) => setIndex((i) => (i + dir + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setIndex(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, step]);

  const current = open ? images[index] : null;

  return (
    <>
      <div className={cn('grid gap-4', gridClass)}>
        {images.map((img, i) => (
          <figure key={i} style={{ '--i': i }} className="reveal group relative overflow-hidden rounded-theme-lg">
            <button type="button" onClick={() => setIndex(i)} className="block w-full" aria-label={`Open image${img.caption ? `: ${img.caption}` : ''}`}>
              <img src={img.src} alt={img.caption || ''} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute right-3 top-3 grid h-9 w-9 scale-75 place-items-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow transition duration-300 group-hover:scale-100 group-hover:opacity-100"><Expand className="h-4 w-4" /></span>
            </button>
            {img.caption && (
              <figcaption className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink-900 shadow backdrop-blur-md transition duration-300 group-hover:-translate-y-1">{img.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-ink-950/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setIndex(null)}>
          <figure className="relative max-h-full max-w-5xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={current.caption || ''} className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl" />
            <figcaption className="mt-4 flex items-center justify-between gap-4 text-sm text-white/80">
              <span>{current.caption}</span>
              <span className="tabular-nums text-white/50">{index + 1} / {images.length}</span>
            </figcaption>
          </figure>
          <button type="button" onClick={() => setIndex(null)} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20" aria-label="Close"><X className="h-5 w-5" /></button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20" aria-label="Previous image"><ChevronLeft className="h-6 w-6" /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20" aria-label="Next image"><ChevronRight className="h-6 w-6" /></button>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
