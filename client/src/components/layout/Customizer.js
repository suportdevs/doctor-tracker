'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Monitor, Moon, PanelLeft, PanelRight, RotateCcw, Sun, X } from 'lucide-react';
import { Toggle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { ACCENTS, DEFAULT_PREFERENCES, FONTS, FONT_SIZES, ZOOM_LEVELS } from '@/lib/adminTheme';
import { cn } from '@/lib/utils';

function Group({ title, hint, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[.14em] text-ink-400">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

// A selectable tile (theme, layout, side…).
function Choice({ active, disabled, onClick, children, className }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={active}
      className={cn('relative rounded-xl border-2 p-3 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
        active ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200' : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-white/10 dark:text-ink-300', className)}
    >
      {children}
      {active && <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-white"><Check className="h-3 w-3" /></span>}
    </button>
  );
}

// Tiny drawing of a layout for the layout tiles.
function LayoutPreview({ horizontal }) {
  return (
    <span className="mb-2 flex h-14 overflow-hidden rounded-lg border border-current/20 bg-white/60 dark:bg-white/5">
      {horizontal ? (
        <span className="flex w-full flex-col">
          <span className="h-3 w-full bg-current opacity-30" />
          <span className="m-1.5 flex-1 rounded bg-current opacity-10" />
        </span>
      ) : (
        <>
          <span className="w-4 bg-current opacity-30" />
          <span className="m-1.5 flex-1 rounded bg-current opacity-10" />
        </>
      )}
    </span>
  );
}

// Admin look & feel, saved to the signed-in user's account (PUT /auth/me/preferences).
export default function Customizer({ onClose }) {
  const { preferences: p, updatePreferences: set } = useAuth();
  const horizontal = p.layout === 'horizontal';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Customize">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/20" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[380px] animate-slide-in-right flex-col border-l border-ink-200/70 bg-white shadow-2xl dark:border-white/10 dark:bg-ink-900">
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5 dark:border-white/5">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink-950 dark:text-white">Customize</h2>
            <p className="text-xs text-ink-400">Saved to your account — follows you on every device.</p>
          </div>
          <button type="button" onClick={onClose} className="a-btn-ghost a-btn-icon -mr-2" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="a-scroll flex-1 space-y-7 overflow-y-auto px-6 py-6">
          <Group title="Theme">
            <div className="grid grid-cols-3 gap-2">
              {[['light', Sun, 'Light'], ['dark', Moon, 'Dark'], ['system', Monitor, 'System']].map(([value, Icon, label]) => (
                <Choice key={value} active={p.theme === value} onClick={() => set({ theme: value })} className="flex flex-col items-center gap-1.5 py-4">
                  <Icon className="h-5 w-5" />{label}
                </Choice>
              ))}
            </div>
          </Group>

          <Group title="Accent colour">
            <div className="flex flex-wrap gap-3">
              {Object.entries(ACCENTS).map(([name, shades]) => (
                <button key={name} type="button" onClick={() => set({ accent: name })} title={name} aria-label={`${name} accent`} aria-pressed={p.accent === name}
                  className={cn('grid h-10 w-10 place-items-center rounded-full text-white ring-offset-2 transition hover:scale-110 dark:ring-offset-ink-900', p.accent === name && 'ring-2')}
                  style={{ background: `linear-gradient(135deg, ${shades[4]}, ${shades[7]})`, '--tw-ring-color': shades[6] }}
                >
                  {p.accent === name && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </Group>

          <Group title="Menu layout">
            <div className="grid grid-cols-2 gap-2">
              <Choice active={!horizontal} onClick={() => set({ layout: 'vertical' })}><LayoutPreview />Vertical sidebar</Choice>
              <Choice active={horizontal} onClick={() => set({ layout: 'horizontal' })}><LayoutPreview horizontal />Horizontal top menu</Choice>
            </div>
          </Group>

          <Group title="Sidebar" hint={horizontal ? 'Only for the vertical layout.' : undefined}>
            <div className="grid grid-cols-2 gap-2">
              <Choice active={p.sidebarSide === 'left'} disabled={horizontal} onClick={() => set({ sidebarSide: 'left' })} className="flex items-center gap-2"><PanelLeft className="h-4 w-4" />Left</Choice>
              <Choice active={p.sidebarSide === 'right'} disabled={horizontal} onClick={() => set({ sidebarSide: 'right' })} className="flex items-center gap-2"><PanelRight className="h-4 w-4" />Right</Choice>
            </div>
            <div className={cn(horizontal && 'pointer-events-none opacity-40')}>
              <Toggle checked={p.sidebarCollapsed} onChange={(v) => set({ sidebarCollapsed: v })} label="Collapsed (icons only)" />
            </div>
          </Group>

          <Group title="Font">
            <div className="grid gap-2">
              {Object.entries(FONTS).map(([key, font]) => (
                <Choice key={key} active={p.font === key} onClick={() => set({ font: key })} className="flex items-baseline justify-between pr-8">
                  <span style={{ fontFamily: font.css }}>{font.label}</span>
                  <span className="text-xs text-ink-400" style={{ fontFamily: font.css }}>Aa 123</span>
                </Choice>
              ))}
            </div>
          </Group>

          <Group title="Font size">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(FONT_SIZES).map(([key, s], i) => (
                <Choice key={key} active={p.fontSize === key} onClick={() => set({ fontSize: key })} className="flex flex-col items-center py-3">
                  <span className="font-heading font-bold" style={{ fontSize: `${14 + i * 3}px` }}>Aa</span>
                  <span className="text-xs">{s.label}</span>
                </Choice>
              ))}
            </div>
          </Group>

          <Group title="Zoom" hint="Scales the whole admin panel.">
            <div className="grid grid-cols-4 gap-2">
              {ZOOM_LEVELS.map((z) => (
                <Choice key={z} active={p.zoom === z} onClick={() => set({ zoom: z })} className="py-2.5 text-center tabular-nums">{z}%</Choice>
              ))}
            </div>
          </Group>
        </div>

        <div className="border-t border-ink-100 p-4 dark:border-white/5">
          <button type="button" className="a-btn-secondary w-full" onClick={() => set(DEFAULT_PREFERENCES)}><RotateCcw className="h-4 w-4" />Reset to default</button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
