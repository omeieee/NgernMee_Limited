import type { Category, Profile, TaxConfig, Transaction } from '../../../lib/types';
import type { StorageAdapter } from './types';

export class LocalStorageAdapter implements StorageAdapter {
  private memStorage = new Map<string, string>();

  private getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return this.memStorage.get(key) ?? null;
  }

  private setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      this.memStorage.set(key, value);
    }
  }

  private getAllKeys(): string[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      return Object.keys(window.localStorage);
    }
    return Array.from(this.memStorage.keys());
  }

  // Categories
  async getCategories(userId: string): Promise<Category[]> {
    const raw = this.getItem(`ngernmee_${userId}_categories`);
    return raw ? JSON.parse(raw) : [];
  }

  async saveCategory(category: Category): Promise<Category> {
    const list = await this.getCategories(category.user_id);
    const existingIndex = list.findIndex((c) => c.id === category.id);
    if (existingIndex >= 0) {
      list[existingIndex] = category;
    } else {
      list.push(category);
    }
    this.setItem(`ngernmee_${category.user_id}_categories`, JSON.stringify(list));
    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    for (const key of this.getAllKeys()) {
      if (key.startsWith('ngernmee_') && key.endsWith('_categories')) {
        const raw = this.getItem(key);
        if (!raw) continue;
        try {
          const list: Category[] = JSON.parse(raw);
          const index = list.findIndex((c) => c.id === id);
          if (index >= 0) {
            list[index] = { ...list[index], ...updates };
            this.setItem(key, JSON.stringify(list));
            return;
          }
        } catch {
          // ignore corrupted json
        }
      }
    }
  }

  async deleteCategories(ids: string[]): Promise<void> {
    const idSet = new Set(ids);
    for (const key of this.getAllKeys()) {
      if (key.startsWith('ngernmee_') && key.endsWith('_categories')) {
        const raw = this.getItem(key);
        if (!raw) continue;
        try {
          const list: Category[] = JSON.parse(raw);
          const filtered = list.filter((c) => !idSet.has(c.id));
          if (filtered.length !== list.length) {
            this.setItem(key, JSON.stringify(filtered));
          }
        } catch {
          // ignore corrupted json
        }
      }
    }
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    const raw = this.getItem(`ngernmee_${userId}_transactions`);
    return raw ? JSON.parse(raw) : [];
  }

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    const list = await this.getTransactions(transaction.user_id);
    const existingIndex = list.findIndex((t) => t.id === transaction.id);
    if (existingIndex >= 0) {
      list[existingIndex] = transaction;
    } else {
      list.unshift(transaction);
    }
    this.setItem(`ngernmee_${transaction.user_id}_transactions`, JSON.stringify(list));
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    for (const key of this.getAllKeys()) {
      if (key.startsWith('ngernmee_') && key.endsWith('_transactions')) {
        const raw = this.getItem(key);
        if (!raw) continue;
        try {
          const list: Transaction[] = JSON.parse(raw);
          const index = list.findIndex((t) => t.id === id);
          if (index >= 0) {
            list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
            this.setItem(key, JSON.stringify(list));
            return;
          }
        } catch {
          // ignore corrupted json
        }
      }
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    for (const key of this.getAllKeys()) {
      if (key.startsWith('ngernmee_') && key.endsWith('_transactions')) {
        const raw = this.getItem(key);
        if (!raw) continue;
        try {
          const list: Transaction[] = JSON.parse(raw);
          const filtered = list.filter((t) => t.id !== id);
          if (filtered.length !== list.length) {
            this.setItem(key, JSON.stringify(filtered));
            return;
          }
        } catch {
          // ignore corrupted json
        }
      }
    }
  }

  // Tax Config
  async getTaxConfig(userId: string): Promise<TaxConfig | null> {
    const raw = this.getItem(`ngernmee_${userId}_tax_config`);
    return raw ? JSON.parse(raw) : null;
  }

  async saveTaxConfig(userId: string, config: TaxConfig): Promise<void> {
    this.setItem(`ngernmee_${userId}_tax_config`, JSON.stringify(config));
  }

  // Profile
  async getProfile(userId: string): Promise<Profile | null> {
    const raw = this.getItem(`ngernmee_${userId}_profile`);
    return raw ? JSON.parse(raw) : null;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    const current: Profile = (await this.getProfile(userId)) || {
      id: userId,
      display_name: 'Demo User',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    this.setItem(`ngernmee_${userId}_profile`, JSON.stringify(updated));
  }
}
