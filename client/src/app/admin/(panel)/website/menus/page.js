'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, CornerDownRight, GripVertical, ListTree, Plus, Save, Trash2 } from 'lucide-react';
import RequirePermission from '@/components/auth/RequirePermission';
import { Badge, Card, EmptyState, Field, Modal, PageHeader, PageLoader, Spinner } from '@/components/ui';
import { api } from '@/services/api';
import { useApi, useUnsavedWarning } from '@/hooks';
import { cn } from '@/lib/utils';

const newItem = () => ({ label: 'New link', url: '/', newTab: false, children: [] });
const USED_IN = { header: 'Header', footer: 'Footer' };

/* ---------- Pure helpers: an item is addressed by a path — [i] top level, [i, c] child c of item i ---------- */

function moveIn(list, index, step) {
  const j = index + step;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[index], next[j]] = [next[j], next[index]];
  return next;
}

/**
 * Moves the item at `from` so it lands at `to` = { parent: null | topIndex, index }.
 * parent null = top level; a number = inside that item's dropdown. Returns the same list if the move isn't allowed.
 */
function moveItem(items, from, to) {
  const copy = items.map((it) => ({ ...it, children: [...(it.children || [])] }));
  const fromParent = from.length === 2 ? from[0] : null;
  const fromIndex = from[from.length - 1];
  let { parent, index } = to;

  if (fromParent === null && parent === fromIndex) return items; // an item can't go inside itself
  const fromList = fromParent === null ? copy : copy[fromParent].children;
  const [item] = fromList.splice(fromIndex, 1);
  if (parent !== null && item.children?.length) return items; // only one dropdown level

  // Removing a row shifts the rows after it up by one.
  if (fromParent === null && parent !== null && fromIndex < parent) parent -= 1;
  if (fromParent === parent && fromIndex < index) index -= 1;

  const target = parent === null ? copy : copy[parent].children;
  target.splice(index, 0, parent === null ? { ...item, children: item.children || [] } : { label: item.label, url: item.url, newTab: item.newTab });
  return copy;
}

/* ---------- UI ---------- */

// One link row. Rows are draggable by the grip; dropping on a row puts the dragged link before it.
function ItemRow({ item, pages, nested, dropHere, dragging, onDragStart, onDragEnd, onDragOver, onDrop, onChange, onRemove, onMove, onAddChild }) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'relative flex flex-wrap items-center gap-2 rounded-xl border bg-white p-2.5 transition dark:bg-ink-900',
        nested && 'ml-8',
        dragging ? 'border-dashed border-brand-300 opacity-40' : 'border-ink-200 dark:border-white/10',
      )}
    >
      {dropHere && <span className="absolute -top-[5px] left-2 right-2 h-[3px] rounded-full bg-brand-500" />}
      <span draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className="cursor-grab rounded p-1 text-ink-300 hover:bg-ink-100 hover:text-ink-600 active:cursor-grabbing dark:hover:bg-white/5" title="Drag to reorder" aria-hidden="true">
        <GripVertical className="h-4 w-4" />
      </span>
      {nested && <CornerDownRight className="h-4 w-4 text-ink-300" />}
      <input className="a-input h-9 w-full sm:w-40" value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} placeholder="Label" aria-label="Label" />
      <input className="a-input h-9 min-w-0 flex-1" value={item.url} onChange={(e) => onChange({ ...item, url: e.target.value })} placeholder="/page or https://…" aria-label="Link" list="page-links" />
      <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
        <input type="checkbox" checked={item.newTab} onChange={(e) => onChange({ ...item, newTab: e.target.checked })} className="accent-brand-600" />New tab
      </label>
      <div className="flex items-center">
        <button type="button" onClick={() => onMove(-1)} className="rounded p-1.5 text-ink-400 hover:text-ink-700" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
        <button type="button" onClick={() => onMove(1)} className="rounded p-1.5 text-ink-400 hover:text-ink-700" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
        {onAddChild && <button type="button" onClick={onAddChild} className="rounded p-1.5 text-ink-400 hover:text-brand-600" title="Add dropdown link" aria-label="Add dropdown link"><Plus className="h-4 w-4" /></button>}
        <button type="button" onClick={onRemove} className="rounded p-1.5 text-ink-400 hover:text-rose-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// Thin drop target at the end of a list (top level or a dropdown), visible only while dragging.
function EndZone({ active, show, label, nested, onDragOver, onDrop }) {
  if (!show) return null;
  return (
    <div onDragOver={onDragOver} onDrop={onDrop}
      className={cn('rounded-xl border-2 border-dashed px-3 py-2 text-center text-xs font-medium transition', nested && 'ml-8',
        active ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/10' : 'border-ink-200 text-ink-400 dark:border-white/10')}
    >{label}</div>
  );
}

function MenuEditor({ menu, pages, usedIn, onSaved, onDeleted }) {
  const [items, setItems] = useState(menu.items);
  const [name, setName] = useState(menu.name);
  const [saving, setSaving] = useState(false);
  const [drag, setDrag] = useState(null); // path being dragged
  const [over, setOver] = useState(null); // drop target key, e.g. "0", "2.1", "end", "end.3"
  const nesting = menu.location !== 'footer'; // the footer shows a flat list
  const dirty = JSON.stringify(items) !== JSON.stringify(menu.items) || name !== menu.name;
  useUnsavedWarning(dirty);
  useEffect(() => { setItems(menu.items); setName(menu.name); }, [menu]);

  const updateAt = (i, item) => setItems((list) => list.map((x, j) => (j === i ? item : x)));

  // Drag handlers for a drop target that inserts at { parent, index }.
  const dropProps = (key, to) => ({
    onDragOver: (e) => {
      if (!drag) return;
      if (to.parent !== null && (!nesting || items[drag[0]]?.children?.length) && drag.length === 1) return; // not allowed → no drop
      e.preventDefault();
      if (over !== key) setOver(key);
    },
    onDrop: (e) => {
      e.preventDefault();
      setItems((list) => moveItem(list, drag, to));
      setDrag(null);
      setOver(null);
    },
  });
  const dragProps = (path) => ({
    dragging: drag?.join('.') === path.join('.'),
    onDragStart: (e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', path.join('.')); setDrag(path); },
    onDragEnd: () => { setDrag(null); setOver(null); },
  });

  const save = async () => {
    setSaving(true);
    try {
      const saved = await api.put(`/menus/${menu.location}`, { items, ...(menu.builtIn ? {} : { name }) });
      toast.success(`${saved.name} saved`);
      onSaved(saved);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${menu.name}”? Places using it will fall back to their default menu.`)) return;
    try {
      await api.del(`/menus/${menu.location}`);
      toast.success('Menu deleted');
      onDeleted(menu.location);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Card
      title={menu.builtIn ? menu.name : (
        <input className="-ml-1 w-full rounded-lg bg-transparent px-1 font-heading text-[17px] font-semibold outline-none ring-brand-500/30 focus:ring-2" value={name} onChange={(e) => setName(e.target.value)} aria-label="Menu name" />
      )}
      description={(
        <span className="flex flex-wrap items-center gap-1.5">
          <code className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-500 dark:bg-white/5">{menu.location}</code>
          {usedIn.length ? usedIn.map((u) => <Badge key={u} color="brand">{u}</Badge>) : <span>Not shown yet — choose it in Site settings.</span>}
        </span>
      )}
      actions={(
        <div className="flex gap-1.5">
          {!menu.builtIn && <button type="button" className="a-btn-ghost a-btn-icon hover:text-rose-600" onClick={remove} title="Delete menu" aria-label="Delete menu"><Trash2 className="h-4 w-4" /></button>}
          <button type="button" className="a-btn-primary" onClick={save} disabled={saving || !dirty}>{saving ? <Spinner /> : <Save className="h-4 w-4" />}Save</button>
        </div>
      )}
    >
      <div className="space-y-2">
        {items.length === 0 && !drag && <p className="rounded-xl bg-ink-50 py-6 text-center text-sm text-ink-400 dark:bg-white/[.03]">No links yet.</p>}
        {items.map((item, i) => (
          <div key={i} className="space-y-2">
            <ItemRow
              item={item}
              pages={pages}
              dropHere={over === String(i)}
              {...dragProps([i])}
              {...dropProps(String(i), { parent: null, index: i })}
              onChange={(next) => updateAt(i, next)}
              onRemove={() => setItems((list) => list.filter((_, j) => j !== i))}
              onMove={(step) => setItems((list) => moveIn(list, i, step))}
              onAddChild={nesting ? () => updateAt(i, { ...item, children: [...(item.children || []), { label: 'Sub link', url: '/', newTab: false }] }) : undefined}
            />
            {(item.children || []).map((child, c) => (
              <ItemRow
                key={c}
                nested
                item={child}
                pages={pages}
                dropHere={over === `${i}.${c}`}
                {...dragProps([i, c])}
                {...dropProps(`${i}.${c}`, { parent: i, index: c })}
                onChange={(next) => updateAt(i, { ...item, children: item.children.map((x, j) => (j === c ? next : x)) })}
                onRemove={() => updateAt(i, { ...item, children: item.children.filter((_, j) => j !== c) })}
                onMove={(step) => updateAt(i, { ...item, children: moveIn(item.children, c, step) })}
              />
            ))}
            {/* While dragging, each top link offers a zone to drop the dragged link into its dropdown. */}
            <EndZone nested show={!!drag && nesting && drag.join('.') !== String(i) && !(drag.length === 1 && items[drag[0]]?.children?.length)}
              active={over === `end.${i}`} label={`Drop here to put it under “${item.label}”`} {...dropProps(`end.${i}`, { parent: i, index: (item.children || []).length })} />
          </div>
        ))}
        <EndZone show={!!drag} active={over === 'end'} label="Drop here to move it to the end" {...dropProps('end', { parent: null, index: items.length })} />
        <button type="button" onClick={() => setItems((list) => [...list, newItem()])} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 py-2.5 text-sm font-semibold text-ink-500 hover:border-brand-400 hover:text-brand-600 dark:border-white/10">
          <Plus className="h-4 w-4" />Add link
        </button>
      </div>
      <datalist id="page-links">{pages.map((p) => <option key={p.slug} value={`/${p.slug}`}>{p.title}</option>)}</datalist>
    </Card>
  );
}

function NewMenuModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const menu = await api.post('/menus', { name });
      toast.success(`${menu.name} created`);
      setName('');
      onCreated(menu);
    } catch (err) {
      setError(err.data?.errors?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New menu" description="Create a menu, add links, then choose where it shows in Site settings." size="sm">
      <form onSubmit={create} className="space-y-4">
        <Field label="Menu name" htmlFor="menu-name" error={error}>
          <input id="menu-name" className="a-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Patient resources" autoFocus />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className="a-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="a-btn-primary" disabled={saving || name.trim().length < 2}>{saving && <Spinner />}Create menu</button>
        </div>
      </form>
    </Modal>
  );
}

export default function MenusPage() {
  const { data, mutate } = useApi('/menus');
  const { data: pages } = useApi('/pages', { limit: 100, status: 'published' });
  const { data: settings } = useApi('/settings');
  const [creating, setCreating] = useState(false);

  // Where each menu is shown, from the site settings.
  const usedIn = (location) => {
    const places = [];
    if ((settings?.appearance.headerMenu || 'header') === location) places.push(USED_IN.header);
    if ((settings?.appearance.footerMenu || 'footer') === location) places.push(USED_IN.footer);
    return places;
  };

  const replace = (saved) => mutate({ items: data.items.map((m) => (m.location === saved.location ? saved : m)) }, { revalidate: false });

  return (
    <RequirePermission permission="website">
      <PageHeader
        title="Menus"
        description="Drag links to reorder them or move them into a dropdown. Create extra menus and choose where they show in Site settings."
        actions={<button type="button" className="a-btn-primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" />New menu</button>}
      />
      {!data ? <PageLoader /> : (
        <>
          <div className="grid gap-6 2xl:grid-cols-2">
            {data.items.map((menu) => (
              <MenuEditor key={menu.location} menu={menu} pages={pages?.items || []} usedIn={usedIn(menu.location)}
                onSaved={replace}
                onDeleted={(location) => mutate({ items: data.items.filter((m) => m.location !== location) }, { revalidate: false })} />
            ))}
          </div>
          {data.items.length === 0 && <EmptyState icon={ListTree} title="No menus" />}
        </>
      )}
      <NewMenuModal open={creating} onClose={() => setCreating(false)}
        onCreated={(menu) => { setCreating(false); mutate({ items: [...data.items, menu] }, { revalidate: false }); }} />
    </RequirePermission>
  );
}
