'use client';

import { useState } from 'react';
import { Building2, CalendarPlus } from 'lucide-react';
import Link from 'next/link';
import { specialtyIcon } from '@/lib/icons';
import { cn, initials } from '@/lib/utils';

function Photo({ doctor, className }) {
  return doctor.photo
    ? <img src={doctor.photo} alt={doctor.name} loading="lazy" className={cn('object-cover', className)} />
    : <span className={cn('grid place-items-center bg-gradient-to-br from-primary to-primary/70 font-heading font-bold text-white', className)}>{initials(doctor.name)}</span>;
}

// Large photo card — best for a short list of featured doctors. Hover reveals a "Book" button.
function PortraitCard({ doctor }) {
  const Icon = specialtyIcon(doctor.specialization);
  return (
    <article className="group relative overflow-hidden rounded-theme-lg bg-ink-100 text-white">
      <Photo doctor={doctor} className="aspect-[4/5] w-full text-4xl transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent transition duration-500 group-hover:from-ink-950/95" />
      <div className="absolute inset-x-0 bottom-0 p-5 transition duration-500 group-hover:-translate-y-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-md"><Icon className="h-3.5 w-3.5 text-accent" />{doctor.specialization}</span>
        <h3 className="mt-2.5 font-heading text-xl font-bold">{doctor.name}</h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/70"><Building2 className="h-3.5 w-3.5" />{doctor.hospital}</p>
      </div>
      <Link href="/contact" className="absolute inset-x-5 bottom-5 inline-flex translate-y-6 items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-semibold text-ink-950 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <CalendarPlus className="h-4 w-4" />Book a visit
      </Link>
    </article>
  );
}

// Compact card with a round photo — fits long lists (e.g. the full doctors page).
function CompactCard({ doctor }) {
  const Icon = specialtyIcon(doctor.specialization);
  return (
    <article className="group flex items-center gap-4 rounded-theme-lg border border-ink-200/70 bg-white p-4 text-ink-900 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <Photo doctor={doctor} className="h-16 w-16 shrink-0 rounded-full object-[50%_20%] text-lg ring-4 ring-primary/10 transition duration-300 group-hover:ring-primary/30" />
      <div className="min-w-0">
        <h3 className="truncate font-heading font-semibold">{doctor.name}</h3>
        <p className="flex items-center gap-1 text-sm font-medium text-primary"><Icon className="h-3.5 w-3.5" />{doctor.specialization}</p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-ink-500"><Building2 className="h-3.5 w-3.5 shrink-0" />{doctor.hospital}</p>
      </div>
    </article>
  );
}

// Doctor cards, optionally with specialty filter buttons above (filters in the browser — no reload).
export default function DoctorGrid({ doctors, portrait, showFilters }) {
  const [filter, setFilter] = useState('');
  const specialties = [...new Set(doctors.map((d) => d.specialization))].sort();
  const shown = filter ? doctors.filter((d) => d.specialization === filter) : doctors;

  return (
    <>
      {showFilters && specialties.length > 1 && (
        <div className="reveal -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0" role="tablist" aria-label="Filter by specialty">
          {['', ...specialties].map((s) => (
            <button key={s || 'all'} type="button" role="tab" aria-selected={filter === s} onClick={() => setFilter(s)}
              className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition', filter === s ? 'border-ink-950 bg-ink-950 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-ink-400 hover:text-ink-950')}
            >
              {s || 'All doctors'}
              <span className={cn('ml-1.5 text-xs', filter === s ? 'text-white/60' : 'text-ink-400')}>{s ? doctors.filter((d) => d.specialization === s).length : doctors.length}</span>
            </button>
          ))}
        </div>
      )}
      {/* key={filter} replays the entrance animation each time the filter changes. */}
      <div key={filter} className={cn('grid gap-5 sm:grid-cols-2', portrait ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
        {shown.map((d, i) => (
          <div key={d._id} className="reveal" style={{ '--i': i % 8 }}>{portrait ? <PortraitCard doctor={d} /> : <CompactCard doctor={d} />}</div>
        ))}
      </div>
    </>
  );
}
