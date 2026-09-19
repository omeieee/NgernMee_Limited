// src/stores/useAppStore.ts
// Central state management for NgernMee Limited (Zustand)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, Profile, TaxCalculationResult, TaxConfig, Transaction } from '../lib/types';
import {
  createInitialCategories,
  createInitialTaxConfig,
  createInitialTransactions,
  DEMO_PROFILE,
  DEMO_USER_ID,
} from '../lib/mockData';
import { calculateDiscount, getDailyUsage, getMonthlyUsage, getRemainingQuota } from '../lib/thaiChuayThai';
import { calculateTax } from '../lib/thaiTax';
import { generateId } from '../lib/utils';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface AppState {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Auth & Profile
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isDemoMode: boolean;
  isLoading: boolean;
  setUser: (user: { id: string; email: string } | null, profile?: Profile | null) => void;
  setDemoMode: (enabled: boolean) => void;
  updateProfile: (displayName: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'user_id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  initializeDefaultCategories: (force?: boolean) => Promise<void>;

  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Tax Configuration
  taxConfig: TaxConfig;
  updateTaxConfig: (updates: Partial<TaxConfig>) => Promise<void>;
  getTaxCalculation: (overrideGrossIncome?: number) => TaxCalculationResult;

  // Thai Chuay Thai Quota helper
  getThaiChuayThaiStatus: (dateStr?: string, pendingAmount?: number) => ReturnType<typeof getRemainingQuota>;

  // Reset / Refresh
  resetToDemoData: () => void;
  syncWithSupabase: () => Promise<void>;
}

/**
 * Helper to recursively collect all descendant category IDs
 */
function collectDescendantCategoryIds(categories: Category[], rootId: string): Set<string> {
  const ids = new Set<string>([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const cat of categories) {
      if (cat.parent_id && ids.has(cat.parent_id) && !ids.has(cat.id)) {
        ids.add(cat.id);
        added = true;
      }
    }
  }
  return ids;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme State
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(nextTheme);
      },

      // Auth & Profile State
      user: isSupabaseConfigured ? null : { id: DEMO_USER_ID, email: 'demo@ngernmee.local' },
      profile: isSupabaseConfigured ? null : DEMO_PROFILE,
      isDemoMode: !isSupabaseConfigured,
      isLoading: false,

      setUser: (user, profile) => {
        if (user) {
          const currentUser = get().user;
          const isSameUser = currentUser?.id === user.id;

          if (isSameUser) {
            // Same user re-authenticating (e.g. session refreshed) — preserve state but update identity
            set((state) => ({
              user,
              profile: profile !== undefined ? profile : state.profile,
              isDemoMode: false,
            }));
          } else {
            // New user login — reset with clear state until syncWithSupabase populates database records
            set({
              user,
              profile: profile ?? null,
              isDemoMode: false,
              categories: createInitialCategories(user.id),
              transactions: [],
              taxConfig: createInitialTaxConfig(user.id),
            });
          }
        } else {
          // Sign-out: reset to clean unauthenticated state
          const demoCats = createInitialCategories(DEMO_USER_ID);
          set({
            user: null,
            profile: null,
            isDemoMode: false,
            categories: demoCats,
            transactions: [],
            taxConfig: createInitialTaxConfig(DEMO_USER_ID),
          });
        }
      },

      setDemoMode: (enabled) => {
        if (enabled) {
          const initialCats = createInitialCategories(DEMO_USER_ID);
          const initialTxs = createInitialTransactions(DEMO_USER_ID, initialCats);
          const initialTax = createInitialTaxConfig(DEMO_USER_ID);
          set({
            isDemoMode: true,
            user: { id: DEMO_USER_ID, email: 'demo@ngernmee.local' },
            profile: DEMO_PROFILE,
            categories: initialCats,
            transactions: initialTxs,
            taxConfig: initialTax,
          });
        } else {
          const demoCats = createInitialCategories(DEMO_USER_ID);
          set({
            isDemoMode: false,
            user: null,
            profile: null,
            categories: demoCats,
            transactions: [],
            taxConfig: createInitialTaxConfig(DEMO_USER_ID),
          });
        }
      },

      updateProfile: async (displayName: string) => {
        const currentUserId = get().user?.id;
        if (isSupabaseConfigured && !get().isDemoMode && currentUserId) {
          try {
            // Use upsert to guarantee the profile row is created even if signup trigger didn't fire
            const { error } = await supabase
              .from('profiles')
              .upsert({
                id: currentUserId,
                display_name: displayName,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });

            if (error) {
              console.error('Supabase update profile error:', error);
              throw error;
            }

            // Also update Supabase auth metadata so session and auth user stay synchronized
            await supabase.auth.updateUser({
              data: { display_name: displayName },
            });
          } catch (e) {
            console.error('Supabase update profile failed:', e);
            throw e;
          }
        }
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, display_name: displayName, updated_at: new Date().toISOString() }
            : {
                id: currentUserId || DEMO_USER_ID,
                display_name: displayName,
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
        }));
      },

      signOut: async () => {
        if (isSupabaseConfigured) {
          await supabase.auth.signOut();
        }
        const demoCats = createInitialCategories(DEMO_USER_ID);
        set({
          user: null,
          profile: null,
          isDemoMode: false,
          categories: demoCats,
          transactions: [],
          taxConfig: createInitialTaxConfig(DEMO_USER_ID),
        });
      },

      // Categories
      categories: createInitialCategories(DEMO_USER_ID),
      setCategories: (categories) => set({ categories }),

      addCategory: async (categoryData) => {
        const currentUserId = get().user?.id || DEMO_USER_ID;
        const newCat: Category = {
          ...categoryData,
          id: generateId(),
          user_id: currentUserId,
          created_at: new Date().toISOString(),
        };

        if (isSupabaseConfigured && !get().isDemoMode) {
          try {
            const { data, error } = await supabase.from('categories').insert(newCat).select().single();
            if (error) {
              console.error('Supabase add category error:', error);
              throw error;
            }
            if (data) {
              set((state) => ({ categories: [...state.categories, data] }));
              return data;
            }
          } catch (e) {
            console.error('Supabase add category failed:', e);
            throw e;
          }
        }

        set((state) => ({ categories: [...state.categories, newCat] }));
        return newCat;
      },

      updateCategory: async (id, updates) => {
        if (isSupabaseConfigured && !get().isDemoMode) {
          try {
            const { error } = await supabase.from('categories').update(updates).eq('id', id);
            if (error) {
              console.error('Supabase update category error:', error);
              throw error;
            }
          } catch (e) {
            console.error('Supabase update category error:', e);
            throw e;
          }
        }
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCategory: async (id) => {
        const idsToDelete = collectDescendantCategoryIds(get().categories, id);
        const idsArray = Array.from(idsToDelete);

        if (isSupabaseConfigured && !get().isDemoMode) {
          try {
            const { error } = await supabase.from('categories').delete().in('id', idsArray);
            if (error) {
              console.error('Supabase delete category error:', error);
              throw error;
            }
          } catch (e) {
            console.error('Supabase delete category error:', e);
            throw e;
          }
        }
        set((state) => ({
          // Delete node and all its descendants
          categories: state.categories.filter((c) => !idsToDelete.has(c.id)),
        }));
      },

      initializeDefaultCategories: async (force = false) => {
        const uid = get().user?.id || DEMO_USER_ID;
        const currentCats = get().categories;

        if (!force && currentCats.length >= 30) {
          return;
        }

        if (isSupabaseConfigured && !get().isDemoMode && uid !== DEMO_USER_ID) {
          try {
            await supabase.rpc('initialize_my_categories');
            const { data: dbCats, error } = await supabase
              .from('categories')
              .select('*')
              .eq('user_id', uid)
              .order('sort_order');
            if (!error && dbCats && dbCats.length > 0) {
              set({ categories: dbCats });
              return;
            }
          } catch (e) {
            console.error('Failed to initialize categories from Supabase RPC:', e);
          }
        }

        // Fallback / local / demo population
        const defaultCats = createInitialCategories(uid);
        set({ categories: defaultCats });
      },

      // Transactions
      transactions: createInitialTransactions(DEMO_USER_ID, createInitialCategories(DEMO_USER_ID)),
      setTransactions: (transactions) => set({ transactions }),

      addTransaction: async (txData) => {
        const currentUserId = get().user?.id || DEMO_USER_ID;
        const now = new Date().toISOString();

        // Calculate Thai Chuay Thai discount if enabled
        let discount = txData.thai_chuay_thai_discount || 0;
        let net = txData.net_amount;

        if (txData.is_thai_chuay_thai && txData.type === 'expense') {
          const dailyUsed = getDailyUsage(get().transactions, txData.transaction_date);
          const monthlyUsed = getMonthlyUsage(get().transactions, txData.transaction_date);
          const calc = calculateDiscount(txData.amount, dailyUsed, monthlyUsed);
          discount = calc.effectiveDiscount;
          net = calc.netAmount;
        }

        const newTx: Transaction = {
          ...txData,
          id: generateId(),
          user_id: currentUserId,
          thai_chuay_thai_discount: discount,
          net_amount: net,
          created_at: now,
          updated_at: now,
        };

        if (isSupabaseConfigured && !get().isDemoMode) {
          try {
            const { data, error } = await supabase.from('transactions').insert(newTx).select().single();
            if (error) {
              console.error('Supabase add transaction error:', error);
              throw error;
            }
            if (data) {
              set((state) => ({ transactions: [data, ...state.transactions] }));
              return data;
            }
          } catch (e) {
            console.error('Supabase add transaction error:', e);
            throw e;
          }
        }

        set((state) => ({ transactions: [newTx, ...state.transactions] }));
        return newTx;
      },

      updateTransaction: async (id, updates) => {
        const updatePayload = { ...updates, updated_at: new Date().toISOString() };
        if (isSupabaseConfigured && !get().isDemoMode) {
          try {
            const { error } = await supabase.from('transactions').update(updatePayload).eq('id', id);
            if (error) {
              console.error('Supabase update transaction error:', error);
              throw error;
            }
          } catch (e) {
            console.error('Supabase update transaction error:', e);
            throw e;
          }
        }
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updatePayload } : tx
          ),
        }));
      },

      deleteTransaction: async (id) => {
        if (isSupabaseConfigured && !get().isDemoMode) {
          try {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) {
              console.error('Supabase delete transaction error:', error);
              throw error;
            }
          } catch (e) {
            console.error('Supabase delete transaction error:', e);
            throw e;
          }
        }
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      // Tax Configuration
      taxConfig: createInitialTaxConfig(DEMO_USER_ID),

      updateTaxConfig: async (updates) => {
        const updatedConfig = { ...get().taxConfig, ...updates, updated_at: new Date().toISOString() };
        if (isSupabaseConfigured && !get().isDemoMode) {
          try {
            const { error } = await supabase
              .from('tax_configs')
              .upsert(updatedConfig, { onConflict: 'user_id,tax_year' });
            if (error) {
              console.error('Supabase update tax config error:', error);
              throw error;
            }
          } catch (e) {
            console.error('Supabase update tax config error:', e);
            throw e;
          }
        }
        set({ taxConfig: updatedConfig });
      },

      getTaxCalculation: (overrideGrossIncome?: number) => {
        const { taxConfig, transactions } = get();
        let grossIncome: number;
        if (typeof overrideGrossIncome === 'number') {
          grossIncome = overrideGrossIncome;
        } else {
          // Calculate annual salary: prefer transaction salary sum if present, otherwise configured annual salary
          const salaryTransactionsSum = transactions
            .filter((tx) => tx.type === 'income' && tx.is_salary && tx.transaction_date.startsWith(String(taxConfig.tax_year)))
            .reduce((sum, tx) => sum + tx.amount, 0);

          grossIncome = salaryTransactionsSum > 0 ? salaryTransactionsSum : taxConfig.annual_salary;
        }
        return calculateTax(grossIncome, taxConfig.additional_deductions, taxConfig.tax_year);
      },

      getThaiChuayThaiStatus: (dateStr?: string, pendingAmount: number = 0) => {
        const targetDate = dateStr || new Date().toISOString().slice(0, 10);
        const { transactions } = get();
        const dailyUsed = getDailyUsage(transactions, targetDate);
        const monthlyUsed = getMonthlyUsage(transactions, targetDate);
        return getRemainingQuota(dailyUsed, monthlyUsed, pendingAmount);
      },

      resetToDemoData: () => {
        const cats = createInitialCategories(DEMO_USER_ID);
        const txs = createInitialTransactions(DEMO_USER_ID, cats);
        const tax = createInitialTaxConfig(DEMO_USER_ID);
        set({
          categories: cats,
          transactions: txs,
          taxConfig: tax,
          isDemoMode: true,
          profile: DEMO_PROFILE,
        });
      },

      syncWithSupabase: async () => {
        if (!isSupabaseConfigured) return;
        set({ isLoading: true });
        try {
          // Check local session first
          const sessionRes = await supabase.auth.getSession();
          const authUser = sessionRes.data?.session?.user;
          if (!authUser) {
            set({ isLoading: false });
            return;
          }

          const uid = authUser.id;

          // Ensure store is switched out of demo mode when real session is present
          set({
            isDemoMode: false,
            user: { id: uid, email: authUser.email || '' },
          });

          // Fetch profile using maybeSingle to avoid 406/PGRST116 errors if missing
          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .maybeSingle();

          if (profileError) {
            console.warn('Profile fetch note:', profileError.message);
          }

          // If profile row doesn't exist in Supabase yet, create it from auth metadata
          if (!profile) {
            const defaultName = authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'ผู้ใช้งาน';
            const newProfile: Profile = {
              id: uid,
              display_name: defaultName,
              avatar_url: authUser.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            try {
              await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' });
              profile = newProfile;
            } catch (e) {
              console.warn('Initial profile upsert note:', e);
              profile = newProfile;
            }
          }

          // Fetch categories
          let { data: cats, error: catsError } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', uid)
            .order('sort_order');
          if (catsError) {
            console.error('Error fetching categories from Supabase:', catsError);
          }

          // Auto-seed default categories if user has none or has partial categories (< 30)
          if (!cats || cats.length < 30) {
            try {
              await supabase.rpc('initialize_my_categories');
              // Re-fetch after seeding
              const { data: seededCats, error: seededError } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', uid)
                .order('sort_order');
              if (!seededError && seededCats && seededCats.length > 0) {
                cats = seededCats;
              }
            } catch (seedErr) {
              console.warn('Auto-seed categories failed (trigger may handle it):', seedErr);
            }
          }

          // Fetch transactions
          const { data: txs, error: txsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', uid)
            .order('transaction_date', { ascending: false });
          if (txsError) {
            console.error('Error fetching transactions from Supabase:', txsError);
          }

          // Fetch tax config
          const currentYear = new Date().getFullYear();
          let { data: tax, error: taxError } = await supabase
            .from('tax_configs')
            .select('*')
            .eq('user_id', uid)
            .eq('tax_year', currentYear)
            .maybeSingle();

          if (taxError) {
            console.warn('Tax config fetch note:', taxError.message);
          }

          if (!tax) {
            const initialTax = createInitialTaxConfig(uid);
            try {
              await supabase.from('tax_configs').upsert(initialTax, { onConflict: 'user_id,tax_year' });
              tax = initialTax;
            } catch (e) {
              console.warn('Initial tax config seed note:', e);
              tax = initialTax;
            }
          }

          const resolvedCats = (cats && cats.length > 0)
            ? cats
            : createInitialCategories(uid);

          // Authoritatively overwrite state from cloud database — never preserve stale data
          set({
            user: { id: uid, email: authUser.email || '' },
            profile: profile || null,
            isDemoMode: false,
            categories: resolvedCats,
            transactions: txs || [],
            taxConfig: tax || createInitialTaxConfig(uid),
          });
        } catch (e) {
          console.error('Error syncing with Supabase:', e);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'ngernmee-storage',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);
