import { Activity, CalendarCheck, CheckCircle2, HeartPulse, Star } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Buttons, Section, isInverse } from '../Section';

// Shown in the hero when no image is chosen: a small "app preview" made from plain HTML.
function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[4/3.4] w-full max-w-md" aria-hidden="true">
      <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-accent/20 to-transparent blur-2xl" />
      <div className="absolute inset-x-4 top-6 rounded-theme-lg border border-ink-200/70 bg-white p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary"><HeartPulse className="h-5 w-5" /></span>
          <div>
            <p className="text-xs font-medium text-ink-400">Heart rate</p>
            <p className="font-heading text-lg font-bold text-ink-900">72 bpm <span className="text-xs font-semibold text-emerald-600">Normal</span></p>
          </div>
        </div>
        <svg viewBox="0 0 300 60" className="mt-4 h-14 w-full text-primary">
          <polyline fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points="0,35 40,35 55,35 65,12 78,52 90,30 120,35 160,35 172,18 184,48 196,32 230,35 300,35" />
        </svg>
      </div>
      <div className="absolute bottom-6 left-0 w-60 animate-fade-up rounded-theme-lg border border-ink-200/70 bg-white p-4 shadow-xl [animation-delay:.2s]">
        <p className="flex items-center gap-2 text-xs font-semibold text-primary"><CalendarCheck className="h-4 w-4" />Next appointment</p>
        <p className="mt-2 font-heading font-bold text-ink-900">Your specialist</p>
        <p className="text-xs text-ink-500">Tomorrow, 10:30</p>
      </div>
      <div className="absolute right-6 top-0 grid h-12 w-12 place-items-center rounded-2xl bg-accent text-ink-950 shadow-lg"><Activity className="h-6 w-6" /></div>
    </div>
  );
}

// Hero photo with floating "live" cards: real doctor faces and numbers from the clinic database.
function HeroPhoto({ image, live }) {
  const team = (live?.doctors || []).filter((d) => d.photo).slice(0, 4);
  return (
    <div className="reveal relative mx-auto w-full max-w-md lg:max-w-none" style={{ '--i': 3 }}>
      <div className="absolute -inset-4 -z-0 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/25 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
        <img src={image} alt="" className="aspect-[4/4.6] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
      </div>

      {team.length > 0 && (
        <div className="absolute -left-4 bottom-10 animate-float rounded-2xl border border-white/60 bg-white/90 p-4 text-ink-900 shadow-xl backdrop-blur-md sm:-left-10">
          <div className="flex -space-x-2.5">
            {team.map((d) => <img key={d._id} src={d.photo} alt={d.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />)}
          </div>
          <p className="mt-2.5 font-heading text-sm font-bold">{formatNumber(live.stats?.doctors || 0)}+ specialists</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-500"><span className="h-2 w-2 animate-blink rounded-full bg-emerald-500" />Accepting new patients</p>
        </div>
      )}
      <div className="absolute -right-3 top-8 animate-float rounded-2xl bg-ink-950 px-4 py-3 text-white shadow-xl [animation-delay:1.5s] sm:-right-6">
        <p className="flex items-center gap-0.5 text-accent">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</p>
        <p className="mt-1 text-xs font-semibold">4.9 · patient rating</p>
      </div>
    </div>
  );
}

// Full-screen photo with the text on top and glass cards with live clinic numbers.
function FullscreenHero({ data, style, live, text }) {
  const stats = [
    [formatNumber(live?.stats?.doctors || 0), 'Specialist doctors'],
    [formatNumber(live?.stats?.patients || 0), 'Patients cared for'],
    [formatNumber(live?.stats?.specialties || 0), 'Departments'],
  ];
  return (
    <Section style={{ spacing: 'large', ...style, background: 'dark' }} className="relative flex min-h-[86vh] items-center overflow-hidden">
      {data.image && <img src={data.image} alt="" className="absolute inset-0 h-full w-full animate-[hero-zoom_14s_ease-out_both] object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/60 to-ink-950/20" />
      <div className="relative grid items-end gap-12 lg:grid-cols-[1.4fr_1fr]">
        {text}
        <div className="reveal grid gap-3 sm:grid-cols-3 lg:grid-cols-1" style={{ '--i': 3 }}>
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur-md">
              <p className="font-heading text-3xl font-bold">{value}</p>
              <p className="text-sm text-white/65">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// Bento grid: headline tile + photo + live numbers + real doctor faces.
function BentoHero({ data, style, live }) {
  const team = (live?.doctors || []).filter((d) => d.photo).slice(0, 5);
  const tile = 'reveal relative overflow-hidden rounded-[1.75rem]';
  return (
    <Section style={{ spacing: 'normal', ...style }} className="relative overflow-hidden">
      <div className="grid gap-4 lg:grid-cols-4 lg:grid-rows-[auto_auto]">
        <div className={cn(tile, 'bg-ink-50 p-8 text-ink-950 sm:p-10 lg:col-span-2 lg:row-span-2')}>
          {data.eyebrow && <span className="eyebrow">{data.eyebrow}</span>}
          <h1 className="mt-5 text-balance text-[2.5rem] font-bold leading-[1.02] tracking-tight sm:text-6xl">{data.title}</h1>
          {data.subtitle && <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-500">{data.subtitle}</p>}
          <Buttons data={data} />
        </div>
        <div className={cn(tile, 'min-h-[260px] lg:col-span-2')} style={{ '--i': 1 }}>
          {data.image && <img src={data.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105" />}
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-900 backdrop-blur"><span className="h-2 w-2 animate-blink rounded-full bg-emerald-500" />Open today · {data.badges?.[0] || 'Same-day visits'}</span>
        </div>
        <div className={cn(tile, 'bg-primary p-6 text-white')} style={{ '--i': 2 }}>
          <HeartPulse className="h-7 w-7 opacity-80" />
          <p className="mt-6 font-heading text-4xl font-bold">{formatNumber(live?.stats?.patients || 0)}</p>
          <p className="text-sm text-white/75">patients cared for</p>
        </div>
        <div className={cn(tile, 'bg-accent p-6 text-ink-950')} style={{ '--i': 3 }}>
          <div className="flex -space-x-3">
            {team.map((d) => <img key={d._id} src={d.photo} alt={d.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-accent" />)}
          </div>
          <p className="mt-5 font-heading text-4xl font-bold">{formatNumber(live?.stats?.doctors || 0)}</p>
          <p className="text-sm text-ink-950/70">specialists across {live?.stats?.specialties || 0} departments</p>
        </div>
      </div>
    </Section>
  );
}

export function Hero({ data, style, live }) {
  const variant = data.variant || 'split';
  if (variant === 'bento') return <BentoHero data={data} style={style} live={live} />;
  const fullscreen = variant === 'fullscreen';
  const inverse = fullscreen || isInverse(style);
  const centered = variant === 'centered';
  const text = (
    <div className={cn('animate-fade-up', centered && 'mx-auto max-w-3xl text-center')}>
      {data.eyebrow && <span className={cn('eyebrow', inverse && 'text-accent')}>{data.eyebrow}</span>}
      <h1 className={cn('mt-5 text-balance text-[2.6rem] font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.25rem]', fullscreen && 'lg:text-7xl')}>{data.title}</h1>
      {data.subtitle && <p className={cn('mt-6 max-w-xl text-lg leading-relaxed opacity-70', centered && 'mx-auto')}>{data.subtitle}</p>}
      <Buttons data={data} inverse={inverse} center={centered} />
      {data.badges?.length > 0 && (
        <ul className={cn('mt-10 flex flex-wrap gap-2 text-sm font-medium', centered && 'justify-center')}>
          {data.badges.filter(Boolean).map((b) => (
            <li key={b} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5', inverse ? 'bg-white/10 backdrop-blur' : 'bg-white text-ink-700 shadow-sm ring-1 ring-ink-200/70')}>
              <CheckCircle2 className={cn('h-4 w-4', inverse ? 'text-accent' : 'text-primary')} />{b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (fullscreen) return <FullscreenHero data={data} style={style} live={live} text={text} />;

  return (
    <Section style={{ spacing: 'large', ...style }} className={cn('relative overflow-hidden', !inverse && !style.background && 'bg-gradient-to-b from-ink-50 to-white')}>
      {!inverse && <div className="bg-dots-dark pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />}
      {centered ? (
        <div className="relative">
          {text}
          {data.image && (
            <div className="reveal relative mx-auto mt-16 max-w-5xl" style={{ '--i': 3 }}>
              <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-b from-primary/20 via-accent/20 to-transparent blur-2xl" />
              <img src={data.image} alt="" className="relative aspect-[16/8] w-full rounded-[2rem] object-cover shadow-2xl" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {text}
          {data.image ? <HeroPhoto image={data.image} live={live} /> : <HeroIllustration />}
        </div>
      )}
    </Section>
  );
}

export function PageHeader({ data, style }) {
  const inverse = isInverse(style);
  return (
    <Section style={{ background: 'muted', spacing: 'normal', ...style }} className="relative overflow-hidden">
      <div className="bg-dots-dark pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-3xl animate-fade-up text-center">
        {data.eyebrow && <span className={cn('eyebrow', inverse && 'text-accent')}>{data.eyebrow}</span>}
        <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-[3.4rem] sm:leading-[1.05]">{data.title}</h1>
        {data.subtitle && <p className="mt-5 text-lg opacity-70">{data.subtitle}</p>}
      </div>
    </Section>
  );
}
