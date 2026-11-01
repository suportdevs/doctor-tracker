'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api, tokenStore } from '@/services/api';

const AuthContext = createContext(null);

// Holds the signed-in user for the whole admin panel and sends guests to /admin/login.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: me } = await api.get('/auth/me');
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!loading && !user) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const can = useCallback((permission) => {
    const perms = user?.permissions || [];
    return perms.includes('*') || perms.includes(permission);
  }, [user]);

  // Memoised so consumers only re-render when the user actually changes.
  const value = useMemo(() => ({ user, setUser, loading, logout, can, refresh }), [user, loading, logout, can, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
