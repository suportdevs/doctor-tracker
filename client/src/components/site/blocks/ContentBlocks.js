import { CheckCircle2, ImageIcon } from 'lucide-react';
import { ICONS } from '@/lib/icons';
import { cn, formatNumber } from '@/lib/utils';
import { Buttons, Section, SectionHeading, SmartLink, isInverse } from '../Section';
import CountUp from '../CountUp';
import GalleryGrid from './GalleryGrid';

const GRID_COLS = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' };

// "Numbered list" style: big numbers with a line between rows — calmer than cards.
function FeatureList({ data, style }) {
  const inverse = isInverse(style);
  return (
    <Section style={style}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} inverse={inverse} align="left" />
        </div>
        <ol className={cn('border-t', inverse ? 'border-white/15' : 'border-ink-200')}>
          {(data.items || []).map((item, i) => {
            const Icon = ICONS[item.icon] || ICONS.Star;
            return (
              <li key={i} style={{ '--i': i }} className={cn('reveal group grid grid-cols-[auto_1fr_auto] items-start gap-5 border-b py-7 transition', inverse ? 'border-white/15' : 'border-ink-200')}>
                <span className="font-heading text-sm font-semibold tabular-nums opacity-40">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-heading text-xl font-semibold transition duration-300 group-hover:translate-x-1 sm:text-2xl">{item.title}</h3>
                  <p className="mt-2 max-w-lg leading-relaxed opacity-60">{item.text}</p>
                </div>
                <span className={cn('grid h-12 w-12 place-items-center rounded-full transition duration-300 group-hover:scale-110', inverse ? 'bg-white/10 text-accent' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white')}><Icon className="h-5 w-5" /></span>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}

export function Features({ data, style }) {
  if (data.variant === 'list') return <FeatureList data={data} style={style} />;
  return (
    <Section style={style}>
      <SectionHeading {...data} inverse={isInverse(style)} />
      <div className={cn('grid gap-4 sm:gap-5', GRID_COLS[data.columns] || GRID_COLS[3])}>
        {(data.items || []).map((item, i) => {
          const Icon = ICONS[item.icon] || ICONS.Star;
          return (
            <div key={i} style={{ '--i': i }} className="reveal group rounded-theme-lg border border-ink-200/70 bg-white p-6 text-ink-900 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl sm:p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition duration-300 group-hover:rotate-[-6deg] group-hover:bg-primary group-hover:text-white"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-6 font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.text}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function ImageText({ data, style }) {
  const inverse = isInverse(style);
  const image = data.image
    ? (
      <div className="relative">
        <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/15 to-accent/25 blur-xl" />
        <img src={data.image} alt="" className="relative aspect-[4/3] w-full rounded-[1.75rem] object-cover shadow-xl" />
      </div>
    )
    : (
      <div className="grid aspect-[4/3] w-full place-items-center rounded-theme-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
        <ImageIcon className="h-12 w-12 opacity-60" />
      </div>
    );
  return (
    <Section style={style}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className={cn('reveal', data.imagePosition === 'left' && 'lg:order-2')}>
          <SectionHeading eyebrow={data.eyebrow} title={data.title} inverse={inverse} align="left" />
          {data.text && <p className="-mt-6 text-lg leading-relaxed opacity-70">{data.text}</p>}
          {data.bullets?.length > 0 && (
            <ul className="mt-8 space-y-3.5">
              {data.bullets.filter(Boolean).map((b) => (
                <li key={b} className="flex items-start gap-3 font-medium"><CheckCircle2 className={cn('mt-0.5 h-5 w-5 shrink-0', inverse ? 'text-accent' : 'text-primary')} />{b}</li>
              ))}
            </ul>
          )}
          {data.buttonLabel && <div className="mt-10"><SmartLink href={data.buttonUrl || '#'} className={inverse ? 'btn-accent' : 'btn-primary'}>{data.buttonLabel}</SmartLink></div>}
        </div>
        <div className={cn('reveal', data.imagePosition === 'left' && 'lg:order-1')} style={{ '--i': 2 }}>{image}</div>
      </div>
    </Section>
  );
}

// HTML is sanitized by the API when the page is saved.
export function RichText({ data, style }) {
  return (
    <Section style={style}>
      <div
        className={cn('prose prose-lg mx-auto max-w-3xl prose-headings:font-heading prose-headings:tracking-tight prose-a:text-primary', isInverse(style) && 'prose-invert')}
        dangerouslySetInnerHTML={{ __html: data.html || '' }}
      />
    </Section>
  );
}

export function Stats({ data, style, live }) {
  const inverse = isInverse(style);
  const items = data.source === 'manual'
    ? data.items || []
    : [
      { value: formatNumber(live?.stats?.doctors || 0), label: 'Specialist doctors' },
      { value: formatNumber(live?.stats?.patients || 0), label: 'Patients cared for' },
      { value: formatNumber(live?.stats?.specialties || 0), label: 'Specialties' },
      { value: formatNumber(live?.stats?.hospitals || 0), label: 'Partner hospitals' },
    ];
  return (
    <Section style={style}>
      {data.title && <h2 className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl">{data.title}</h2>}
      <div className={cn('grid grid-cols-2 gap-y-8 lg:grid-cols-4 lg:divide-x', inverse ? 'lg:divide-white/15' : 'lg:divide-ink-200')}>
        {items.map((item, i) => (
          <div key={i} style={{ '--i': i }} className="reveal px-4 text-center">
            <p className={cn('font-heading text-4xl font-bold tracking-tight sm:text-[3.25rem]', !inverse && 'text-ink-950')}><CountUp value={item.value} /></p>
            <p className="mt-2 text-sm font-medium opacity-60">{item.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Steps({ data, style }) {
  const inverse = isInverse(style);
  return (
    <Section style={style}>
      <SectionHeading {...data} inverse={inverse} />
      <ol className="grid gap-5 md:grid-cols-3">
        {(data.items || []).map((step, i) => (
          <li key={i} style={{ '--i': i }} className="reveal group relative overflow-hidden rounded-theme-lg border border-ink-200/70 bg-white p-7 text-ink-900 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <span className="pointer-events-none absolute -right-2 -top-6 font-heading text-[7rem] font-bold leading-none text-primary/[.07] transition duration-500 group-hover:scale-110 group-hover:text-primary/[.14]">{i + 1}</span>
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-ink-950 font-heading text-sm font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="relative mt-6 font-heading text-lg font-semibold">{step.title}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Gallery({ data, style }) {
  const images = (data.images || []).filter((img) => img.src);
  return (
    <Section style={style}>
      {data.title && <SectionHeading title={data.title} inverse={isInverse(style)} />}
      {images.length === 0
        ? <p className="text-center text-sm opacity-60">No images yet.</p>
        : <GalleryGrid images={images} gridClass={GRID_COLS[data.columns] || GRID_COLS[3]} />}
    </Section>
  );
}

// Endless sideways strip of words. The list is drawn twice so the loop has no gap; hover pauses it.
export function Marquee({ data, style }) {
  const items = (data.items || []).filter(Boolean);
  if (!items.length) return null;
  return (
    <Section style={{ spacing: 'compact', ...style }}>
      {data.title && <p className="reveal mb-6 text-center text-xs font-semibold uppercase tracking-[.2em] opacity-50">{data.title}</p>}
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-12 whitespace-nowrap pr-12 font-heading text-2xl font-semibold tracking-tight opacity-80 sm:text-3xl" aria-hidden={i >= items.length}>
              {item}<span className="h-2 w-2 rounded-full bg-primary" />
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Cta({ data, style }) {
  const filled = isInverse(style);
  return (
    <Section style={style}>
      <div className={cn('relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-12 sm:py-20', filled ? '' : 'bg-site-dark text-white')}>
        {!filled && <div className="bg-dots pointer-events-none absolute inset-0" />}
        <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="reveal relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-5xl">{data.title}</h2>
          {data.text && <p className="mx-auto mt-5 max-w-xl text-lg opacity-75">{data.text}</p>}
          <Buttons data={data} inverse center />
        </div>
      </div>
    </Section>
  );
}
