// src/hooks/useTransactions.ts
// Hook for transactions management with filtering, date grouping, and quick selection

import { useState, useMemo, useCallback } from 'react';
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

export function filterAndSortTransactions(
  transactions: Transaction[],
  filter: TransactionFilter
): Transaction[] {
  const list = transactions.filter((tx) => {
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

  // Sort chronologically descending: newest transaction_date first, then newest created_at
  return list.sort((a, b) => {
    const dateDiff = b.transaction_date.localeCompare(a.transaction_date);
    if (dateDiff !== 0) return dateDiff;
    return (b.created_at || '').localeCompare(a.created_at || '');
  });
}

export function paginateTransactions(
  transactions: Transaction[],
  page: number,
  pageSize: number
): Transaction[] {
  return transactions.slice(0, page * pageSize);
}

export function groupTransactionsByDate(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    if (!groups[tx.transaction_date]) {
      groups[tx.transaction_date] = [];
    }
    groups[tx.transaction_date].push(tx);
  }
  return groups;
}

export function useTransactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useAppStore();
  const [filter, setFilterState] = useState<TransactionFilter>({ type: 'all' });
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const setFilter = useCallback(
    (updater: TransactionFilter | ((prev: TransactionFilter) => TransactionFilter)) => {
      setFilterState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        return next;
      });
      setPage(1); // Reset page to 1 whenever filters or search query change
    },
    []
  );

  // Filtered and chronologically sorted list (newest first)
  const filteredTransactions = useMemo(() => {
    return filterAndSortTransactions(transactions, filter);
  }, [transactions, filter]);

  // Paginated list
  const totalCount = filteredTransactions.length;
  const paginatedTransactions = useMemo(() => {
    return paginateTransactions(filteredTransactions, page, pageSize);
  }, [filteredTransactions, page, pageSize]);

  const displayedCount = paginatedTransactions.length;
  const hasMore = displayedCount < totalCount;

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const showAll = useCallback(() => {
    setPage(Math.max(1, Math.ceil(totalCount / pageSize)));
  }, [totalCount, pageSize]);

  // Grouped by date (YYYY-MM-DD)
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(paginatedTransactions);
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
    paginatedTransactions,
    groupedTransactions,
    quickSelectItems,
    filter,
    setFilter,
    page,
    setPage,
    pageSize,
    totalCount,
    displayedCount,
    hasMore,
    loadMore,
    showAll,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
