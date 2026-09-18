// src/hooks/useAuth.ts
// Authentication hook managing Supabase Auth and Instant Demo Mode

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';

export function useAuth() {
  const { user, profile, isDemoMode, setUser, setDemoMode, signOut: storeSignOut } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !isDemoMode) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !isDemoMode) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else if (!session && !isDemoMode) {
        setUser(null, null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode, setUser]);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setAuthError(null);

    if (!isSupabaseConfigured) {
      // Offline fallback: allow direct sign in
      setUser({ id: 'user-' + Date.now(), email });
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
      setUser({ id: 'user-' + Date.now(), email }, {
        id: 'user-' + Date.now(),
        display_name: displayName || email.split('@')[0],
        avatar_url: null,
        created_at: new Date().toISOString(),
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
