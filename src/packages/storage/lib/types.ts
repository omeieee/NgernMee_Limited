import type { Category, Profile, TaxConfig, Transaction } from '../../../lib/types';

export interface StorageAdapter {
  // Categories
  getCategories(userId: string): Promise<Category[]>;
  saveCategory(category: Category): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<void>;
  deleteCategories(ids: string[]): Promise<void>;
  seedDefaultCategories?(userId: string): Promise<Category[]>;

  // Transactions
  getTransactions(userId: string): Promise<Transaction[]>;
  saveTransaction(transaction: Transaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<void>;
  deleteTransaction(id: string): Promise<void>;

  // Tax Config
  getTaxConfig(userId: string): Promise<TaxConfig | null>;
  saveTaxConfig(userId: string, config: TaxConfig): Promise<void>;

  // Profile
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<void>;
}
