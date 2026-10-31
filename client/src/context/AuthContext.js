'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, tokenStore } from '@/services/api';
import { DEFAULT_PREFERENCES } from '@/lib/adminTheme';

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

  // Admin look & feel saved on the account (Customize panel). Missing keys fall back to defaults.
  const preferences = useMemo(() => ({ ...DEFAULT_PREFERENCES, ...(user?.preferences || {}) }), [user?.preferences]);

  // Optimistic: the UI changes at once, then the change is saved; on failure it is rolled back.
  const updatePreferences = useCallback(async (changes) => {
    let previous;
    setUser((u) => {
      previous = u?.preferences;
      return u && { ...u, preferences: { ...u.preferences, ...changes } };
    });
    try {
      await api.put('/auth/me/preferences', changes);
    } catch (err) {
      setUser((u) => u && { ...u, preferences: previous });
      toast.error(`Couldn’t save: ${err.message}`);
    }
  }, []);

  // Memoised so consumers only re-render when the user actually changes.
  const value = useMemo(
    () => ({ user, setUser, loading, logout, can, refresh, preferences, updatePreferences }),
    [user, loading, logout, can, refresh, preferences, updatePreferences],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
