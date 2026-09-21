import { describe, it, expect } from 'vitest';
import { getStorageAdapter, LocalStorageAdapter } from '../index';
import type { Transaction, TaxConfig } from '../../../lib/types';

describe('Storage Package Seam', () => {
  it('resolves LocalStorageAdapter for demo user or unauthenticated mode', () => {
    const adapter = getStorageAdapter({ id: 'demo_user_00000000' }, true);
    expect(adapter).toBeInstanceOf(LocalStorageAdapter);

    const guestAdapter = getStorageAdapter(null, true);
    expect(guestAdapter).toBeInstanceOf(LocalStorageAdapter);
  });

  it('saves and retrieves transactions headlessly without network requests', async () => {
    const adapter = new LocalStorageAdapter();
    const testTx: Transaction = {
      id: 'tx_test_1',
      user_id: 'user_local_123',
      type: 'expense',
      amount: 150,
      description: 'ข้าวผัดกะเพรา',
      category_id: 'cat_food',
      transaction_date: '2026-09-21',
      is_salary: false,
      is_thai_chuay_thai: true,
      thai_chuay_thai_discount: 90,
      net_amount: 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await adapter.saveTransaction(testTx);
    expect(saved.id).toBe('tx_test_1');

    const list = await adapter.getTransactions('user_local_123');
    expect(list.length).toBe(1);
    expect(list[0].description).toBe('ข้าวผัดกะเพรา');
    expect(list[0].net_amount).toBe(60);
  });

  it('saves and retrieves tax config headlessly', async () => {
    const adapter = new LocalStorageAdapter();
    const testConfig: TaxConfig = {
      id: 'tax_cfg_1',
      user_id: 'user_local_123',
      tax_year: 2026,
      monthly_salary: 30000,
      annual_salary: 360000,
      personal_allowance: 60000,
      expense_deduction: 100000,
      social_security: 9000,
      additional_deductions: {
        social_security: 9000,
        provident_fund: 18000,
        parent_care: 30000,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await adapter.saveTaxConfig('user_local_123', testConfig);
    const retrieved = await adapter.getTaxConfig('user_local_123');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.annual_salary).toBe(360000);
    expect(retrieved?.additional_deductions.parent_care).toBe(30000);
    expect(retrieved?.additional_deductions.social_security).toBe(9000);
  });

  it('updates and deletes transactions in LocalStorageAdapter', async () => {
    const adapter = new LocalStorageAdapter();
    const testTx: Transaction = {
      id: 'tx_test_2',
      user_id: 'user_local_123',
      type: 'expense',
      amount: 200,
      description: 'ข้าวผัด',
      category_id: 'cat_food',
      transaction_date: '2026-09-21',
      is_salary: false,
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      net_amount: 200,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await adapter.saveTransaction(testTx);
    await adapter.updateTransaction('tx_test_2', {
      amount: 250,
      net_amount: 250,
      description: 'ข้าวผัดพิเศษ',
    });

    let list = await adapter.getTransactions('user_local_123');
    expect(list.find((t) => t.id === 'tx_test_2')?.amount).toBe(250);
    expect(list.find((t) => t.id === 'tx_test_2')?.description).toBe('ข้าวผัดพิเศษ');

    await adapter.deleteTransaction('tx_test_2');
    list = await adapter.getTransactions('user_local_123');
    expect(list.find((t) => t.id === 'tx_test_2')).toBeUndefined();
  });

  it('updates and deletes categories in LocalStorageAdapter', async () => {
    const adapter = new LocalStorageAdapter();
    const testCat = {
      id: 'cat_test_1',
      user_id: 'user_local_123',
      parent_id: null,
      name: 'อาหาร',
      icon: 'utensils',
      color: '#f43f5e',
      type: 'expense' as const,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    await adapter.saveCategory(testCat);
    await adapter.updateCategory('cat_test_1', { name: 'อาหารและเครื่องดื่ม' });

    let cats = await adapter.getCategories('user_local_123');
    expect(cats.find((c) => c.id === 'cat_test_1')?.name).toBe('อาหารและเครื่องดื่ม');

    await adapter.deleteCategories(['cat_test_1']);
    cats = await adapter.getCategories('user_local_123');
    expect(cats.find((c) => c.id === 'cat_test_1')).toBeUndefined();
  });
});
