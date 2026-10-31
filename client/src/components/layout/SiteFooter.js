import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Stethoscope, Twitter, Youtube } from 'lucide-react';
import { SmartLink } from '@/components/site/Section';

const SOCIAL = { facebook: Facebook, twitter: Twitter, instagram: Instagram, linkedin: Linkedin, youtube: Youtube };

export default function Footer({ settings, items = [] }) {
  const { general, appearance, contact, social } = settings;
  const socials = Object.entries(social || {}).filter(([key, url]) => url && SOCIAL[key]);

  return (
    <footer className="relative overflow-hidden bg-site-dark text-white/70">
      <div className="bg-dots pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      <div className="container-site relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="flex items-center gap-2.5 font-heading text-xl font-bold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-ink-950"><Stethoscope className="h-5 w-5" /></span>
            {general.siteName}
          </p>
          <p className="mt-5 max-w-sm font-heading text-2xl font-semibold leading-snug tracking-tight text-white">{appearance.footerText || general.tagline}</p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(([key, url]) => {
                const Icon = SOCIAL[key];
                return (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="grid h-10 w-10 place-items-center rounded-full bg-white/[.07] transition hover:bg-accent hover:text-ink-950">
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/40">Quick links</p>
            <ul className="mt-5 space-y-3 text-sm">
              {items.map((item) => (
                <li key={item.label + item.url}>
                  <SmartLink href={item.url} className="group inline-flex items-center gap-1 transition hover:text-white">
                    {item.label}<ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/40">Contact</p>
          <ul className="mt-5 space-y-3.5 text-sm">
            {contact.phone && <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><a href={`tel:${contact.phone}`} className="hover:text-white">{contact.phone}</a></li>}
            {contact.email && <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a></li>}
            {contact.address && <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{contact.address}</li>}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/[.08]">
        <p className="container-site py-6 text-xs text-white/40">© {new Date().getFullYear()} {general.siteName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
