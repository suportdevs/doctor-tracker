'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, Stethoscope, UserRound, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApi, useDebounce } from '@/hooks';
import { Avatar, ConditionBadge, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

const LIMIT = 5;

/**
 * App bar search: finds doctors and patients as you type (debounced) and shows them in a dropdown.
 * Reuses the normal list endpoints (?q=), so permissions and indexes apply as usual.
 * Keyboard: Ctrl/⌘+K focuses it, ↑/↓ move, Enter opens, Esc closes.
 */
export default function GlobalSearch() {
  const router = useRouter();
  const { can } = useAuth();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const q = useDebounce(text.trim(), 250);
  const ready = open && q.length >= 2;
  const { data: doctors, isLoading: loadingDoctors } = useApi(ready && can('doctors') ? '/doctors' : null, { q, limit: LIMIT });
  const { data: patients, isLoading: loadingPatients } = useApi(ready && can('patients') ? '/patients' : null, { q, limit: LIMIT });

  // One flat list, so the arrow keys can move across both groups.
  const results = ready ? [
    ...(doctors?.items || []).map((d) => ({ type: 'doctor', id: d._id, href: `/admin/doctors/${d._id}`, title: d.name, subtitle: `${d.specialization} · ${d.hospital}`, doctor: d })),
    ...(patients?.items || []).map((p) => ({ type: 'patient', id: p._id, href: `/admin/patients?q=${encodeURIComponent(p.name)}`, title: p.name, subtitle: `${p.age}y · ${p.diagnosis || 'No diagnosis'}${p.doctor ? ` · ${p.doctor.name}` : ''}`, patient: p })),
  ] : [];
  const loading = ready && (loadingDoctors || loadingPatients);

  useEffect(() => setActive(0), [q]);

  // Ctrl/⌘ + K focuses the search from anywhere in the admin.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const go = (href) => {
    router.push(href);
    setOpen(false);
    setText('');
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active].href);
    }
  };

  const group = (type, label, Icon, seeAllHref) => {
    const items = results.filter((r) => r.type === type);
    if (!items.length) return null;
    return (
      <div className="py-1.5">
        <p className="flex items-center gap-1.5 px-3 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-ink-400"><Icon className="h-3.5 w-3.5" />{label}</p>
        {items.map((r) => {
          const index = results.indexOf(r);
          return (
            <button key={r.id} type="button" onMouseEnter={() => setActive(index)} onClick={() => go(r.href)}
              className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition', index === active ? 'bg-ink-100 dark:bg-white/5' : '')}
            >
              <Avatar name={r.title} src={r.doctor?.photo} size={30} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink-900 dark:text-white">{r.title}</span>
                <span className="block truncate text-xs text-ink-400">{r.subtitle}</span>
              </span>
              {r.patient && <ConditionBadge condition={r.patient.condition} />}
            </button>
          );
        })}
        <button type="button" onClick={() => go(seeAllHref)} className="flex w-full items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-700 hover:text-brand-900 dark:text-brand-300">
          See all {label.toLowerCase()} for “{q}” <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    );
  };

  return (
    <div ref={boxRef} className="relative min-w-0 flex-1 sm:max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => { setText(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search doctors, patients…"
        aria-label="Search doctors and patients"
        className="a-input border-transparent bg-ink-100/70 pl-9 pr-16 hover:border-transparent focus:bg-white dark:bg-white/5"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 sm:block">
        {text ? null : <kbd className="a-kbd">Ctrl K</kbd>}
      </span>
      {text && (
        <button type="button" onClick={() => { setText(''); inputRef.current?.focus(); }} className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded text-ink-400 hover:text-ink-700" aria-label="Clear search">
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && text.trim() && (
        <div className="fixed inset-x-4 top-[68px] z-50 animate-fade-in overflow-hidden rounded-xl border border-ink-200/80 bg-white shadow-xl dark:border-white/10 dark:bg-ink-900 sm:absolute sm:inset-x-0 sm:top-full sm:mt-2">
          <div className="a-scroll max-h-[70vh] overflow-y-auto px-1.5">
            {q.length < 2 || text.trim() !== q ? (
              <p className="flex items-center gap-2 px-3 py-4 text-sm text-ink-400">{text.trim().length < 2 ? 'Type at least 2 characters…' : <><Spinner />Searching…</>}</p>
            ) : loading && !results.length ? (
              <p className="flex items-center gap-2 px-3 py-4 text-sm text-ink-400"><Spinner />Searching…</p>
            ) : results.length ? (
              <>
                {group('doctor', 'Doctors', Stethoscope, `/admin/doctors?q=${encodeURIComponent(q)}`)}
                {group('patient', 'Patients', UserRound, `/admin/patients?q=${encodeURIComponent(q)}`)}
              </>
            ) : (
              <p className="px-3 py-4 text-sm text-ink-400">No doctors or patients match “{q}”.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
