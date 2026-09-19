// src/hooks/useAuth.ts
// Authentication hook managing Supabase Auth and Instant Demo Mode

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';

function getOfflineUserId(email: string): string {
  try {
    const sanitized = email.toLowerCase().trim();
    const encoded = typeof btoa !== 'undefined'
      ? btoa(encodeURIComponent(sanitized)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
      : sanitized.replace(/[^a-zA-Z0-9]/g, '');
    return `user-${encoded}`;
  } catch {
    return `user-offline`;
  }
}

export function useAuth() {
  const { user, profile, isDemoMode, setUser, setDemoMode, signOut: storeSignOut, syncWithSupabase } = useAppStore();
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session retrieval error:', error);
        }
        if (!isMounted) return;

        if (session?.user) {
          useAppStore.getState().setUser({ id: session.user.id, email: session.user.email || '' });
          await useAppStore.getState().syncWithSupabase();
        }
      } catch (err) {
        console.error('Initial session check failed:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        useAppStore.getState().setUser(null, null);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          const currentUserId = useAppStore.getState().user?.id;
          useAppStore.getState().setUser({ id: session.user.id, email: session.user.email || '' });
          if (currentUserId !== session.user.id) {
            await useAppStore.getState().syncWithSupabase().catch(console.error);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setAuthError(null);

    if (!isSupabaseConfigured) {
      // Deterministic offline fallback: keeps data accessible across reloads
      const offlineId = getOfflineUserId(email);
      setUser({ id: offlineId, email });
      setLoading(false);
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return false;
      }
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || email });
        // Fetch authoritative profile name, categories and transactions from Supabase
        await syncWithSupabase();
      }
      setLoading(false);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setAuthError(message);
      setLoading(false);
      return false;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    setLoading(true);
    setAuthError(null);

    if (!isSupabaseConfigured) {
      const offlineId = getOfflineUserId(email);
      setUser({ id: offlineId, email }, {
        id: offlineId,
        display_name: displayName || email.split('@')[0],
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return false;
      }

      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || email });

        // Guarantee profile row is created immediately with the provided display name
        if (displayName) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              display_name: displayName,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          } catch (e) {
            console.warn('Initial profile upsert note on signup:', e);
          }
        }

        await syncWithSupabase();
      }
      setLoading(false);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
      setAuthError(message);
      setLoading(false);
      return false;
    }
  };

  const signInWithDemo = () => {
    setDemoMode(true);
  };

  const signOut = async () => {
    await storeSignOut();
  };

  return {
    user,
    profile,
    isAuthenticated: Boolean(user || isDemoMode),
    isDemoMode,
    loading,
    authError,
    signIn,
    signUp,
    signInWithDemo,
    signOut,
  };
}
