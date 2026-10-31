'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown, ExternalLink, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Search, Settings2,
  Stethoscope, Sun, X,
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { ADMIN_NAV } from '@/config/navigation';
import { ROLE_LABELS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks';
import { applyPreferences } from '@/lib/adminTheme';
import { cn } from '@/lib/utils';
import Customizer from './Customizer';

// Only downloaded the first time someone opens the search.
const CommandPalette = dynamic(() => import('./CommandPalette'), { ssr: false });

// Ctrl/⌘ + K opens the global search from anywhere in the admin.
function useSearchShortcut(open) {
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
}

// `collapsed` shows icons only (labels become tooltips). The mobile drawer is never collapsed.
function Sidebar({ collapsed = false, onNavigate }) {
  const pathname = usePathname();
  const { user, can, logout } = useAuth();
  const { data: brand } = useApi('/public/admin-brand');
  const { data: inbox } = useApi(can('messages') ? '/messages' : null, { status: 'unread', limit: 1 }, { refreshInterval: 60000 });

  const active = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  return (
    <div className="flex h-full flex-col bg-white dark:bg-ink-900">
      <Link href="/admin" onClick={onNavigate} className={cn('flex h-[72px] shrink-0 items-center gap-3 font-heading text-lg font-bold tracking-tight text-ink-950 dark:text-white', collapsed ? 'justify-center px-0' : 'px-6')}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand-glow"><Stethoscope className="h-5 w-5" /></span>
        {!collapsed && <span className="truncate">{brand?.appName || 'Doctor Tracker'}</span>}
      </Link>

      <nav className={cn('a-scroll flex-1 space-y-6 overflow-y-auto py-3', collapsed ? 'px-3' : 'px-4')}>
        {ADMIN_NAV.map((section) => {
          const items = section.items.filter((item) => !item.perm || can(item.perm));
          if (!items.length) return null;
          return (
            <div key={section.title}>
              {collapsed
                ? <div className="mx-auto mb-2 h-px w-6 bg-ink-200 dark:bg-white/10" />
                : <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[.14em] text-ink-400">{section.title}</p>}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const isActive = active(item);
                  const unread = item.badge === 'messages' ? inbox?.unread : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition',
                          collapsed ? 'justify-center px-0' : 'px-3',
                          isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
                            : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white',
                        )}
                      >
                        <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-brand-600 dark:text-brand-300')} />
                        {!collapsed && <span className="flex-1">{item.label}</span>}
                        {unread > 0 && (collapsed
                          ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
                          : <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span>)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className={cn('shrink-0 space-y-1 border-t border-ink-100 dark:border-white/5', collapsed ? 'p-3' : 'p-4')}>
        <a href="/" target="_blank" rel="noopener noreferrer" title={collapsed ? 'View website' : undefined}
          className={cn('flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/5', collapsed ? 'justify-center' : 'px-3')}
        >
          <ExternalLink className="h-[18px] w-[18px]" />{!collapsed && 'View website'}
        </a>
        {collapsed ? (
          <button type="button" onClick={logout} title="Sign out" aria-label="Sign out" className="flex w-full justify-center rounded-xl py-2.5 text-ink-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-3 dark:bg-white/5">
            <Avatar name={user?.name} size={36} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs text-ink-400">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
            <button type="button" onClick={logout} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-white hover:text-rose-600 dark:hover:bg-white/10" title="Sign out" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// Horizontal layout: the same links in a row under the header (sections become dropdowns).
function TopNav() {
  const pathname = usePathname();
  const { can } = useAuth();
  const active = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));
  const sections = ADMIN_NAV.map((s) => ({ ...s, items: s.items.filter((item) => !item.perm || can(item.perm)) })).filter((s) => s.items.length);
  const [first, ...rest] = sections;

  const linkClass = (isActive) => cn('flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/5');

  return (
    <nav className="hidden border-b border-ink-200/70 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-ink-900/80 lg:block" aria-label="Main">
      <ul className="mx-auto flex max-w-[1400px] items-center gap-1 px-8 py-2">
        {/* The first section (Clinic) shows its links directly… */}
        {first?.items.map((item) => (
          <li key={item.href}><Link href={item.href} className={linkClass(active(item))}><item.icon className="h-4 w-4" />{item.label}</Link></li>
        ))}
        {/* …the others open as dropdowns on hover. */}
        {rest.map((section) => {
          const sectionActive = section.items.some(active);
          return (
            <li key={section.title} className="group relative">
              <button type="button" className={linkClass(sectionActive)}>{section.title}<ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" /></button>
              <div className="invisible absolute left-0 top-full z-30 w-56 translate-y-1 pt-1 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <ul className="rounded-xl border border-ink-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-ink-900">
                  {section.items.map((item) => (
                    <li key={item.href}><Link href={item.href} className={linkClass(active(item))}><item.icon className="h-4 w-4" />{item.label}</Link></li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Follows the operating system's light/dark setting when the theme is "system".
function useSystemDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    setDark(query.matches);
    const onChange = (e) => setDark(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return dark;
}

export default function Shell({ children }) {
  const { user, logout, preferences: p, updatePreferences } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [mac, setMac] = useState(false);
  const systemDark = useSystemDark();
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeCustomizer = useCallback(() => setCustomizing(false), []);
  useSearchShortcut(openSearch);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  const dark = p.theme === 'dark' || (p.theme === 'system' && systemDark);
  // Colours, font, text size and zoom from the user's preferences; removed again when leaving the admin.
  useEffect(() => applyPreferences(p, dark), [p, dark]);

  const horizontal = p.layout === 'horizontal';
  const collapsed = p.sidebarCollapsed;
  const right = p.sidebarSide === 'right';
  const CollapseIcon = right ? (collapsed ? PanelRightOpen : PanelRightClose) : (collapsed ? PanelLeftOpen : PanelLeftClose);
  const width = collapsed ? 'lg:w-[80px]' : 'lg:w-[264px]';
  const offset = horizontal ? '' : right ? (collapsed ? 'lg:pr-[80px]' : 'lg:pr-[264px]') : (collapsed ? 'lg:pl-[80px]' : 'lg:pl-[264px]');

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-950 dark:text-ink-100">
      {!horizontal && (
        <aside className={cn('fixed inset-y-0 z-30 hidden transition-[width] duration-300 lg:block', width, right ? 'right-0 border-l' : 'left-0 border-r', 'border-ink-200/70 dark:border-white/5')}>
          <Sidebar collapsed={collapsed} />
        </aside>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink-950/50" onClick={() => setMobileOpen(false)} />
          <aside className={cn('absolute inset-y-0 w-72 shadow-xl', right ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in')}>
            <button type="button" onClick={() => setMobileOpen(false)} className="a-btn-ghost a-btn-icon absolute right-3 top-4 z-10" aria-label="Close menu"><X className="h-5 w-5" /></button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className={cn('transition-[padding] duration-300', offset)}>
        <div className="sticky top-0 z-20">
          <header className={cn('flex h-[72px] items-center gap-2 border-b border-ink-200/70 bg-white/80 px-4 backdrop-blur-xl dark:border-white/5 dark:bg-ink-900/80 sm:px-6 lg:px-8', right && !horizontal && 'flex-row-reverse')}>
            <button type="button" onClick={() => setMobileOpen(true)} className="a-btn-ghost a-btn-icon lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            {horizontal ? (
              <Link href="/admin" className="mr-4 hidden items-center gap-2.5 font-heading text-lg font-bold tracking-tight text-ink-950 dark:text-white lg:flex">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand-glow"><Stethoscope className="h-5 w-5" /></span>
                Doctor Tracker
              </Link>
            ) : (
              <button type="button" onClick={() => updatePreferences({ sidebarCollapsed: !collapsed })} className="a-btn-ghost a-btn-icon hidden lg:inline-flex" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                <CollapseIcon className="h-[18px] w-[18px]" />
              </button>
            )}

            <button type="button" onClick={openSearch}
              className="mx-1 flex h-10 w-full max-w-sm items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50/80 px-3 text-sm text-ink-400 transition hover:border-ink-300 hover:bg-white dark:border-white/10 dark:bg-white/5"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 truncate text-left">Search doctors, patients…</span>
              <span className="hidden items-center gap-1 sm:flex"><kbd className="a-kbd">{mac ? '⌘' : 'Ctrl'}</kbd><kbd className="a-kbd">K</kbd></span>
            </button>

            <div className="flex-1" />
            <span className="hidden px-2 text-sm text-ink-400 xl:block" suppressHydrationWarning>{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span>
            <button type="button" onClick={() => updatePreferences({ theme: dark ? 'light' : 'dark' })} className="a-btn-ghost a-btn-icon" aria-label="Toggle dark mode">
              {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <button type="button" onClick={() => setCustomizing(true)} className="a-btn-ghost a-btn-icon" title="Customize" aria-label="Customize">
              <Settings2 className="h-[18px] w-[18px]" />
            </button>
            {horizontal && (
              <div className="hidden items-center gap-2 border-l border-ink-200 pl-3 dark:border-white/10 lg:flex">
                <Avatar name={user?.name} size={34} />
                <a href="/" target="_blank" rel="noopener noreferrer" className="a-btn-ghost a-btn-icon" title="View website" aria-label="View website"><ExternalLink className="h-4 w-4" /></a>
                <button type="button" onClick={logout} className="a-btn-ghost a-btn-icon hover:text-rose-600" title="Sign out" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
              </div>
            )}
            <Avatar name={user?.name} size={36} className="lg:hidden" />
          </header>
          {horizontal && <TopNav />}
        </div>
        <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {searchOpen && <CommandPalette open onClose={() => setSearchOpen(false)} />}
      {customizing && <Customizer onClose={closeCustomizer} />}
    </div>
  );
}
