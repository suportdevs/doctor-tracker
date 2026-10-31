'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import Shell from '@/components/layout/AdminShell';
import { PageLoader } from '@/components/ui';

function Guard({ children }) {
  const { user, loading } = useAuth();
  // Nothing protected renders until the session is confirmed by the API.
  if (loading || !user) return <div className="min-h-screen bg-ink-50 dark:bg-ink-950"><PageLoader /></div>;
  return <Shell>{children}</Shell>;
}

export default function PanelLayout({ children }) {
  return (
    <AuthProvider>
      <Guard>{children}</Guard>
    </AuthProvider>
  );
}
