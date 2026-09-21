import type { StorageAdapter } from './lib/types';
import { LocalStorageAdapter } from './lib/localStorageAdapter';
import { SupabaseStorageAdapter } from './lib/supabaseAdapter';
import { isSupabaseConfigured } from '../../lib/supabase';
import { DEMO_USER_ID } from '../../lib/mockData';

export type { StorageAdapter } from './lib/types';
export { LocalStorageAdapter } from './lib/localStorageAdapter';
export { SupabaseStorageAdapter } from './lib/supabaseAdapter';

/**
 * Storage Client Factory
 * Resolves the appropriate storage adapter based on user authentication and demo state.
 */
export function getStorageAdapter(
  user: { id: string } | null | undefined,
  isDemoMode: boolean
): StorageAdapter {
  const isRealUser = Boolean(user && user.id && user.id !== DEMO_USER_ID);
  if (isSupabaseConfigured && !isDemoMode && isRealUser) {
    return new SupabaseStorageAdapter();
  }
  return new LocalStorageAdapter();
}
