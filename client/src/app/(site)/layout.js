import { Megaphone } from 'lucide-react';
import Header from '@/components/layout/SiteHeader';
import Footer from '@/components/layout/SiteFooter';
import { SmartLink } from '@/components/site/Section';
import { getBootstrap } from '@/services/server-api';
import { themeStyle } from '@/lib/theme';

export async function generateMetadata() {
  const boot = await getBootstrap();
  const seo = boot?.settings.seo;
  const general = boot?.settings.general;
  return {
    title: { default: seo?.metaTitle || 'Doctor Tracker', template: `%s | ${general?.siteName || 'Doctor Tracker'}` },
    description: seo?.metaDescription,
    openGraph: { siteName: general?.siteName, images: seo?.ogImage ? [seo.ogImage] : undefined },
    icons: general?.favicon ? { icon: general.favicon } : undefined,
  };
}

// The menu chosen in Site settings, or the built-in one if that menu was deleted.
const pickMenu = (menus, key, fallback) => menus[key] || menus[fallback] || [];

export default async function SiteLayout({ children }) {
  const boot = await getBootstrap();

  if (!boot) {
    return (
      <main className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">We’ll be right back</h1>
          <p className="mt-2 text-slate-500">The website is temporarily unavailable. Please try again in a moment.</p>
        </div>
      </main>
    );
  }

  const { settings, menus } = boot;
  const bar = settings.appearance.announcement;

  return (
    <div style={themeStyle(settings.appearance)} className="flex min-h-screen flex-col">
      {bar?.enabled && bar.text && (
        <div className="bg-site-dark text-white">
          <p className="container-site flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-center text-xs font-medium sm:text-sm">
            <Megaphone className="hidden h-4 w-4 text-accent sm:block" />
            {bar.text}
            {bar.linkLabel && bar.url && <SmartLink href={bar.url} className="font-semibold text-white underline underline-offset-4 hover:no-underline">{bar.linkLabel}</SmartLink>}
          </p>
        </div>
      )}
      <Header settings={settings} items={pickMenu(menus, settings.appearance.headerMenu, 'header')} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} items={pickMenu(menus, settings.appearance.footerMenu, 'footer')} />
    </div>
  );
}
