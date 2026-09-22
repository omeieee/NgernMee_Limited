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

  describe('transaction deletion scenarios and edge cases', () => {
    it('successfully deletes an existing transaction and updates store state', async () => {
      const store = useAppStore.getState();

      const created = await store.addTransaction({
        type: 'expense',
        amount: 150,
        description: 'ข้าวกะเพราหมูกรอบ',
        category_id: null,
        transaction_date: '2026-09-22',
        is_salary: false,
        is_thai_chuay_thai: false,
        thai_chuay_thai_discount: 0,
        net_amount: 150,
      });

      expect(useAppStore.getState().transactions.some((t) => t.id === created.id)).toBe(true);

      // Execute delete
      await store.deleteTransaction(created.id);

      // Verify removed from store
      const remaining = useAppStore.getState().transactions;
      expect(remaining.some((t) => t.id === created.id)).toBe(false);
    });

    it('restores Thai Chuay Thai 60/40 quota when a co-pay transaction is deleted', async () => {
      const store = useAppStore.getState();
      const targetDate = '2026-09-22';

      // Check initial quota (daily 200, monthly 1000)
      const initialQuota = store.getThaiChuayThaiStatus(targetDate);
      expect(initialQuota.dailyRemaining).toBe(200);

      // Add a Co-Pay transaction with ฿120 discount (gov pays 120, user pays 80)
      const coPayTx = await store.addTransaction({
        type: 'expense',
        amount: 200,
        description: 'ซื้อของซูเปอร์มาร์เก็ต ร่วมโครงการ 60/40',
        category_id: null,
        transaction_date: targetDate,
        is_salary: false,
        is_thai_chuay_thai: true,
        thai_chuay_thai_discount: 120,
        net_amount: 80,
      });

      // Verify quota decreased
      const quotaAfterAdd = store.getThaiChuayThaiStatus(targetDate);
      expect(quotaAfterAdd.dailyUsed).toBe(120);
      expect(quotaAfterAdd.dailyRemaining).toBe(80);

      // Delete the Co-Pay transaction
      await store.deleteTransaction(coPayTx.id);

      // Verify quota is restored back to 200
      const quotaAfterDelete = store.getThaiChuayThaiStatus(targetDate);
      expect(quotaAfterDelete.dailyUsed).toBe(0);
      expect(quotaAfterDelete.dailyRemaining).toBe(200);
      expect(quotaAfterDelete.monthlyRemaining).toBe(1000);
    });

    it('handles non-existent transaction IDs gracefully without crashing or modifying other items', async () => {
      const store = useAppStore.getState();

      const tx1 = await store.addTransaction({
        type: 'expense',
        amount: 50,
        description: 'กาแฟดำ',
        category_id: null,
        transaction_date: '2026-09-22',
        is_salary: false,
        is_thai_chuay_thai: false,
        thai_chuay_thai_discount: 0,
        net_amount: 50,
      });

      const initialCount = useAppStore.getState().transactions.length;

      // Delete non-existent ID
      await expect(store.deleteTransaction('non_existent_tx_999999')).resolves.not.toThrow();

      // Ensure existing transaction is intact
      const afterTxs = useAppStore.getState().transactions;
      expect(afterTxs.length).toBe(initialCount);
      expect(afterTxs.find((t) => t.id === tx1.id)?.description).toBe('กาแฟดำ');
    });

    it('handles batch sequential deletions until the ledger is completely empty', async () => {
      const store = useAppStore.getState();

      const createdIds: string[] = [];
      for (let i = 1; i <= 5; i++) {
        const tx = await store.addTransaction({
          type: 'income',
          amount: 1000 * i,
          description: `งานพิเศษ ${i}`,
          category_id: null,
          transaction_date: '2026-09-22',
          is_salary: false,
          is_thai_chuay_thai: false,
          thai_chuay_thai_discount: 0,
          net_amount: 1000 * i,
        });
        createdIds.push(tx.id);
      }

      expect(useAppStore.getState().transactions.length).toBe(5);

      // Delete all created items one by one
      for (const id of createdIds) {
        await store.deleteTransaction(id);
      }

      expect(useAppStore.getState().transactions.length).toBe(0);
    });
  });
});
