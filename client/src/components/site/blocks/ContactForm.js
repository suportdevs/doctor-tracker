'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Siren } from 'lucide-react';
import { api } from '@/services/api';
import { Section, SectionHeading, isInverse } from '../Section';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '', doctor: '', preferredDate: '', website: '' };

export function ContactForm({ data, style, live, settings }) {
  const appointment = data.mode === 'appointment';
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ sending: false, done: '', error: '' });
  const contact = settings?.contact || {};
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ sending: true, done: '', error: '' });
    try {
      const res = await api.post('/public/messages', { ...form, kind: appointment ? 'appointment' : 'contact' });
      setState({ sending: false, done: res.message, error: '' });
      setForm(EMPTY);
    } catch (err) {
      setState({ sending: false, done: '', error: err.message });
    }
  };

  const info = [
    [Phone, 'Phone', contact.phone, `tel:${contact.phone}`],
    [Siren, 'Emergency', contact.emergencyPhone, `tel:${contact.emergencyPhone}`],
    [Mail, 'Email', contact.email, `mailto:${contact.email}`],
    [MapPin, 'Address', contact.address],
    [Clock, 'Opening hours', contact.hours],
  ].filter(([, , value]) => value);

  return (
    <Section style={style}>
      <div className={data.showInfo ? 'grid gap-10 lg:grid-cols-5' : 'mx-auto max-w-2xl'}>
        {data.showInfo && (
          <div className="lg:col-span-2">
            <SectionHeading title={data.title} subtitle={data.text} inverse={isInverse(style)} align="left" />
            <ul className="space-y-4">
              {info.map(([Icon, label, value, href]) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wide opacity-60">{label}</span>
                    {href ? <a href={href} className="font-medium hover:text-primary">{value}</a> : <span className="font-medium">{value}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={data.showInfo ? 'lg:col-span-3' : ''}>
          {!data.showInfo && <SectionHeading title={data.title} subtitle={data.text} inverse={isInverse(style)} />}
          {state.done ? (
            <div className="rounded-theme-lg border border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-800">
              <CheckCircle2 className="mx-auto h-10 w-10" />
              <p className="mt-3 font-semibold">{state.done}</p>
              <button type="button" onClick={() => setState({ sending: false, done: '', error: '' })} className="mt-4 text-sm font-semibold underline">Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 rounded-[1.75rem] border border-ink-200/70 bg-white p-6 text-ink-900 shadow-xl shadow-ink-900/5 sm:grid-cols-2 sm:p-8">
              <input className="site-input" placeholder="Full name *" value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" />
              <input className="site-input" type="email" placeholder="Email *" value={form.email} onChange={set('email')} required autoComplete="email" />
              <input className="site-input" placeholder="Phone" value={form.phone} onChange={set('phone')} autoComplete="tel" />
              {appointment ? (
                <input className="site-input" type="date" aria-label="Preferred date" value={form.preferredDate} min={new Date().toISOString().slice(0, 10)} onChange={set('preferredDate')} />
              ) : (
                <input className="site-input" placeholder="Subject" value={form.subject} onChange={set('subject')} />
              )}
              {appointment && (
                <select className="site-input sm:col-span-2" value={form.doctor} onChange={set('doctor')} aria-label="Doctor">
                  <option value="">Any available doctor</option>
                  {[...(live?.doctors || [])].sort((a, b) => a.name.localeCompare(b.name)).map((d) =><option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
                </select>
              )}
              <textarea className="site-input min-h-[130px] sm:col-span-2" placeholder={appointment ? 'Tell us briefly about your symptoms *' : 'Your message *'} value={form.message} onChange={set('message')} required minLength={5} />
              {/* Honeypot: hidden from people, bots fill it in. */}
              <input type="text" name="website" value={form.website} onChange={set('website')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              {state.error && <p className="text-sm font-medium text-rose-600 sm:col-span-2" role="alert">{state.error}</p>}
              <button type="submit" disabled={state.sending} className="btn-primary sm:col-span-2">
                {state.sending && <Loader2 className="h-4 w-4 animate-spin" />}
                {appointment ? 'Request appointment' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
