'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Globe, Mail, Palette, RotateCcw, Save, Search, Share2, ShieldCheck } from 'lucide-react';
import { ImageField } from '@/components/cms/MediaLibrary';
import RequirePermission from '@/components/auth/RequirePermission';
import { Card, Field, PageHeader, PageLoader, Spinner, Toggle } from '@/components/ui';
import { api } from '@/services/api';
import { useApi, useUnsavedWarning } from '@/hooks';
import { cn } from '@/lib/utils';

// Each tab edits one settings group. `name` may be a dotted path into nested settings ("headerCta.label").
const GROUPS = [
  { key: 'general', label: 'General', icon: Globe, fields: [
    { name: 'siteName', label: 'Website name' },
    { name: 'tagline', label: 'Tagline' },
    { name: 'homePage', label: 'Home page', type: 'page', hint: 'The page shown at the website address “/”.' },
    { name: 'logo', label: 'Logo', type: 'image', hint: 'Optional. Replaces the icon + name in the header.' },
    { name: 'favicon', label: 'Browser tab icon (favicon)', type: 'image' },
  ] },
  { key: 'appearance', label: 'Appearance', icon: Palette, fields: [
    { name: 'primaryColor', label: 'Primary colour', type: 'color', half: true },
    { name: 'accentColor', label: 'Accent colour', type: 'color', half: true },
    { name: 'radius', label: 'Corner roundness (px)', type: 'number', half: true },
    { name: 'footerText', label: 'Footer text', half: true },
    { name: 'headerMenu', label: 'Header menu', type: 'menu', half: true, hint: 'Menus are managed in Website → Menus.' },
    { name: 'footerMenu', label: 'Footer menu', type: 'menu', half: true },
    { name: 'headerCta.enabled', label: 'Show button in header', type: 'toggle' },
    { name: 'headerCta.label', label: 'Header button text', half: true },
    { name: 'headerCta.url', label: 'Header button link', half: true },
    { name: 'announcement.enabled', label: 'Show announcement bar above the header', type: 'toggle' },
    { name: 'announcement.text', label: 'Announcement text' },
    { name: 'announcement.linkLabel', label: 'Announcement link text', half: true },
    { name: 'announcement.url', label: 'Announcement link', half: true },
  ] },
  { key: 'contact', label: 'Contact', icon: Mail, fields: [
    { name: 'phone', label: 'Phone', half: true },
    { name: 'emergencyPhone', label: 'Emergency phone', half: true },
    { name: 'email', label: 'Email', half: true },
    { name: 'hours', label: 'Opening hours', half: true },
    { name: 'address', label: 'Address' },
  ] },
  { key: 'social', label: 'Social links', icon: Share2, fields: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((name) => ({ name, label: name[0].toUpperCase() + name.slice(1), placeholder: 'https://…', half: true })) },
  { key: 'seo', label: 'SEO', icon: Search, fields: [
    { name: 'metaTitle', label: 'Default page title' },
    { name: 'metaDescription', label: 'Default description', type: 'textarea' },
    { name: 'ogImage', label: 'Social sharing image', type: 'image' },
  ] },
  { key: 'admin', label: 'Admin panel', icon: ShieldCheck, fields: [
    { name: 'appName', label: 'Admin panel name' },
    { name: 'loginTitle', label: 'Login screen headline', half: true },
    { name: 'loginHighlight', label: 'Highlighted words', half: true },
    { name: 'loginText', label: 'Login screen text', type: 'textarea' },
  ] },
];

const getPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
const setPath = (obj, path, value) => {
  const [head, ...rest] = path.split('.');
  return { ...obj, [head]: rest.length ? setPath(obj[head] || {}, rest.join('.'), value) : value };
};

function SettingInput({ field, value, onChange, pages, menus }) {
  switch (field.type) {
    case 'menu':
      return (
        <select className="a-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {menus.map((m) => <option key={m.location} value={m.location}>{m.name}</option>)}
        </select>
      );
    case 'image': return <ImageField value={value} onChange={onChange} />;
    case 'toggle': return <Toggle checked={!!value} onChange={onChange} label={field.label} />;
    case 'textarea': return <textarea className="a-textarea" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number': return <input type="number" className="a-input" value={value ?? ''} min={0} max={40} onChange={(e) => onChange(Number(e.target.value))} />;
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#0d9488'} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-ink-200 bg-transparent p-1 dark:border-white/10" />
          <input className="a-input font-mono" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case 'page':
      return (
        <select className="a-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {pages.map((p) => <option key={p.slug} value={p.slug}>{p.title} (/{p.slug})</option>)}
        </select>
      );
    default: return <input className="a-input" value={value ?? ''} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}

function GroupForm({ group, values: saved, pages, menus, onSaved }) {
  const [values, setValues] = useState(saved);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  useUnsavedWarning(dirty);
  useEffect(() => setValues(saved), [saved]);

  const run = async (request, message) => {
    setSaving(true);
    try {
      onSaved(await request());
      toast.success(message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title={group.label}
      description={group.description || 'Changes appear on the website right after saving.'}
      actions={(
        <div className="flex gap-2">
          <button type="button" className="a-btn-ghost" disabled={saving} onClick={() => window.confirm(`Reset ${group.label} settings to defaults?`) && run(() => api.post(`/settings/${group.key}/reset`), 'Settings reset')}>
            <RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Reset</span>
          </button>
          <button type="button" className="a-btn-primary" disabled={saving || !dirty} onClick={() => run(() => api.put(`/settings/${group.key}`, values), 'Settings saved')}>
            {saving ? <Spinner /> : <Save className="h-4 w-4" />}Save
          </button>
        </div>
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {group.fields.map((field) => (
          <Field key={field.name} label={field.type === 'toggle' ? null : field.label} hint={field.hint} className={field.half ? '' : 'sm:col-span-2'}>
            <SettingInput field={field} pages={pages} menus={menus} value={getPath(values, field.name)} onChange={(v) => setValues((s) => setPath(s, field.name, v))} />
          </Field>
        ))}
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const { data, mutate } = useApi('/settings');
  const { data: pages } = useApi('/pages', { limit: 100 });
  const { data: menus } = useApi('/menus');
  const [tab, setTab] = useState('general');
  const group = GROUPS.find((g) => g.key === tab);

  return (
    <RequirePermission permission="website">
      <PageHeader title="Site settings" description="Branding, colours, contact details and SEO for the public website." />
      {!data ? <PageLoader /> : (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="a-scroll flex gap-1 overflow-x-auto lg:flex-col" aria-label="Settings sections">
            {GROUPS.map((g) => (
              <button key={g.key} type="button" onClick={() => setTab(g.key)}
                className={cn('flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition', tab === g.key ? 'bg-white text-brand-700 shadow-soft dark:bg-ink-900 dark:text-brand-300' : 'text-ink-500 hover:text-ink-900 dark:hover:text-white')}
              ><g.icon className="h-4 w-4" />{g.label}</button>
            ))}
          </nav>
          <GroupForm key={tab} group={group} values={data[tab]} pages={pages?.items || []} menus={menus?.items || []} onSaved={(all) => mutate(all, { revalidate: false })} />
        </div>
      )}
    </RequirePermission>
  );
}
