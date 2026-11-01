'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, Moon, Stethoscope, Sun, X } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { ADMIN_NAV } from '@/config/navigation';
import { ROLE_LABELS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import GlobalSearch from './GlobalSearch';
import UserMenu from './UserMenu';

const THEME_KEY = 'dt_theme';

// Light / dark mode, remembered in this browser. The class is removed again when leaving the admin.
function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try { setDark(localStorage.getItem(THEME_KEY) === 'dark'); } catch { /* storage blocked */ }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    return () => document.documentElement.classList.remove('dark');
  }, [dark]);
  const toggle = () => setDark((d) => {
    try { localStorage.setItem(THEME_KEY, d ? 'light' : 'dark'); } catch { /* storage blocked */ }
    return !d;
  });
  return [dark, toggle];
}

function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const { user, can, logout } = useAuth();
  const active = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  return (
    <div className="flex h-full flex-col bg-white dark:bg-ink-900">
      <Link href="/admin" onClick={onNavigate} className="flex h-16 shrink-0 items-center gap-2.5 px-5 text-[15px] font-semibold tracking-tight text-ink-950 dark:text-white">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-white"><Stethoscope className="h-4 w-4" /></span>
        <span className="truncate">Doctor Tracker</span>
      </Link>

      <nav className="a-scroll flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map((section) => {
          const items = section.items.filter((item) => !item.perm || can(item.perm));
          if (!items.length) return null;
          return (
            <div key={section.title}>
              <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-400">{section.title}</p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const isActive = active(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                          isActive
                            ? 'bg-ink-100 text-ink-950 dark:bg-white/[.06] dark:text-white'
                            : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-white/5 dark:hover:text-white',
                        )}
                      >
                        <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-brand-600 dark:text-brand-300')} />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-ink-100 p-3 dark:border-white/5">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar name={user?.name} size={32} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{user?.name}</p>
            <p className="truncate text-xs text-ink-400">{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
          <button type="button" onClick={logout} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-white hover:text-rose-600 dark:hover:bg-white/10" title="Sign out" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

export default function Shell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, toggleDark] = useDarkMode();

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-950 dark:text-ink-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-ink-200/70 dark:border-white/5 lg:block">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-in shadow-xl">
            <button type="button" onClick={() => setMobileOpen(false)} className="a-btn-ghost a-btn-icon absolute right-3 top-4 z-10" aria-label="Close menu"><X className="h-5 w-5" /></button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-200/70 bg-white/90 px-4 backdrop-blur dark:border-white/5 dark:bg-ink-900/90 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} className="a-btn-ghost a-btn-icon lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <GlobalSearch />
          <div className="hidden flex-1 sm:block" />
          <span className="hidden px-2 text-sm text-ink-400 xl:block" suppressHydrationWarning>{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span>
          <button type="button" onClick={toggleDark} className="a-btn-ghost a-btn-icon" aria-label="Toggle dark mode">
            {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <UserMenu />
        </header>
        <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
