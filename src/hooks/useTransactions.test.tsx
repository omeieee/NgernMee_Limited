import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../stores/useAppStore';
import {
  filterAndSortTransactions,
  paginateTransactions,
  groupTransactionsByDate,
} from './useTransactions';
import type { Transaction } from '../lib/types';

describe('useTransactions hook and store pagination', () => {
  beforeEach(() => {
    useAppStore.setState({
      transactions: [],
      isDemoMode: true,
    });
  });

  it('supports adding and holding more than 20 transactions in the store', async () => {
    const store = useAppStore.getState();

    // Add 25 transactions
    for (let i = 1; i <= 25; i++) {
      await store.addTransaction({
        type: 'expense',
        amount: 100 + i,
        description: `รายการทดสอบที่ ${i}`,
        category_id: null,
        transaction_date: `2026-09-${String(Math.min(28, i)).padStart(2, '0')}`,
        is_salary: false,
        is_thai_chuay_thai: false,
        thai_chuay_thai_discount: 0,
        net_amount: 100 + i,
      });
    }

    const currentTxs = useAppStore.getState().transactions;
    expect(currentTxs.length).toBe(25);
  });

  it('correctly filters, sorts chronologically descending, and paginates beyond 20 items', () => {
    // Generate 25 mock transactions with mixed unsorted dates
    const mockTxs: Transaction[] = Array.from({ length: 25 }, (_, i) => ({
      id: `tx_${i + 1}`,
      user_id: 'test_user',
      type: 'expense' as const,
      amount: 100 + i,
      description: `รายการที่ ${i + 1}`,
      category_id: null,
      transaction_date: `2026-09-${String(i + 1).padStart(2, '0')}`,
      is_salary: false,
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      net_amount: 100 + i,
      created_at: new Date(2026, 8, i + 1).toISOString(),
      updated_at: new Date(2026, 8, i + 1).toISOString(),
    }));

    // Filter and sort
    const sorted = filterAndSortTransactions(mockTxs, { type: 'all' });
    expect(sorted.length).toBe(25);
    // Newest date first
    expect(sorted[0].transaction_date).toBe('2026-09-25');
    expect(sorted[24].transaction_date).toBe('2026-09-01');

    // Initial page: 20 items
    const page1 = paginateTransactions(sorted, 1, 20);
    expect(page1.length).toBe(20);
    expect(page1[0].id).toBe('tx_25');

    // Page 2: all 25 items
    const page2 = paginateTransactions(sorted, 2, 20);
    expect(page2.length).toBe(25);
    expect(page2[24].id).toBe('tx_1');

    // Grouping by date
    const groups = groupTransactionsByDate(page2);
    expect(Object.keys(groups).length).toBe(25);
    expect(groups['2026-09-25'][0].id).toBe('tx_25');
  });
});
