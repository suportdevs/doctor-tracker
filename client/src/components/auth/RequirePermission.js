'use client';

import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/components/ui';

// Hides a page from users without the permission (the API enforces it as well).
export default function RequirePermission({ permission, children }) {
  const { can } = useAuth();
  if (!can(permission)) {
    return <EmptyState icon={ShieldAlert} title="Access denied" description="Your role doesn’t include access to this page. Ask an administrator if you need it." />;
  }
  return children;
}
