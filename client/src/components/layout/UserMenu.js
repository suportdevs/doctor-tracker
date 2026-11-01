'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { ROLE_LABELS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

// App bar account menu: avatar + name, opening a dropdown with "My profile" and "Sign out".
export default function UserMenu() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Close on navigation, outside click or Esc.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const role = ROLE_LABELS[user?.role] || user?.role;
  const itemClass = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition';

  return (
    <div ref={boxRef} className="relative shrink-0">
      <button type="button" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu"
        className={cn('flex items-center gap-2.5 rounded-lg p-1 transition hover:bg-ink-100 dark:hover:bg-white/5 sm:pr-2', open && 'bg-ink-100 dark:bg-white/5')}
      >
        <Avatar name={user?.name} size={32} />
        <span className="hidden text-left leading-tight md:block">
          <span className="block max-w-[140px] truncate text-sm font-medium text-ink-900 dark:text-white">{user?.name}</span>
          <span className="block text-xs text-ink-400">{role}</span>
        </span>
        <ChevronDown className={cn('hidden h-4 w-4 text-ink-400 transition sm:block', open && 'rotate-180')} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 animate-fade-in rounded-xl border border-ink-200/80 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-ink-900">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar name={user?.name} size={36} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs text-ink-400">{user?.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-ink-100 dark:bg-white/5" />
          <Link href="/admin/profile" role="menuitem" className={cn(itemClass, 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-white/5')}>
            <UserRound className="h-4 w-4 text-ink-400" />My profile
          </Link>
          <button type="button" role="menuitem" onClick={logout} className={cn(itemClass, 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10')}>
            <LogOut className="h-4 w-4" />Sign out
          </button>
        </div>
      )}
    </div>
  );
}
