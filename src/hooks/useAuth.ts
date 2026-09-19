// src/hooks/useAuth.ts
// Authentication hook managing Supabase Auth and Instant Demo Mode

import { useState } from 'react';
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

// Module-level singleton initialization — runs exactly once globally across the entire app
let authInitialized = false;

export function initializeAuth() {
  if (authInitialized) return;
  authInitialized = true;

  if (!isSupabaseConfigured) {
    useAppStore.getState().setAuthLoading(false);
    return;
  }

  // 1. Listen for Supabase auth state changes globally (fires INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, etc.)
  supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useAppStore.getState();

    if (event === 'SIGNED_OUT') {
      store.setUser(null, null);
      store.setAuthLoading(false);
    } else if (
      event === 'INITIAL_SESSION' ||
      event === 'SIGNED_IN' ||
      event === 'USER_UPDATED' ||
      event === 'TOKEN_REFRESHED'
    ) {
      if (session?.user) {
        store.setUser({ id: session.user.id, email: session.user.email || '' });
        await store.syncWithSupabase().catch(console.error);
      } else {
        // If INITIAL_SESSION has no user and store is not in demo mode, clear stale user
        if (!store.isDemoMode) {
          store.setUser(null, null);
        }
      }
      store.setAuthLoading(false);
    }
  });

  // 2. Also run initial getSession check to verify or restore session
  supabase.auth.getSession().then(async ({ data: { session }, error }) => {
    const store = useAppStore.getState();
    if (error) {
      console.warn('Initial getSession error:', error);
    }
    if (session?.user) {
      store.setUser({ id: session.user.id, email: session.user.email || '' });
      await store.syncWithSupabase().catch(console.error);
    } else if (!store.isDemoMode) {
      store.setUser(null, null);
    }
    store.setAuthLoading(false);
  }).catch((err) => {
    console.error('Session init failed:', err);
    useAppStore.getState().setAuthLoading(false);
  });
}

// Automatically initialize auth once at module evaluation
initializeAuth();

export function useAuth() {
  const {
    user,
    profile,
    isDemoMode,
    authLoading,
    setUser,
    setDemoMode,
    signOut: storeSignOut,
    syncWithSupabase,
  } = useAppStore();

  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setSubmitting(true);
    setAuthError(null);

    if (!isSupabaseConfigured) {
      // Deterministic offline fallback: keeps data accessible across reloads
      const offlineId = getOfflineUserId(email);
      setUser({ id: offlineId, email });
      setSubmitting(false);
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        setSubmitting(false);
        return false;
      }
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || email });
        // Fetch authoritative profile name, categories and transactions from Supabase
        await syncWithSupabase();
      }
      setSubmitting(false);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setAuthError(message);
      setSubmitting(false);
      return false;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    setSubmitting(true);
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
      setSubmitting(false);
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
        setSubmitting(false);
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
      setSubmitting(false);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
      setAuthError(message);
      setSubmitting(false);
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
    loading: authLoading || submitting,
    authError,
    signIn,
    signUp,
    signInWithDemo,
    signOut,
  };
}
