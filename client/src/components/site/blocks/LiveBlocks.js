import { ArrowUpRight } from 'lucide-react';
import { specialtyIcon } from '@/lib/icons';
import DoctorGrid from './DoctorGrid';
import { Section, SectionHeading, SmartLink, isInverse } from '../Section';

// `live` comes from GET /api/public/live — always the current doctor list.
export function Doctors({ data, style, live }) {
  const filter = (data.specialization || '').trim().toLowerCase();
  const portrait = data.layout === 'portrait';
  const doctors = (live?.doctors || [])
    .filter((d) => !filter || d.specialization.toLowerCase() === filter)
    .slice(0, Number(data.count) || 8);
  return (
    <Section style={style}>
      <SectionHeading {...data} inverse={isInverse(style)} />
      {doctors.length === 0 ? (
        <p className="text-center text-sm opacity-60">No doctors to show yet.</p>
      ) : (
        <DoctorGrid doctors={doctors} portrait={portrait} showFilters={data.showFilters} />
      )}
      {data.buttonLabel && (
        <div className="mt-12 text-center"><SmartLink href={data.buttonUrl || '#'} className="btn-outline">{data.buttonLabel}<ArrowUpRight className="h-4 w-4" /></SmartLink></div>
      )}
    </Section>
  );
}

export function Specialties({ data, style, live }) {
  const items = live?.specialties || [];
  return (
    <Section style={style}>
      <SectionHeading {...data} inverse={isInverse(style)} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((s, i) => {
          const Icon = specialtyIcon(s.name);
          return (
            <div key={s.name} style={{ '--i': i }} className="reveal group flex items-center gap-3 rounded-theme-lg border border-ink-200/70 bg-white p-4 text-ink-900 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{s.name}</p>
                <p className="text-xs text-ink-500">{s.doctors} doctor{s.doctors === 1 ? '' : 's'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
