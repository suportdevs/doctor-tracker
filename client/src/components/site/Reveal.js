'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Plays the scroll-in animation once: children with the `reveal` class fade up when this box
 * reaches the screen. Give items style={{ '--i': index }} to stagger them (see globals.css).
 */
export default function Reveal({ children, className }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setShown(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} data-reveal={shown ? 'in' : ''} className={className}>{children}</div>;
}
