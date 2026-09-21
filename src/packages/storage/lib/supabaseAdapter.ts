import type { Category, Profile, TaxConfig, Transaction } from '../../../lib/types';
import type { StorageAdapter } from './types';
import { supabase } from '../../../lib/supabase';

export class SupabaseStorageAdapter implements StorageAdapter {
  // Categories
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order');
    if (error) throw error;
    return data || [];
  }

  async saveCategory(category: Category): Promise<Category> {
    const { children, ...dbCat } = category;
    const { data, error } = await supabase.from('categories').insert(dbCat).select().single();
    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const { children, ...dbUpdates } = updates;
    const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id);
    if (error) throw error;
  }

  async deleteCategories(ids: string[]): Promise<void> {
    const { error } = await supabase.from('categories').delete().in('id', ids);
    if (error) throw error;
  }

  async seedDefaultCategories(userId: string): Promise<Category[]> {
    await supabase.rpc('initialize_my_categories');
    return this.getCategories(userId);
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      amount: Number(row.amount) || 0,
      net_amount: Number(row.net_amount) || 0,
      gross_amount: Number(row.gross_amount ?? row.amount) || 0,
      withholding_tax_rate: Number(row.withholding_tax_rate) || 0,
      withholding_tax_amount: Number(row.withholding_tax_amount) || 0,
      thai_chuay_thai_discount: Number(row.thai_chuay_thai_discount) || 0,
    }));
  }

  async saveTransaction(tx: Transaction): Promise<Transaction> {
    const dbPayload = {
      id: tx.id,
      user_id: tx.user_id,
      category_id: tx.category_id || null,
      type: tx.type,
      amount: Number(tx.amount) || 0,
      description: tx.description,
      transaction_date: tx.transaction_date,
      is_salary: Boolean(tx.is_salary),
      income_type: tx.type === 'income' ? tx.income_type || 'other' : null,
      gross_amount: Number(tx.gross_amount ?? tx.amount) || 0,
      withholding_tax_rate: Number(tx.withholding_tax_rate) || 0,
      withholding_tax_amount: Number(tx.withholding_tax_amount) || 0,
      is_thai_chuay_thai: Boolean(tx.is_thai_chuay_thai),
      thai_chuay_thai_discount: Number(tx.thai_chuay_thai_discount) || 0,
      net_amount: Number(tx.net_amount) || 0,
      metadata: tx.metadata || {},
      created_at: tx.created_at,
      updated_at: tx.updated_at,
    };

    const { data, error } = await supabase.from('transactions').insert(dbPayload).select().single();
    if (error) throw error;

    return {
      ...data,
      amount: Number(data.amount) || 0,
      net_amount: Number(data.net_amount) || 0,
      gross_amount: Number(data.gross_amount ?? data.amount) || 0,
      withholding_tax_rate: Number(data.withholding_tax_rate) || 0,
      withholding_tax_amount: Number(data.withholding_tax_amount) || 0,
      thai_chuay_thai_discount: Number(data.thai_chuay_thai_discount) || 0,
    };
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {
      updated_at: updates.updated_at || new Date().toISOString(),
    };
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.amount !== undefined) dbUpdates.amount = Number(updates.amount) || 0;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id || null;
    if (updates.transaction_date !== undefined)
      dbUpdates.transaction_date = updates.transaction_date;
    if (updates.is_salary !== undefined) dbUpdates.is_salary = Boolean(updates.is_salary);
    if (updates.income_type !== undefined) dbUpdates.income_type = updates.income_type;
    if (updates.gross_amount !== undefined)
      dbUpdates.gross_amount = Number(updates.gross_amount) || 0;
    if (updates.withholding_tax_rate !== undefined)
      dbUpdates.withholding_tax_rate = Number(updates.withholding_tax_rate) || 0;
    if (updates.withholding_tax_amount !== undefined)
      dbUpdates.withholding_tax_amount = Number(updates.withholding_tax_amount) || 0;
    if (updates.is_thai_chuay_thai !== undefined)
      dbUpdates.is_thai_chuay_thai = Boolean(updates.is_thai_chuay_thai);
    if (updates.thai_chuay_thai_discount !== undefined)
      dbUpdates.thai_chuay_thai_discount = Number(updates.thai_chuay_thai_discount) || 0;
    if (updates.net_amount !== undefined) dbUpdates.net_amount = Number(updates.net_amount) || 0;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

    const { error } = await supabase.from('transactions').update(dbUpdates).eq('id', id);
    if (error) throw error;
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  }

  // Tax Config
  async getTaxConfig(userId: string): Promise<TaxConfig | null> {
    const { data, error } = await supabase
      .from('tax_configs')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async saveTaxConfig(userId: string, config: TaxConfig): Promise<void> {
    const { error } = await supabase.from('tax_configs').upsert(
      {
        user_id: userId,
        tax_year: config.tax_year,
        annual_salary: config.annual_salary,
        monthly_salary: config.monthly_salary,
        personal_allowance: config.personal_allowance,
        expense_deduction: config.expense_deduction,
        social_security: config.social_security,
        additional_deductions: config.additional_deductions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (error) throw error;
  }

  // Profile
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (error) throw error;
  }
}
