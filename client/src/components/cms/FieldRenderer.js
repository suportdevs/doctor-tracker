'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Plus, Trash2, X } from 'lucide-react';
import { ICONS } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { ImageField } from './MediaLibrary';
import { Field, Toggle } from '@/components/ui';

// Renders form inputs from a block's field schema (see config/blocks.js).

function StringList({ value = [], onChange }) {
  return (
    <div className="space-y-1.5">
      {value.map((v, i) => (
        <div key={i} className="flex gap-1.5">
          <input className="a-input h-9" value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="a-btn-ghost a-btn-icon shrink-0 hover:text-rose-600" aria-label="Remove"><X className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ''])} className="flex items-center gap-1 text-xs font-semibold text-brand-600"><Plus className="h-3.5 w-3.5" />Add item</button>
    </div>
  );
}

function IconPicker({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const Current = ICONS[value] || ICONS.Star;
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="a-input flex items-center gap-2">
        <Current className="h-4 w-4 text-brand-600" /><span className="flex-1 text-left">{value}</span><ChevronDown className="h-4 w-4 text-ink-400" />
      </button>
      {open && (
        <div className="mt-1.5 grid grid-cols-7 gap-1 rounded-xl border border-ink-200 p-1.5 dark:border-white/10">
          {options.map((name) => {
            const Icon = ICONS[name];
            return (
              <button type="button" key={name} title={name} onClick={() => { onChange(name); setOpen(false); }}
                className={cn('grid aspect-square place-items-center rounded-lg transition hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10', value === name && 'bg-brand-600 text-white hover:bg-brand-600 hover:text-white')}
              ><Icon className="h-4 w-4" /></button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// A list of sub-items (feature cards, FAQ entries…) that can be added, re-ordered, copied and removed.
function Repeater({ field, value = [], onChange }) {
  const [open, setOpen] = useState(0);
  const move = (i, step) => {
    const j = i + step;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-ink-200 dark:border-white/10">
          <div className="flex items-center gap-1 bg-ink-50 px-2 py-1.5 dark:bg-white/[.03]">
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex-1 truncate px-1 text-left text-sm font-semibold">
              {item[field.itemLabel] || `Item ${i + 1}`}
            </button>
            <button type="button" onClick={() => move(i, -1)} className="rounded p-1 text-ink-400 hover:text-ink-700" aria-label="Move up"><ChevronUp className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => move(i, 1)} className="rounded p-1 text-ink-400 hover:text-ink-700" aria-label="Move down"><ChevronDown className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => onChange([...value.slice(0, i + 1), structuredClone(item), ...value.slice(i + 1)])} className="rounded p-1 text-ink-400 hover:text-ink-700" aria-label="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-ink-400 hover:text-rose-600" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {open === i && (
            <div className="grid grid-cols-2 gap-3 p-3">
              <SchemaFields fields={field.fields} values={item} onChange={(k, v) => onChange(value.map((x, j) => (j === i ? { ...x, [k]: v } : x)))} />
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => { onChange([...value, structuredClone(field.defaults || {})]); setOpen(value.length); }}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-200 py-2 text-sm font-semibold text-ink-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-white/10"
      ><Plus className="h-4 w-4" />Add {field.label.toLowerCase().replace(/s$/, '')}</button>
    </div>
  );
}

function Input({ field, value, onChange }) {
  switch (field.type) {
    case 'textarea':
      return <textarea className="a-textarea" rows={field.rows || 3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'richtext':
      return <textarea className="a-textarea font-mono text-xs" rows={12} value={value ?? ''} onChange={(e) => onChange(e.target.value)} spellCheck={false} />;
    case 'image':
      return <ImageField value={value} onChange={onChange} />;
    case 'select':
      return (
        // Option values may be numbers (e.g. columns: 3) — map back to the original type.
        <select className="a-input" value={value ?? ''} onChange={(e) => { const opt = field.options.find(([v]) => String(v) === e.target.value); onChange(opt ? opt[0] : e.target.value); }}>
          {field.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
    case 'number':
      return <input type="number" className="a-input" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
    case 'toggle':
      return <Toggle checked={!!value} onChange={onChange} label={field.label} />;
    case 'stringList':
      return <StringList value={value} onChange={onChange} />;
    case 'list':
      return <Repeater field={field} value={value} onChange={onChange} />;
    case 'icon':
      return <IconPicker value={value} onChange={onChange} options={field.options} />;
    default:
      return <input className="a-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={field.type === 'url' ? '/page, https://… or tel:…' : ''} />;
  }
}

export function SchemaFields({ fields, values, onChange }) {
  return fields.filter((f) => !f.showIf || f.showIf(values)).map((f) => (
    <Field key={f.name} label={f.type === 'toggle' ? null : f.label} hint={f.hint} className={f.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
      <Input field={f} value={values[f.name]} onChange={(v) => onChange(f.name, v)} />
    </Field>
  ));
}
