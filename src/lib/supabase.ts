// src/lib/supabase.ts
// Supabase client initialization with local storage demo fallback

import { createClient } from '@supabase/supabase-js';

// Production fallback credentials (public anon key) ensuring cloud sync works even if repo secrets are unset
const DEFAULT_SUPABASE_URL = 'https://rtwcezjrjrmworfnmvsk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0d2NlempyanJtd29yZm5tdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTM4MjcsImV4cCI6MjEwNTMyOTgyN30.yt42IAZoBPW8-C6GniW8Sv6KdktnyGVrYqW2HwssztE';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Standard Supabase client instance (or dummy client if credentials aren't provided yet)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
