'use client';

import { memo } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CONDITIONS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { accentHex } from '@/lib/adminTheme';
import { formatDate, formatNumber } from '@/lib/utils';

// Recessive axes and grid so the data stands out; one hue per single-series chart: the user's accent colour.
const useSeries = () => accentHex(useAuth().preferences.accent, 600);
const AXIS = { fontSize: 12, fill: '#94a3b8' };
const GRID = 'rgba(148,163,184,0.18)';
const CURSOR = { fill: 'rgba(148,163,184,0.08)' };

function ChartTooltip({ active, payload, label, labelFormatter, extra }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-ink-850">
      <p className="mb-1 font-semibold text-ink-900 dark:text-white">{labelFormatter ? labelFormatter(label, row) : label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-ink-600 dark:text-ink-300">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload.fill }} />
          {p.name}: <b className="text-ink-900 dark:text-white">{formatNumber(p.value)}</b>
        </p>
      ))}
      {extra && <p className="mt-1 text-ink-500">{extra(row)}</p>}
    </div>
  );
}

const TREND_FORMAT = {
  day: { month: 'short', day: 'numeric' },
  week: { month: 'short', day: 'numeric' },
  month: { month: 'short', year: '2-digit' },
};

export const TrendChart = memo(function TrendChart({ data, unit }) {
  const SERIES = useSeries();
  const fmt = (v) => formatDate(v, { ...TREND_FORMAT[unit], timeZone: 'UTC' });
  return (
    <ResponsiveContainer width="100%" height={290}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES} stopOpacity={0.22} />
            <stop offset="100%" stopColor={SERIES} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="date" tickFormatter={fmt} tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }}
          content={<ChartTooltip labelFormatter={(v) => (unit === 'week' ? `Week of ${fmt(v)}` : fmt(v))} />}
        />
        <Area isAnimationActive={false} type="monotone" dataKey="patients" name="Patient visits" stroke={SERIES} strokeWidth={2} fill="url(#trendFill)" activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
});

// Horizontal bars: twelve specialty names stay readable and the ranking reads top-down.
export const SpecializationChart = memo(function SpecializationChart({ data }) {
  const SERIES = useSeries();
  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={7}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="specialization" width={124} tick={{ ...AXIS, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <Tooltip cursor={CURSOR} content={<ChartTooltip extra={(row) => `${row.doctors} doctor${row.doctors === 1 ? '' : 's'}`} />} />
        <Bar isAnimationActive={false} dataKey="patients" name="Patients" fill={SERIES} radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
});

// Conditions are a status: fixed colour per condition + a labelled legend (never colour alone).
export const ConditionChart = memo(function ConditionChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const rows = data.map((d) => ({ ...d, name: CONDITIONS[d.condition]?.label || d.condition, fill: CONDITIONS[d.condition]?.chart || '#94a3b8' }));
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="count" nameKey="name" innerRadius="68%" outerRadius="100%" paddingAngle={2} cornerRadius={4} stroke="none" isAnimationActive={false}>
              {rows.map((r) => <Cell key={r.condition} fill={r.fill} />)}
            </Pie>
            <Tooltip content={<ChartTooltip labelFormatter={(_, row) => row.name} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-heading text-[1.7rem] font-bold leading-none text-ink-950 dark:text-white">{formatNumber(total)}</p>
            <p className="mt-1 text-xs text-ink-400">patients</p>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {rows.map((r) => (
          <li key={r.condition} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.fill }} />
            <span className="flex-1 text-ink-600 dark:text-ink-300">{r.name}</span>
            <span className="font-semibold tabular-nums text-ink-900 dark:text-white">{formatNumber(r.count)}</span>
            <span className="w-10 text-right text-xs tabular-nums text-ink-400">{total ? Math.round((r.count / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

export const AgeChart = memo(function AgeChart({ data }) {
  const SERIES = useSeries();
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="group" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip cursor={CURSOR} content={<ChartTooltip labelFormatter={(v) => `Age ${v}`} />} />
        <Bar isAnimationActive={false} dataKey="count" name="Patients" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
});
