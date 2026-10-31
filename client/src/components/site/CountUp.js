'use client';

import { useEffect, useRef, useState } from 'react';

// "1,800" → counts 0 → 1,800 when it scrolls into view. Values like "15+" or "98%" keep their
// suffix; anything that isn't a plain number (e.g. "24/7") is shown as is.
export default function CountUp({ value, duration = 1400 }) {
  const match = /^([\d,]+)(\D*)$/.exec(String(value));
  const target = match ? Number(match[1].replace(/,/g, '')) : null;
  const [current, setCurrent] = useState(target);
  const ref = useRef(null);

  useEffect(() => {
    if (target === null || !ref.current || !('IntersectionObserver' in window)) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame;
    setCurrent(0);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        setCurrent(Math.round(target * (1 - (1 - t) ** 3))); // ease-out
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [target, duration]);

  if (target === null) return <span>{value}</span>;
  return <span ref={ref}>{new Intl.NumberFormat('en-US').format(current)}{match[2]}</span>;
}
