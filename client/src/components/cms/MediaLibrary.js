'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, ImageIcon, Trash2, Upload, X } from 'lucide-react';
import { api } from '@/services/api';
import { useApi } from '@/hooks';
import { cn, formatBytes } from '@/lib/utils';
import { EmptyState, Modal, Pagination, SearchInput, Spinner } from '@/components/ui';

export function UploadButton({ onUploaded, className }) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const body = new FormData();
        body.append('file', file);
        await api.upload('/media', body);
      }
      toast.success(files.length > 1 ? `${files.length} images uploaded` : 'Image uploaded');
      onUploaded?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      input.current.value = '';
    }
  };

  return (
    <>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => upload([...e.target.files])} />
      <button type="button" className={cn('a-btn-primary', className)} onClick={() => input.current.click()} disabled={uploading}>
        {uploading ? <Spinner /> : <Upload className="h-4 w-4" />}Upload images
      </button>
    </>
  );
}

// Grid of uploaded images. With onSelect it works as a picker; otherwise it manages (delete) files.
export function MediaGrid({ onSelect, selected }) {
  const [params, setParams] = useState({ q: '', page: 1 });
  const { data, mutate } = useApi('/media', { ...params, limit: 24 });

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.originalName}"? Pages using it will show a broken image.`)) return;
    try {
      await api.del(`/media/${item._id}`);
      toast.success('Image deleted');
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={params.q} onChange={(q) => setParams({ q, page: 1 })} placeholder="Search images…" className="flex-1 sm:max-w-xs" />
        <UploadButton onUploaded={() => mutate()} />
      </div>
      {data?.items.length === 0 && <EmptyState icon={ImageIcon} title="No images yet" description="Upload JPG, PNG, WebP or GIF images up to 5 MB." />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {data?.items.map((item) => (
          <div key={item._id} className={cn('group relative overflow-hidden rounded-xl border-2 bg-ink-50 dark:bg-white/5', selected === item.url ? 'border-brand-500' : 'border-transparent')}>
            <button type="button" onClick={() => onSelect?.(item.url)} className={cn('block w-full', !onSelect && 'cursor-default')}>
              <img src={item.url} alt={item.alt || item.originalName} loading="lazy" className="aspect-square w-full object-cover" />
            </button>
            {selected === item.url && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white"><Check className="h-4 w-4" /></span>}
            <div className="flex items-center gap-1 px-2 py-1.5">
              <p className="min-w-0 flex-1 truncate text-xs text-ink-500" title={item.originalName}>{item.originalName}<br /><span className="text-ink-400">{formatBytes(item.size)}</span></p>
              {!onSelect && <button type="button" onClick={() => remove(item)} className="rounded p-1 text-ink-400 hover:text-rose-600" aria-label="Delete image"><Trash2 className="h-4 w-4" /></button>}
            </div>
          </div>
        ))}
      </div>
      {data?.meta.pages > 1 && <div className="mt-4"><Pagination meta={data.meta} onPage={(page) => setParams((p) => ({ ...p, page }))} /></div>}
    </div>
  );
}

// Image input used by page blocks and settings: preview + "choose from library" + paste a URL.
export function ImageField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-ink-200 bg-ink-50 dark:border-white/10 dark:bg-white/5">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-ink-300" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="a-btn-secondary h-9" onClick={() => setOpen(true)}>Choose</button>
          {value && <button type="button" className="a-btn-ghost h-9 text-rose-600" onClick={() => onChange('')}><X className="h-4 w-4" />Remove</button>}
        </div>
      </div>
      <input className="a-input mt-2 h-9 text-xs" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image URL" />
      <Modal open={open} onClose={() => setOpen(false)} title="Choose an image" size="xl">
        <MediaGrid selected={value} onSelect={(url) => { onChange(url); setOpen(false); }} />
      </Modal>
    </div>
  );
}
