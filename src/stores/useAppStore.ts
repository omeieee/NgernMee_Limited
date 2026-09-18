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
      user: { id: DEMO_USER_ID, email: 'demo@ngernmee.local' },
      profile: DEMO_PROFILE,
      isDemoMode: true,
      isLoading: false,

      setUser: (user, profile) => {
        if (user) {
          // Real login: clear all demo/stale data so Supabase sync starts from a clean slate.
          // syncWithSupabase() will fill in the real profile, categories, transactions, and taxConfig.
          set({
            user,
            profile: profile || null,
            isDemoMode: false,
            categories: [],
            transactions: [],
            taxConfig: createInitialTaxConfig(user.id),
          });
        } else {
          // Sign-out: clear everything
          set({ user: null, profile: null, isDemoMode: false });
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
          set({ isDemoMode: false });
        }
      },

      updateProfile: async (displayName: string) => {
        const currentUserId = get().user?.id;
        if (isSupabaseConfigured && !get().isDemoMode && currentUserId) {
          try {
            const { error } = await supabase
              .from('profiles')
              .update({ display_name: displayName, updated_at: new Date().toISOString() })
              .eq('id', currentUserId);
            if (error) {
              console.error('Supabase update profile error:', error);
              throw error;
            }
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
        set({
          user: null,
          profile: null,
          isDemoMode: false,
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
            const { error } = await supabase.from('tax_configs').upsert(updatedConfig);
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
        if (!isSupabaseConfigured || get().isDemoMode) return;
        set({ isLoading: true });
        try {
          const userRes = await supabase.auth.getUser();
          const authUser = userRes.data?.user;
          if (authUser) {
            const uid = authUser.id;

            // Fetch profile
            const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', uid).single();
            if (profileError && profileError.code !== 'PGRST116') {
              console.warn('Profile fetch note:', profileError.message);
            }

            // Fetch categories
            let { data: cats, error: catsError } = await supabase.from('categories').select('*').eq('user_id', uid).order('sort_order');
            if (catsError) {
              console.error('Error fetching categories from Supabase:', catsError);
              throw catsError;
            }

            // Auto-seed default categories if user has none
            if (!cats || cats.length === 0) {
              try {
                await supabase.rpc('initialize_my_categories');
                // Re-fetch after seeding
                const { data: seededCats, error: seededError } = await supabase.from('categories').select('*').eq('user_id', uid).order('sort_order');
                if (!seededError && seededCats) {
                  cats = seededCats;
                }
              } catch (seedErr) {
                console.warn('Auto-seed categories failed (trigger may handle it):', seedErr);
              }
            }

            // Fetch transactions
            const { data: txs, error: txsError } = await supabase.from('transactions').select('*').eq('user_id', uid).order('transaction_date', { ascending: false });
            if (txsError) {
              console.error('Error fetching transactions from Supabase:', txsError);
              throw txsError;
            }

            // Fetch tax config
            const currentYear = new Date().getFullYear();
            const { data: tax, error: taxError } = await supabase.from('tax_configs').select('*').eq('user_id', uid).eq('tax_year', currentYear).single();
            if (taxError && taxError.code !== 'PGRST116') {
              console.warn('Tax config fetch note:', taxError.message);
            }

            set((state) => ({
              user: { id: uid, email: authUser.email || '' },
              profile: profile || state.profile,
              categories: cats ?? state.categories,
              transactions: txs ?? state.transactions,
              taxConfig: tax ?? state.taxConfig,
            }));
          }
        } catch (e) {
          console.error('Error syncing with Supabase:', e);
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'ngernmee-storage',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        profile: state.profile,
        isDemoMode: state.isDemoMode,
        categories: state.categories,
        transactions: state.transactions,
        taxConfig: state.taxConfig,
      }),
    }
  )
);
