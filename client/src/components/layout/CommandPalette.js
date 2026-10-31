'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ArrowRight, CornerDownLeft, Search, UserRound } from 'lucide-react';
import { Avatar, ConditionBadge } from '@/components/ui';
import { ADMIN_NAV } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApi, useDebounce } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Global search (Ctrl/⌘ + K): jump to any admin page, doctor or patient.
 * Doctors and patients come from the normal list endpoints (limit 5), so permissions and
 * indexes are the same as on the list pages.
 */
export default function CommandPalette({ open, onClose }) {
  const router = useRouter();
  const { can } = useAuth();
  const [text, setText] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef(null);
  const q = useDebounce(text.trim(), 250);

  const search = { q, limit: 5 };
  const { data: doctors, isValidating: loadingDoctors } = useApi(open && q && can('doctors') ? '/doctors' : null, search);
  const { data: patients, isValidating: loadingPatients } = useApi(open && q && can('patients') ? '/patients' : null, search);

  // Everything shown, as one flat list so the arrow keys can move through all groups.
  const groups = useMemo(() => {
    const needle = text.trim().toLowerCase();
    const pages = ADMIN_NAV.flatMap((s) => s.items)
      .filter((item) => (!item.perm || can(item.perm)) && item.label.toLowerCase().includes(needle))
      .map((item) => ({ key: item.href, href: item.href, icon: item.icon, title: item.label, type: 'page' }));
    const result = [{ title: 'Pages', items: pages }];
    if (q) {
      result.push({ title: 'Doctors', items: (doctors?.items || []).map((d) => ({ key: d._id, href: `/admin/doctors/${d._id}`, title: d.name, subtitle: `${d.specialization} · ${d.hospital}`, photo: d.photo, type: 'doctor' })) });
      result.push({ title: 'Patients', items: (patients?.items || []).map((p) => ({ key: p._id, href: `/admin/patients?q=${encodeURIComponent(p.name)}`, title: p.name, subtitle: `${p.age}y · ${p.diagnosis || 'No diagnosis'} · ${p.doctor?.name || ''}`, condition: p.condition, type: 'patient' })) });
    }
    return result.filter((g) => g.items.length);
  }, [text, q, doctors, patients, can]);

  const flat = groups.flatMap((g) => g.items);

  useEffect(() => {
    if (!open) return;
    setText('');
    setActive(0);
    setTimeout(() => input.current?.focus(), 0);
  }, [open]);
  useEffect(() => setActive(0), [text, doctors, patients]);

  if (!open) return null;

  const go = (item) => {
    if (!item) return;
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, flat.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); go(flat[active]); }
    if (e.key === 'Escape') onClose();
  };

  const loading = (loadingDoctors || loadingPatients) && q;
  let index = -1;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-2xl dark:border-white/10 dark:bg-ink-900">
        <div className="flex items-center gap-3 border-b border-ink-100 px-4 dark:border-white/5">
          <Search className={cn('h-5 w-5 shrink-0 text-ink-400', loading && 'animate-blink')} />
          <input
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search doctors, patients or pages…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400 dark:text-white"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={flat[active] ? `cmdk-${flat[active].key}` : undefined}
          />
          <kbd className="a-kbd">Esc</kbd>
        </div>

        <div id="cmdk-list" role="listbox" className="a-scroll max-h-[60vh] overflow-y-auto p-2">
          {flat.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-ink-400">{loading ? 'Searching…' : `No results for “${text}”`}</p>
          )}
          {groups.map((group) => (
            <div key={group.title} className="pb-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[.12em] text-ink-400">{group.title}</p>
              {group.items.map((item) => {
                index += 1;
                const i = index;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    id={`cmdk-${item.key}`}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(item)}
                    className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition', i === active ? 'bg-ink-100 dark:bg-white/5' : '')}
                  >
                    {item.type === 'page' && <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-100 text-ink-600 dark:bg-white/5 dark:text-ink-300"><Icon className="h-4 w-4" /></span>}
                    {item.type === 'doctor' && <Avatar name={item.title} src={item.photo} size={32} />}
                    {item.type === 'patient' && <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-100 text-ink-500 dark:bg-white/5"><UserRound className="h-4 w-4" /></span>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-900 dark:text-white">{item.title}</span>
                      {item.subtitle && <span className="block truncate text-xs text-ink-400">{item.subtitle}</span>}
                    </span>
                    {item.condition && <ConditionBadge condition={item.condition} />}
                    {i === active ? <CornerDownLeft className="h-4 w-4 text-ink-400" /> : <ArrowRight className="h-4 w-4 text-transparent" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-ink-100 px-4 py-2.5 text-[11px] text-ink-400 dark:border-white/5">
          <span className="flex items-center gap-1.5"><kbd className="a-kbd">↑</kbd><kbd className="a-kbd">↓</kbd>move</span>
          <span className="flex items-center gap-1.5"><kbd className="a-kbd">↵</kbd>open</span>
          <span className="ml-auto">Searches name, email, phone & diagnosis</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
