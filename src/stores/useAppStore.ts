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

function isRealSupabaseUser(user: { id: string } | null | undefined): boolean {
  return Boolean(user && user.id && user.id !== DEMO_USER_ID);
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
        const currentUserId = get().user?.id;
        const isRealUser = isRealSupabaseUser(get().user);
        if (isSupabaseConfigured && !get().isDemoMode && isRealUser && currentUserId) {
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
              console.warn('Supabase update profile error, falling back to local state:', error);
            }

            // Also update Supabase auth metadata so session and auth user stay synchronized
            await supabase.auth.updateUser({
              data: { display_name: displayName },
            }).catch(console.warn);
          } catch (e) {
            console.warn('Supabase update profile failed, falling back to local state:', e);
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

        const isRealUser = isRealSupabaseUser(get().user);

        if (isSupabaseConfigured && !get().isDemoMode && isRealUser) {
          try {
            const { children, ...dbCat } = newCat;
            const { data, error } = await supabase.from('categories').insert(dbCat).select().single();
            if (error) {
              console.warn('Supabase add category error, falling back to local state:', error);
            } else if (data) {
              set((state) => ({ categories: [...state.categories, data] }));
              return data;
            }
          } catch (e) {
            console.warn('Supabase add category failed, falling back to local state:', e);
          }
        }

        set((state) => ({ categories: [...state.categories, newCat] }));
        return newCat;
      },

      updateCategory: async (id, updates) => {
        const isRealUser = isRealSupabaseUser(get().user);
        if (isSupabaseConfigured && !get().isDemoMode && isRealUser) {
          try {
            const { children, ...dbUpdates } = updates;
            const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id);
            if (error) {
              console.warn('Supabase update category error, falling back to local state:', error);
            }
          } catch (e) {
            console.warn('Supabase update category failed, falling back to local state:', e);
          }
        }
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCategory: async (id) => {
        const idsToDelete = collectDescendantCategoryIds(get().categories, id);
        const idsArray = Array.from(idsToDelete);
        const isRealUser = isRealSupabaseUser(get().user);

        if (isSupabaseConfigured && !get().isDemoMode && isRealUser) {
          try {
            const { error } = await supabase.from('categories').delete().in('id', idsArray);
            if (error) {
              console.warn('Supabase delete category error, falling back to local state:', error);
            }
          } catch (e) {
            console.warn('Supabase delete category failed, falling back to local state:', e);
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
          category_id: txData.category_id || null,
          thai_chuay_thai_discount: discount,
          net_amount: net,
          created_at: now,
          updated_at: now,
        };

        const isRealUser = isRealSupabaseUser(get().user);

        if (isSupabaseConfigured && !get().isDemoMode && isRealUser) {
          try {
            const dbPayload = {
              id: newTx.id,
              user_id: newTx.user_id,
              category_id: newTx.category_id || null,
              type: newTx.type,
              amount: Number(newTx.amount) || 0,
              description: newTx.description,
              transaction_date: newTx.transaction_date,
              is_salary: Boolean(newTx.is_salary),
              income_type: newTx.type === 'income' ? (newTx.income_type || 'other') : null,
              gross_amount: Number(newTx.gross_amount ?? newTx.amount) || 0,
              withholding_tax_rate: Number(newTx.withholding_tax_rate) || 0,
              withholding_tax_amount: Number(newTx.withholding_tax_amount) || 0,
              is_thai_chuay_thai: Boolean(newTx.is_thai_chuay_thai),
              thai_chuay_thai_discount: Number(newTx.thai_chuay_thai_discount) || 0,
              net_amount: Number(newTx.net_amount) || 0,
              metadata: newTx.metadata || {},
              created_at: newTx.created_at,
              updated_at: newTx.updated_at,
            };

            const { data, error } = await supabase.from('transactions').insert(dbPayload).select().single();
            if (error) {
              console.warn('Supabase add transaction error, falling back to local store:', error);
            } else if (data) {
              const formattedRow: Transaction = {
                ...data,
                amount: Number(data.amount) || 0,
                net_amount: Number(data.net_amount) || 0,
                gross_amount: Number(data.gross_amount ?? data.amount) || 0,
                withholding_tax_rate: Number(data.withholding_tax_rate) || 0,
                withholding_tax_amount: Number(data.withholding_tax_amount) || 0,
                thai_chuay_thai_discount: Number(data.thai_chuay_thai_discount) || 0,
              };
              set((state) => ({ transactions: [formattedRow, ...state.transactions] }));
              return formattedRow;
            }
          } catch (e) {
            console.warn('Supabase add transaction failed, falling back to local store:', e);
          }
        }

        set((state) => ({ transactions: [newTx, ...state.transactions] }));
        return newTx;
      },

      updateTransaction: async (id, updates) => {
        const updatePayload: Partial<Transaction> = {
          ...updates,
          category_id: updates.category_id !== undefined ? (updates.category_id || null) : undefined,
          updated_at: new Date().toISOString(),
        };

        const isRealUser = isRealSupabaseUser(get().user);

        if (isSupabaseConfigured && !get().isDemoMode && isRealUser) {
          try {
            const dbUpdates: Record<string, unknown> = {
              updated_at: updatePayload.updated_at,
            };
            if (updates.type !== undefined) dbUpdates.type = updates.type;
            if (updates.amount !== undefined) dbUpdates.amount = Number(updates.amount);
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id || null;
            if (updates.transaction_date !== undefined) dbUpdates.transaction_date = updates.transaction_date;
            if (updates.is_salary !== undefined) dbUpdates.is_salary = Boolean(updates.is_salary);
            if (updates.income_type !== undefined) dbUpdates.income_type = updates.type === 'income' ? updates.income_type : null;
            if (updates.gross_amount !== undefined) dbUpdates.gross_amount = Number(updates.gross_amount);
            if (updates.withholding_tax_rate !== undefined) dbUpdates.withholding_tax_rate = Number(updates.withholding_tax_rate);
            if (updates.withholding_tax_amount !== undefined) dbUpdates.withholding_tax_amount = Number(updates.withholding_tax_amount);
            if (updates.is_thai_chuay_thai !== undefined) dbUpdates.is_thai_chuay_thai = Boolean(updates.is_thai_chuay_thai);
            if (updates.thai_chuay_thai_discount !== undefined) dbUpdates.thai_chuay_thai_discount = Number(updates.thai_chuay_thai_discount);
            if (updates.net_amount !== undefined) dbUpdates.net_amount = Number(updates.net_amount);
            if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

            const { error } = await supabase.from('transactions').update(dbUpdates).eq('id', id);
            if (error) {
              console.warn('Supabase update transaction error, falling back to local store:', error);
            }
          } catch (e) {
            console.warn('Supabase update transaction failed, falling back to local store:', e);
          }
        }

        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updatePayload } : tx
          ),
        }));
      },

      deleteTransaction: async (id) => {
        const isRealUser = isRealSupabaseUser(get().user);

        if (isSupabaseConfigured && !get().isDemoMode && isRealUser) {
          try {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) {
              console.warn('Supabase delete transaction error, falling back to local store:', error);
            }
          } catch (e) {
            console.warn('Supabase delete transaction failed, falling back to local store:', e);
          }
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
        const isRealUser = isRealSupabaseUser(get().user);
        if (isSupabaseConfigured && !get().isDemoMode && isRealUser) {
          try {
            const { error } = await supabase
              .from('tax_configs')
              .upsert(updatedConfig, { onConflict: 'user_id,tax_year' });
            if (error) {
              console.warn('Supabase update tax config error, falling back to local store:', error);
            }
          } catch (e) {
            console.warn('Supabase update tax config failed, falling back to local store:', e);
          }
        }
        set({ taxConfig: updatedConfig });
      },

      getTaxCalculation: (overrideGrossIncome?: number) => {
        const { taxConfig, transactions } = get();
        if (typeof overrideGrossIncome === 'number') {
          return calculateTax(overrideGrossIncome, taxConfig.additional_deductions, taxConfig.tax_year);
        }

        const yearStr = String(taxConfig.tax_year);
        const yearTxs = transactions.filter(
          (tx) => tx.type === 'income' && tx.transaction_date.startsWith(yearStr)
        );

        let salary40_1 = 0;
        let freelance40_2 = 0;
        let allowanceExempt = 0;
        let scholarshipExempt = 0;
        let otherTaxable = 0;
        let withholdingTaxTotal = 0;

        for (const tx of yearTxs) {
          const wht = tx.withholding_tax_amount || 0;
          withholdingTaxTotal += wht;

          // Differentiate by income_type
          if (tx.income_type === 'freelance_part_time') {
            freelance40_2 += tx.gross_amount || (tx.net_amount + wht);
          } else if (tx.income_type === 'allowance') {
            allowanceExempt += tx.net_amount;
          } else if (tx.income_type === 'scholarship') {
            scholarshipExempt += tx.net_amount;
          } else if (tx.income_type === 'salary' || tx.is_salary) {
            salary40_1 += tx.gross_amount || tx.amount;
          } else {
            // Check fallback keywords if not explicitly tagged
            const desc = tx.description.toLowerCase();
            if (desc.includes('แม่') || desc.includes('พ่อ') || desc.includes('ค่าขนม') || desc.includes('ครอบครัว')) {
              allowanceExempt += tx.net_amount;
            } else if (desc.includes('พาร์ทไทม์') || desc.includes('ฟรีแลนซ์') || desc.includes('สอนพิเศษ')) {
              freelance40_2 += tx.gross_amount || (tx.net_amount + wht);
            } else {
              otherTaxable += tx.gross_amount || tx.amount;
            }
          }
        }

        // If no transactions logged yet, fallback to taxConfig.annual_salary
        if (salary40_1 === 0 && freelance40_2 === 0 && otherTaxable === 0 && taxConfig.annual_salary > 0) {
          salary40_1 = taxConfig.annual_salary;
        }

        return calculateTax(
          {
            salary40_1,
            freelance40_2,
            allowanceExempt,
            scholarshipExempt,
            otherTaxable,
            withholdingTaxTotal,
          },
          taxConfig.additional_deductions,
          taxConfig.tax_year
        );
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
