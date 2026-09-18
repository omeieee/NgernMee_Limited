// src/hooks/useTransactions.ts
// Hook for transactions management with filtering, date grouping, and quick selection

import { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import type { Transaction, TransactionType } from '../lib/types';

export interface TransactionFilter {
  search?: string;
  type?: 'all' | TransactionType;
  categoryId?: string | null;
  onlyThaiChuayThai?: boolean;
  startDate?: string;
  endDate?: string;
}

export function useTransactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useAppStore();
  const [filter, setFilter] = useState<TransactionFilter>({ type: 'all' });
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filtered list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filter.type && filter.type !== 'all' && tx.type !== filter.type) {
        return false;
      }

      // Thai Chuay Thai filter
      if (filter.onlyThaiChuayThai && !tx.is_thai_chuay_thai) {
        return false;
      }

      // Category filter
      if (filter.categoryId !== undefined) {
        if (filter.categoryId === null && tx.category_id !== null) return false;
        if (filter.categoryId !== null && tx.category_id !== filter.categoryId) return false;
      }

      // Search keyword (description or amount)
      if (filter.search && filter.search.trim()) {
        const query = filter.search.trim().toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesAmount = tx.amount.toString().includes(query);
        if (!matchesDesc && !matchesAmount) return false;
      }

      // Date range filter
      if (filter.startDate && tx.transaction_date < filter.startDate) return false;
      if (filter.endDate && tx.transaction_date > filter.endDate) return false;

      return true;
    });
  }, [transactions, filter]);

  // Paginated list
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, page * pageSize);
  }, [filteredTransactions, page, pageSize]);

  const hasMore = paginatedTransactions.length < filteredTransactions.length;

  // Grouped by date (YYYY-MM-DD)
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const tx of paginatedTransactions) {
      if (!groups[tx.transaction_date]) {
        groups[tx.transaction_date] = [];
      }
      groups[tx.transaction_date].push(tx);
    }
    return groups;
  }, [paginatedTransactions]);

  // Frequency-ranked distinct transactions for QuickSelectPanel
  const quickSelectItems = useMemo(() => {
    const counts = new Map<string, { tx: Transaction; count: number }>();

    for (const tx of transactions) {
      const key = `${tx.type}_${tx.category_id || 'null'}_${tx.description.trim()}_${tx.amount}_${tx.is_thai_chuay_thai}`;
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { tx, count: 1 });
      }
    }

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        ...item.tx,
        frequencyCount: item.count,
      }));
  }, [transactions]);

  return {
    transactions,
    filteredTransactions,
    groupedTransactions,
    quickSelectItems,
    filter,
    setFilter,
    page,
    setPage,
    hasMore,
    loadMore: () => setPage((p) => p + 1),
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
