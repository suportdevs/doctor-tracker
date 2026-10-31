import { Toaster } from 'sonner';

export const metadata = { title: { default: 'Admin', template: '%s · Doctor Tracker Admin' }, robots: { index: false } };

export default function AdminRootLayout({ children }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" closeButton />
    </>
  );
}
