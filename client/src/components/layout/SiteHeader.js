'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Stethoscope, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartLink } from '@/components/site/Section';

function Logo({ general }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5 font-heading text-xl font-bold tracking-tight text-ink-950">
      {general.logo
        ? <img src={general.logo} alt={general.siteName} className="h-9 w-auto" />
        : <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-950 text-accent transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-105"><Stethoscope className="h-5 w-5" /></span>}
      {!general.logo && <span>{general.siteName}</span>}
    </Link>
  );
}

// `items` = the header menu chosen in Site settings.
export default function Header({ settings, items = [] }) {
  const { general, appearance } = settings;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const cta = appearance.headerCta;

  useEffect(() => setOpen(false), [pathname]);
  // Shadow once the page scrolls + a thin reading-progress bar under the header.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (url) => (url === '/' ? pathname === '/' : pathname.startsWith(url));

  return (
    <header className={cn('sticky top-0 z-40 border-b bg-white/80 backdrop-blur-xl transition', scrolled ? 'border-ink-200/70 shadow-sm' : 'border-transparent')}>
      <div className="container-site flex h-[72px] items-center justify-between gap-6">
        <Logo general={general} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {items.map((item) => (
            <div key={item.label + item.url} className="group relative">
              <SmartLink href={item.url} className={cn('flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition', isActive(item.url) ? 'bg-ink-950 text-white' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-950')}>
                {item.label}
                {item.children?.length > 0 && <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />}
              </SmartLink>
              {item.children?.length > 0 && (
                <div className="invisible absolute left-0 top-full w-56 translate-y-2 rounded-theme-lg border border-ink-200 bg-white p-2 opacity-0 shadow-xl transition duration-200 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                  {item.children.map((child) => (
                    <SmartLink key={child.label + child.url} href={child.url} className="block rounded-theme px-3 py-2 text-sm font-medium text-ink-600 transition hover:translate-x-1 hover:bg-ink-50 hover:text-primary">{child.label}</SmartLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {cta?.enabled && cta.label && <SmartLink href={cta.url} className="btn-primary hidden px-5 py-2.5 sm:inline-flex">{cta.label}</SmartLink>}
          <button type="button" onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-100 lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <span className="absolute bottom-0 left-0 h-[2px] bg-primary transition-[width] duration-150" style={{ width: `${progress * 100}%` }} aria-hidden="true" />

      {open && (
        <nav className="animate-fade-in border-t border-ink-100 bg-white lg:hidden" aria-label="Mobile">
          <div className="container-site space-y-1 py-4">
            {items.map((item) => (
              <div key={item.label + item.url}>
                <SmartLink href={item.url} className={cn('block rounded-xl px-3 py-2.5 font-semibold', isActive(item.url) ? 'bg-ink-950 text-white' : 'text-ink-700')}>{item.label}</SmartLink>
                {item.children?.map((child) => (
                  <SmartLink key={child.label + child.url} href={child.url} className="block rounded-xl py-2 pl-7 pr-3 text-sm text-ink-500">{child.label}</SmartLink>
                ))}
              </div>
            ))}
            {cta?.enabled && cta.label && <SmartLink href={cta.url} className="btn-primary mt-3 w-full">{cta.label}</SmartLink>}
          </div>
        </nav>
      )}
    </header>
  );
}
