// src/stores/useAppStore.ts
// Central state management for NgernMee Limited (Zustand)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Category, Profile, TaxCalculationResult, TaxConfig, Transaction } from '../lib/types';
import {
  createInitialCategories,
  createInitialTaxConfig,
  createInitialTransactions,
  DEMO_PROFILE,
  DEMO_USER_ID,
} from '../lib/mockData';
import {
  calculateDiscount,
  getDailyUsage,
  getMonthlyUsage,
  getRemainingQuota,
  evaluateLedgerCoPayQuota,
} from '../packages/transaction-draft';
import { calculateTax, classifyAnnualIncome } from '../packages/tax-engine';
import { generateId } from '../lib/utils';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getStorageAdapter } from '../packages/storage';

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
  authLoading: boolean;
  setAuthLoading: (loading: boolean) => void;
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
  addTransaction: (
    tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Tax Configuration
  taxConfig: TaxConfig;
  updateTaxConfig: (updates: Partial<TaxConfig>) => Promise<void>;
  getTaxCalculation: (overrideGrossIncome?: number) => TaxCalculationResult;

  // Thai Chuay Thai Quota helper
  getThaiChuayThaiStatus: (
    dateStr?: string,
    pendingAmount?: number
  ) => ReturnType<typeof getRemainingQuota>;

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

function isRealSupabaseUser(user: { id: string } | null | undefined): boolean {
  return Boolean(user && user.id && user.id !== DEMO_USER_ID);
}

const fallbackStorage = new Map<string, string>();

const safeStorage = createJSONStorage(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key: string) => fallbackStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      fallbackStorage.set(key, value);
    },
    removeItem: (key: string) => {
      fallbackStorage.delete(key);
    },
  };
});

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
      authLoading: isSupabaseConfigured,
      setAuthLoading: (authLoading) => set({ authLoading }),

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
        const currentUserId = get().user?.id || DEMO_USER_ID;
        const storage = getStorageAdapter(get().user, get().isDemoMode);
        try {
          await storage.updateProfile(currentUserId, { display_name: displayName });
          if (isSupabaseConfigured && !get().isDemoMode && isRealSupabaseUser(get().user)) {
            await supabase.auth
              .updateUser({
                data: { display_name: displayName },
              })
              .catch(console.warn);
          }
        } catch (e) {
          console.warn('Storage update profile note:', e);
        }
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, display_name: displayName, updated_at: new Date().toISOString() }
            : {
                id: currentUserId,
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
        const storage = getStorageAdapter(get().user, get().isDemoMode);
        try {
          const saved = await storage.saveCategory(newCat);
          if (saved) {
            set((state) => ({ categories: [...state.categories, saved] }));
            return saved;
          }
        } catch (e) {
          console.warn('Storage add category note, falling back to local state:', e);
        }
        set((state) => ({ categories: [...state.categories, newCat] }));
        return newCat;
      },

      updateCategory: async (id, updates) => {
        const storage = getStorageAdapter(get().user, get().isDemoMode);
        try {
          await storage.updateCategory(id, updates);
        } catch (e) {
          console.warn('Storage update category note:', e);
        }
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCategory: async (id) => {
        const idsToDelete = collectDescendantCategoryIds(get().categories, id);
        const idsArray = Array.from(idsToDelete);
        const storage = getStorageAdapter(get().user, get().isDemoMode);
        try {
          await storage.deleteCategories(idsArray);
        } catch (e) {
          console.warn('Storage delete category note:', e);
        }
        set((state) => ({
          categories: state.categories.filter((c) => !idsToDelete.has(c.id)),
        }));
      },

      initializeDefaultCategories: async (force = false) => {
        const uid = get().user?.id || DEMO_USER_ID;
        const currentCats = get().categories;

        if (!force && currentCats.length >= 30) {
          return;
        }

        const storage = getStorageAdapter(get().user, get().isDemoMode);
        if (storage.seedDefaultCategories && uid !== DEMO_USER_ID) {
          try {
            const dbCats = await storage.seedDefaultCategories(uid);
            if (dbCats && dbCats.length > 0) {
              set({ categories: dbCats });
              return;
            }
          } catch (e) {
            console.warn('Storage seed categories note, falling back to local defaults:', e);
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
          category_id: txData.category_id || null,
          thai_chuay_thai_discount: discount,
          net_amount: net,
          created_at: now,
          updated_at: now,
        };

        const storage = getStorageAdapter(get().user, get().isDemoMode);
        try {
          const saved = await storage.saveTransaction(newTx);
          if (saved) {
            set((state) => ({ transactions: [saved, ...state.transactions] }));
            return saved;
          }
        } catch (e) {
          console.warn('Storage add transaction note, falling back to local state:', e);
        }

        set((state) => ({ transactions: [newTx, ...state.transactions] }));
        return newTx;
      },

      updateTransaction: async (id, updates) => {
        const updatePayload: Partial<Transaction> = {
          ...updates,
          category_id: updates.category_id !== undefined ? updates.category_id || null : undefined,
          updated_at: new Date().toISOString(),
        };

        const storage = getStorageAdapter(get().user, get().isDemoMode);
        try {
          await storage.updateTransaction(id, updatePayload);
        } catch (e) {
          console.warn('Storage update transaction note:', e);
        }

        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updatePayload } : tx
          ),
        }));
      },

      deleteTransaction: async (id) => {
        const storage = getStorageAdapter(get().user, get().isDemoMode);
        try {
          await storage.deleteTransaction(id);
        } catch (e) {
          console.warn('Storage delete transaction note:', e);
        }

        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      // Tax Configuration
      taxConfig: createInitialTaxConfig(DEMO_USER_ID),

      updateTaxConfig: async (updates) => {
        const currentUserId = get().user?.id || DEMO_USER_ID;
        const updatedConfig = {
          ...get().taxConfig,
          ...updates,
          user_id: currentUserId,
          updated_at: new Date().toISOString(),
        };
        const storage = getStorageAdapter(get().user, get().isDemoMode);
        try {
          await storage.saveTaxConfig(currentUserId, updatedConfig);
        } catch (e) {
          console.warn('Storage save tax config note:', e);
        }
        set({ taxConfig: updatedConfig });
      },

      getTaxCalculation: (overrideGrossIncome?: number) => {
        const { taxConfig, transactions } = get();
        if (typeof overrideGrossIncome === 'number') {
          return calculateTax(
            overrideGrossIncome,
            taxConfig.additional_deductions,
            taxConfig.tax_year
          );
        }

        const classified = classifyAnnualIncome(transactions, taxConfig.tax_year);

        // If no transactions logged yet, fallback to taxConfig.annual_salary
        if (
          classified.salary40_1 === 0 &&
          classified.freelance40_2 === 0 &&
          classified.otherTaxable === 0 &&
          taxConfig.annual_salary > 0
        ) {
          classified.salary40_1 = taxConfig.annual_salary;
        }

        return calculateTax(classified, taxConfig.additional_deductions, taxConfig.tax_year);
      },

      getThaiChuayThaiStatus: (dateStr?: string, pendingAmount: number = 0) => {
        const targetDate = dateStr || new Date().toISOString().slice(0, 10);
        return evaluateLedgerCoPayQuota(get().transactions, targetDate, pendingAmount);
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
            const defaultName =
              authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'ผู้ใช้งาน';
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
              await supabase
                .from('tax_configs')
                .upsert(initialTax, { onConflict: 'user_id,tax_year' });
              tax = initialTax;
            } catch (e) {
              console.warn('Initial tax config seed note:', e);
              tax = initialTax;
            }
          }

          const resolvedCats = cats && cats.length > 0 ? cats : createInitialCategories(uid);

          let finalTax = tax || createInitialTaxConfig(uid);
          if (finalTax) {
            finalTax = {
              ...finalTax,
              user_id: uid,
              monthly_salary: Number(finalTax.monthly_salary) || 0,
              annual_salary: Number(finalTax.annual_salary) || 0,
              personal_allowance: Number(finalTax.personal_allowance) || 60000,
              expense_deduction: Number(finalTax.expense_deduction) || 100000,
              social_security: Number(finalTax.social_security) || 9000,
            };
          }

          const parsedTxs: Transaction[] = (txs || []).map((t) => ({
            ...t,
            amount: Number(t.amount) || 0,
            net_amount: Number(t.net_amount) || 0,
            gross_amount: Number(t.gross_amount ?? t.amount) || 0,
            withholding_tax_rate: Number(t.withholding_tax_rate) || 0,
            withholding_tax_amount: Number(t.withholding_tax_amount) || 0,
            thai_chuay_thai_discount: Number(t.thai_chuay_thai_discount) || 0,
          }));

          // Authoritatively overwrite state from cloud database — never preserve stale data
          set({
            user: { id: uid, email: authUser.email || '' },
            profile: profile || null,
            isDemoMode: false,
            categories: resolvedCats,
            transactions: parsedTxs,
            taxConfig: finalTax,
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
      storage: safeStorage,
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

// Cross-tab and prototype sync listener via Storage Seam
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'ngernmee-storage' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.state?.transactions) {
          useAppStore.setState((prev) => ({
            ...prev,
            transactions: parsed.state.transactions,
            categories: parsed.state.categories || prev.categories,
            theme: parsed.state.theme || prev.theme,
          }));
        }
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
    }
  });
}
