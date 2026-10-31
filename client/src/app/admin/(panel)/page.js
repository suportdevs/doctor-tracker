'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Stethoscope, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import RequirePermission from '@/components/auth/RequirePermission';
import { TopDoctors } from '@/components/dashboard/TopDoctors';
import { Avatar, Card, ConditionBadge, EmptyState, PageHeader, StatCard } from '@/components/ui';
import { GENDERS } from '@/constants';
import { useApi, useUrlFilters } from '@/hooks';
import { cn, formatDate, formatNumber, timeAgo } from '@/lib/utils';

// Recharts is only downloaded when the dashboard opens (keeps other admin pages light).
const chartLoading = () => <div className="h-[260px] animate-pulse rounded-xl bg-ink-100/70 dark:bg-white/5" />;
const load = (name) => dynamic(() => import('@/components/dashboard/Charts').then((m) => m[name]), { ssr: false, loading: chartLoading });
const TrendChart = load('TrendChart');
const SpecializationChart = load('SpecializationChart');
const ConditionChart = load('ConditionChart');
const AgeChart = load('AgeChart');

const RANGES = [['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days'], ['12m', '12 months']];
const RANGE_TEXT = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days', '12m': 'last 12 months' };
const GENDER_COLORS = { female: 'bg-fuchsia-500', male: 'bg-brand-500', other: 'bg-amber-400' };

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

function Growth({ value, light }) {
  if (value === null || value === undefined) return <span className={light ? 'text-white/60' : ''}>No earlier data to compare</span>;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold', light
        ? (up ? 'bg-white text-brand-700' : 'bg-rose-400 text-white')
        : (up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'))}
      >
        <Icon className="h-3.5 w-3.5" />{Math.abs(value)}%
      </span>
      <span className={light ? 'text-white/60' : 'text-ink-400'}>vs previous period</span>
    </span>
  );
}

// The headline card: visits in the selected range, growth and a tiny bar sparkline of the trend.
function VisitsHero({ data, range }) {
  const t = data?.totals;
  const trend = data?.trend || [];
  const max = Math.max(...trend.map((p) => p.patients), 1);
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-6 text-white shadow-brand-glow sm:col-span-2">
      <div className="bg-dots pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      <div className="relative flex h-full flex-col">
        <p className="text-sm font-medium text-white/60">Patient visits · {RANGE_TEXT[range]}</p>
        {t ? <p className="mt-3 font-heading text-5xl font-bold leading-none tracking-tight">{formatNumber(t.newPatients)}</p> : <div className="mt-3 h-12 w-32 animate-pulse rounded-lg bg-white/10" />}
        <div className="mt-3 text-xs">{t && <Growth value={t.patientGrowth} light />}</div>
        <div className="mt-auto flex h-16 items-end gap-[3px] pt-6" aria-hidden="true">
          {trend.map((p) => (
            <span key={p.date} className="flex-1 rounded-t-[3px] bg-white/70 transition-all" style={{ height: `${Math.max(6, (p.patients / max) * 100)}%` }} title={`${formatDate(p.date, { month: 'short', day: 'numeric', timeZone: 'UTC' })}: ${p.patients}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GenderSplit({ data }) {
  const total = data.reduce((s, g) => s + g.count, 0) || 1;
  const rows = [...data].sort((a, b) => b.count - a.count);
  return (
    <div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Gender split">
        {rows.map((g) => <span key={g.gender} className={GENDER_COLORS[g.gender]} style={{ width: `${(g.count / total) * 100}%` }} />)}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {rows.map((g) => (
          <li key={g.gender} className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', GENDER_COLORS[g.gender])} />
            <span className="text-ink-600 dark:text-ink-300">{GENDERS[g.gender]}</span>
            <b className="tabular-nums">{Math.round((g.count / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

const linkClass = 'inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-300';

function Dashboard() {
  const { user } = useAuth();
  const range = useRangeParam();
  const { data, error, isLoading } = useApi('/dashboard', { range: range.value });
  const t = data?.totals;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description={`Here’s what’s happening in your clinic — ${RANGE_TEXT[range.value]}.`}
        actions={(
          <div className="inline-flex rounded-xl border border-ink-200/80 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-ink-900" role="tablist" aria-label="Date range">
            {RANGES.map(([value, label]) => (
              <button key={value} type="button" role="tab" aria-selected={range.value === value} onClick={() => range.set(value)}
                className={cn('rounded-lg px-3 py-1.5 text-sm font-semibold transition', range.value === value ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-500 hover:text-ink-900 dark:hover:text-white')}
              >{label}</button>
            ))}
          </div>
        )}
      />

      {error && <div className="a-card mb-6 p-4 text-sm text-rose-600">Could not load analytics: {error.message}</div>}

      <div className={cn('grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-5', isLoading && data && 'opacity-60')}>
        <VisitsHero data={data} range={range.value} />
        <StatCard label="Total doctors" value={formatNumber(t?.doctors)} icon={Stethoscope} loading={!t}
          hint={t && <span><b className="text-ink-700 dark:text-ink-200">{t.activeDoctors}</b> active · <b className="text-ink-700 dark:text-ink-200">+{t.newDoctors}</b> joined in range</span>} />
        <StatCard label="Total patients" value={formatNumber(t?.patients)} icon={Users} tone="indigo" loading={!t}
          hint={t && <span>Avg <b className="text-ink-700 dark:text-ink-200">{t.avgPatientsPerDoctor}</b> patients per doctor</span>} />
        <StatCard label="Critical patients" value={formatNumber(t?.critical)} icon={AlertTriangle} tone="rose" loading={!t}
          hint={<Link href="/admin/patients?condition=critical" className={linkClass}>View critical patients <ArrowRight className="h-3.5 w-3.5" /></Link>} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Patient visits over time" description={`Grouped by ${data?.unit || 'day'}`}>
          {data ? <TrendChart data={data.trend} unit={data.unit} /> : chartLoading()}
        </Card>
        <Card title="Patient conditions" description="All patients">
          {data ? <ConditionChart data={data.conditions} /> : chartLoading()}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Patients per doctor" description="Top 10 doctors by patient count" actions={<Link href="/admin/doctors" className={linkClass}>All doctors <ArrowRight className="h-3.5 w-3.5" /></Link>}>
          {data ? <TopDoctors data={data.patientsPerDoctor} /> : chartLoading()}
        </Card>
        <Card title="Patients by specialty" description="Hover a bar to see how many doctors work in it">
          {data ? <SpecializationChart data={data.specializations} /> : chartLoading()}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Patient demographics" description="Age groups and gender">
          {data ? (
            <>
              <AgeChart data={data.ageGroups} />
              <div className="mt-4 border-t border-ink-100 pt-4 dark:border-white/5"><GenderSplit data={data.genders} /></div>
            </>
          ) : chartLoading()}
        </Card>
        <Card className="xl:col-span-2" title="Recent patient visits" description="Latest check-ins across all doctors" bodyClassName="px-2 pb-2 pt-1" actions={<Link href="/admin/patients" className={linkClass}>All patients <ArrowRight className="h-3.5 w-3.5" /></Link>}>
          {data?.recentPatients.length === 0 && <EmptyState title="No patients yet" />}
          <ul>
            {data?.recentPatients.map((p) => (
              <li key={p._id} className="flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-ink-50 dark:hover:bg-white/[.03]">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900 dark:text-white">{p.name} <span className="font-normal text-ink-400">· {p.age}y</span></p>
                  <p className="truncate text-xs text-ink-500">{p.diagnosis || 'No diagnosis'}<span className="md:hidden"> · {p.doctor?.name || 'Unknown doctor'}</span></p>
                </div>
                {p.doctor && (
                  <Link href={`/admin/doctors/${p.doctor._id}`} className="hidden min-w-0 items-center gap-2 md:flex md:w-48">
                    <Avatar name={p.doctor.name} src={p.doctor.photo} size={28} />
                    <span className="truncate text-xs font-medium text-ink-600 hover:text-brand-700 dark:text-ink-300">{p.doctor.name}</span>
                  </Link>
                )}
                <div className="flex justify-end sm:w-36"><ConditionBadge condition={p.condition} /></div>
                <span className="hidden w-16 text-right text-xs text-ink-400 sm:block">{timeAgo(p.visitDate)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

// The selected range lives in the URL (?range=90d) so a refresh keeps it.
function useRangeParam() {
  const [filters, setFilters] = useUrlFilters({ range: '30d' });
  return { value: RANGES.some(([v]) => v === filters.range) ? filters.range : '30d', set: (value) => setFilters({ range: value }) };
}

export default function DashboardPage() {
  return (
    <RequirePermission permission="dashboard">
      <Suspense fallback={null}><Dashboard /></Suspense>
    </RequirePermission>
  );
}
