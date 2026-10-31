'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, BarChart3, ChevronDown, ChevronUp, Columns2, Copy, ExternalLink, Eye, EyeOff, HeartPulse, HelpCircle, Images, LayoutGrid,
  ListOrdered, Megaphone, MoveHorizontal, PanelTop, Plus, Quote, Save, Send, Settings2, Sparkles, Square, Stethoscope, Trash2, Type, X,
} from 'lucide-react';
import BlockRenderer from '@/components/site/BlockRenderer';
import { api } from '@/services/api';
import { BLOCKS, BLOCK_CATEGORIES, DEFAULT_STYLE, STYLE_FIELDS } from '@/config/blocks';
import { useApi, useSaveShortcut, useUnsavedWarning } from '@/hooks';
import { themeStyle } from '@/lib/theme';
import { cn, slugify, uid } from '@/lib/utils';
import { SchemaFields } from './FieldRenderer';
import { Field, Modal, Spinner } from '@/components/ui';

// Icon names used in config/blocks.js → components (explicit imports keep the bundle small).
const BLOCK_ICONS = { Sparkles, PanelTop, LayoutGrid, Columns2, Type, BarChart3, ListOrdered, Stethoscope, HeartPulse, Quote, HelpCircle, Images, MoveHorizontal, Megaphone, Send };
const blockIcon = (type) => BLOCK_ICONS[BLOCKS[type]?.icon] || Square;

// Tailwind breakpoints follow the browser window, not the preview pane, so the preview is drawn
// at a fixed desktop width and zoomed down to fit the pane.
const PREVIEW_WIDTH = 1280;
function usePreviewScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / PREVIEW_WIDTH)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, scale];
}

function BlockPicker({ open, onClose, onPick }) {
  return (
    <Modal open={open} onClose={onClose} title="Add a section" description="Pick a block — you can edit its content right after." size="lg">
      <div className="space-y-6">
        {BLOCK_CATEGORIES.map((category) => (
          <div key={category}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">{category}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(BLOCKS).filter(([, b]) => b.category === category).map(([type, b]) => {
                const Icon = blockIcon(type);
                return (
                  <button key={type} type="button" onClick={() => onPick(type)} className="flex items-start gap-3 rounded-xl border border-ink-200 p-3 text-left transition hover:border-brand-400 hover:bg-brand-50/50 dark:border-white/10 dark:hover:bg-brand-500/5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><Icon className="h-4 w-4" /></span>
                    <span>
                      <span className="block text-sm font-bold text-ink-900 dark:text-white">{b.label}</span>
                      <span className="block text-xs text-ink-500">{b.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function BlockEditor({ block, onChange, onClose }) {
  const def = BLOCKS[block.type];
  const [tab, setTab] = useState('content');
  if (!def) return <p className="p-4 text-sm text-rose-600">Unknown block type “{block.type}”.</p>;
  const style = { ...DEFAULT_STYLE, ...block.style };
  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-ink-100 bg-white px-4 py-3 dark:border-white/5 dark:bg-ink-900">
        <button type="button" onClick={onClose} className="a-btn-ghost a-btn-icon -ml-2" aria-label="Back to sections"><ArrowLeft className="h-4 w-4" /></button>
        <p className="flex-1 font-bold">{def.label}</p>
        <div className="flex rounded-lg bg-ink-100 p-0.5 text-xs font-semibold dark:bg-white/5">
          {[['content', 'Content'], ['style', 'Style']].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={cn('rounded-md px-2.5 py-1', tab === key ? 'bg-white shadow dark:bg-ink-800' : 'text-ink-500')}>{label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        {tab === 'content'
          ? <SchemaFields fields={def.fields} values={block.data} onChange={(k, v) => onChange({ ...block, data: { ...block.data, [k]: v } })} />
          : <SchemaFields fields={STYLE_FIELDS} values={style} onChange={(k, v) => onChange({ ...block, style: { ...style, [k]: v } })} />}
      </div>
    </div>
  );
}

export default function PageBuilder({ initial }) {
  const router = useRouter();
  const isNew = !initial._id;
  const [page, setPage] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [panel, setPanel] = useState('blocks'); // blocks | settings
  const [picker, setPicker] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const { data: live } = useApi('/public/live');
  const { data: settings } = useApi('/settings');

  useUnsavedWarning(dirty);

  const update = (changes) => {
    setPage((p) => ({ ...p, ...changes }));
    setDirty(true);
  };
  const setBlocks = (fn) => update({ blocks: fn(page.blocks) });

  const addBlock = (type) => {
    const block = { id: uid(), type, data: structuredClone(BLOCKS[type].defaults), style: { ...DEFAULT_STYLE } };
    const index = selectedId ? page.blocks.findIndex((b) => b.id === selectedId) + 1 : page.blocks.length;
    setBlocks((blocks) => [...blocks.slice(0, index), block, ...blocks.slice(index)]);
    setSelectedId(block.id);
    setPicker(false);
    setPanel('blocks');
  };
  const move = (index, step) => setBlocks((blocks) => {
    const j = index + step;
    if (j < 0 || j >= blocks.length) return blocks;
    const next = [...blocks];
    [next[index], next[j]] = [next[j], next[index]];
    return next;
  });
  const duplicate = (index) => setBlocks((blocks) => [...blocks.slice(0, index + 1), { ...structuredClone(blocks[index]), id: uid() }, ...blocks.slice(index + 1)]);
  const remove = (id) => {
    setBlocks((blocks) => blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };
  const toggleHidden = (id) => setBlocks((blocks) => blocks.map((b) => (b.id === id ? { ...b, style: { ...b.style, hidden: !b.style?.hidden } } : b)));

  const save = async (status = page.status) => {
    if (!page.title.trim()) return toast.error('Give the page a title first');
    setSaving(true);
    const body = { title: page.title, slug: page.slug, blocks: page.blocks, status, seoTitle: page.seoTitle, seoDescription: page.seoDescription };
    try {
      const saved = isNew ? await api.post('/pages', body) : await api.put(`/pages/${page._id}`, body);
      setPage(saved);
      setDirty(false);
      toast.success(status === 'published' ? 'Page published' : 'Saved as draft');
      if (isNew) router.replace(`/admin/website/pages/${saved._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
    return null;
  };
  useSaveShortcut(() => save());

  const selected = page.blocks.find((b) => b.id === selectedId);
  const homeSlug = settings?.general.homePage || 'home';
  const publicUrl = page.slug === homeSlug ? '/' : `/${page.slug}`;
  const previewStyle = useMemo(() => themeStyle(settings?.appearance), [settings]);
  const [previewRef, previewScale] = usePreviewScale();

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col sm:-m-6 lg:-m-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-ink-200/70 bg-white px-4 py-3 dark:border-white/5 dark:bg-ink-900">
        <Link href="/admin/website/pages" className="a-btn-ghost a-btn-icon" aria-label="Back to pages"><ArrowLeft className="h-4 w-4" /></Link>
        <div className="min-w-0 flex-1">
          <input value={page.title} onChange={(e) => update({ title: e.target.value, ...(!slugTouched && { slug: slugify(e.target.value) }) })} placeholder="Page title"
            className="w-full bg-transparent font-heading text-lg font-bold outline-none placeholder:text-ink-300" aria-label="Page title" />
          <p className="flex items-center gap-1 text-xs text-ink-400">
            <span className={cn('h-1.5 w-1.5 rounded-full', page.status === 'published' ? 'bg-emerald-500' : 'bg-ink-300')} />
            {page.status === 'published' ? 'Published' : 'Draft'} · {publicUrl}{dirty && <span className="ml-1 font-semibold text-amber-600">· Unsaved changes</span>}
          </p>
        </div>
        {!isNew && page.status === 'published' && (
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="a-btn-ghost hidden sm:inline-flex"><ExternalLink className="h-4 w-4" />View</a>
        )}
        <button type="button" className="a-btn-secondary" onClick={() => save('draft')} disabled={saving}>{page.status === 'published' ? 'Unpublish' : 'Save draft'}</button>
        <button type="button" className="a-btn-primary" onClick={() => save('published')} disabled={saving}>{saving ? <Spinner /> : <Save className="h-4 w-4" />}{page.status === 'published' ? 'Update' : 'Publish'}</button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left panel */}
        <aside className="a-scroll max-h-[45vh] shrink-0 overflow-y-auto border-b border-ink-200/70 bg-white dark:border-white/5 dark:bg-ink-900 lg:max-h-none lg:w-[400px] lg:border-b-0 lg:border-r">
          {selected ? (
            <BlockEditor block={selected} onClose={() => setSelectedId(null)} onChange={(b) => setBlocks((blocks) => blocks.map((x) => (x.id === b.id ? b : x)))} />
          ) : (
            <>
              <div className="flex border-b border-ink-100 text-sm font-semibold dark:border-white/5">
                {[['blocks', 'Sections'], ['settings', 'Page settings']].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setPanel(key)} className={cn('flex-1 border-b-2 py-3', panel === key ? 'border-brand-600 text-brand-700 dark:text-brand-300' : 'border-transparent text-ink-500')}>{label}</button>
                ))}
              </div>

              {panel === 'blocks' ? (
                <div className="space-y-2 p-4">
                  {page.blocks.length === 0 && <p className="rounded-xl bg-ink-50 p-4 text-center text-sm text-ink-500 dark:bg-white/5">This page is empty. Add your first section.</p>}
                  {page.blocks.map((block, i) => {
                    const Icon = blockIcon(block.type);
                    return (
                      <div key={block.id} className={cn('group flex items-center gap-2 rounded-xl border border-ink-200 p-2 transition hover:border-brand-300 dark:border-white/10', block.style?.hidden && 'opacity-50')}>
                        <button type="button" onClick={() => setSelectedId(block.id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600 dark:bg-white/5 dark:text-ink-300"><Icon className="h-4 w-4" /></span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{BLOCKS[block.type]?.label || block.type}</span>
                            <span className="block truncate text-xs text-ink-400">{block.data.title || block.data.eyebrow || BLOCKS[block.type]?.description}</span>
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center">
                          <button type="button" onClick={() => move(i, -1)} className="rounded p-1 text-ink-400 hover:text-ink-700" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => move(i, 1)} className="rounded p-1 text-ink-400 hover:text-ink-700" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => toggleHidden(block.id)} className="rounded p-1 text-ink-400 hover:text-ink-700" aria-label={block.style?.hidden ? 'Show' : 'Hide'}>{block.style?.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                          <button type="button" onClick={() => duplicate(i)} className="rounded p-1 text-ink-400 hover:text-ink-700" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
                          <button type="button" onClick={() => remove(block.id)} className="rounded p-1 text-ink-400 hover:text-rose-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setPicker(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 py-3 text-sm font-semibold text-ink-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-white/10">
                    <Plus className="h-4 w-4" />Add section
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  <Field label="Page address" hint={`The page opens at ${publicUrl}. Lowercase letters, numbers and dashes.`}>
                    <div className="flex items-center">
                      <span className="flex h-10 items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm text-ink-400 dark:border-white/10 dark:bg-white/5">/</span>
                      <input className="a-input rounded-l-none" value={page.slug} onChange={(e) => { setSlugTouched(true); update({ slug: slugify(e.target.value) }); }} />
                    </div>
                  </Field>
                  <Field label="SEO title" hint="Shown in Google and the browser tab. Leave empty to use the page title.">
                    <input className="a-input" value={page.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} maxLength={160} />
                  </Field>
                  <Field label="SEO description" hint={`${page.seoDescription.length}/300 — a one-sentence summary for search results.`}>
                    <textarea className="a-textarea" value={page.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} maxLength={300} />
                  </Field>
                  <p className="flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-xs text-ink-500 dark:bg-white/5">
                    <Settings2 className="h-4 w-4 shrink-0" />The home page is chosen in Website → Site settings.
                  </p>
                </div>
              )}
            </>
          )}
        </aside>

        {/* Live preview — the same components the public website uses, drawn at desktop width and scaled to fit. */}
        <div ref={previewRef} className="a-scroll min-h-0 flex-1 overflow-y-auto bg-ink-100 p-3 dark:bg-ink-950 sm:p-6">
          <div style={{ ...previewStyle, width: PREVIEW_WIDTH, zoom: previewScale }} className="mx-auto overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-ink-200/60">
            {page.blocks.length === 0 && (
              <button type="button" onClick={() => setPicker(true)} className="grid h-80 w-full place-items-center text-ink-400 hover:text-brand-600">
                <span className="text-center"><Plus className="mx-auto h-8 w-8" /><span className="mt-2 block text-sm font-semibold">Add your first section</span></span>
              </button>
            )}
            {page.blocks.map((block) => (
              <div key={block.id} className={cn('group relative', block.style?.hidden && 'opacity-40')}>
                {/* Click layer: selects the block instead of following links or submitting forms. */}
                <button type="button" onClick={() => setSelectedId(block.id)} aria-label={`Edit ${BLOCKS[block.type]?.label}`}
                  className={cn('absolute inset-0 z-10 outline-none ring-inset transition', selectedId === block.id ? 'ring-4 ring-brand-500' : 'hover:ring-2 hover:ring-brand-400/70')} />
                <span className={cn('pointer-events-none absolute left-3 top-3 z-20 rounded-md bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100', selectedId === block.id && 'opacity-100')}>
                  {BLOCKS[block.type]?.label}{block.style?.hidden && ' (hidden)'}
                </span>
                <BlockRenderer blocks={[block]} live={live} settings={settings} showHidden />
              </div>
            ))}
          </div>
        </div>
      </div>

      <BlockPicker open={picker} onClose={() => setPicker(false)} onPick={addBlock} />
      {selected && (
        <button type="button" onClick={() => setSelectedId(null)} className="fixed bottom-4 right-4 z-30 rounded-full bg-ink-900 p-3 text-white shadow-lg lg:hidden" aria-label="Close block editor"><X className="h-5 w-5" /></button>
      )}
    </div>
  );
}
