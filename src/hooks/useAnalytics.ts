import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useCategories } from './useCategories';
import {
  calculatePeriodSummary,
  calculateDailyTrend,
  calculateCategorySpending,
  calculateCashflowRunway,
  analyzeIncomeStreams,
} from '../packages/financial-intelligence';
import type { Transaction } from '../lib/types';

export type TimePeriod = 'this_month' | 'last_month' | 'this_year' | 'all' | 'custom';

export function useAnalytics(
  period: TimePeriod = 'this_month',
  customStart?: string,
  customEnd?: string
) {
  const { transactions, taxConfig } = useAppStore();
  const { categoriesMap, getCategoryPathString } = useCategories();

  // Determine active date range
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const pad = (n: number) => String(n).padStart(2, '0');

    if (period === 'this_month') {
      const start = `${year}-${pad(month + 1)}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
      return { startDate: start, endDate: end };
    }

    if (period === 'last_month') {
      const prevMonthYear = month === 0 ? year - 1 : year;
      const prevMonth = month === 0 ? 12 : month;
      const start = `${prevMonthYear}-${pad(prevMonth)}-01`;
      const lastDay = new Date(prevMonthYear, prevMonth, 0).getDate();
      const end = `${prevMonthYear}-${pad(prevMonth)}-${pad(lastDay)}`;
      return { startDate: start, endDate: end };
    }

    if (period === 'this_year') {
      return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
    }

    if (period === 'custom' && customStart && customEnd) {
      return { startDate: customStart, endDate: customEnd };
    }

    return { startDate: '2000-01-01', endDate: '2099-12-31' };
  }, [period, customStart, customEnd]);

  // Transactions within selected date range
  const periodTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => tx.transaction_date >= startDate && tx.transaction_date <= endDate
    );
  }, [transactions, startDate, endDate]);

  // Summary Metrics (Income, Expense, Net, Thai Chuay Thai savings)
  const summary = useMemo(() => {
    return calculatePeriodSummary(periodTransactions);
  }, [periodTransactions]);

  // Income vs Expense trend by date
  const trendData = useMemo(() => {
    return calculateDailyTrend(periodTransactions);
  }, [periodTransactions]);

  // Top spending categories
  const categorySpending = useMemo(() => {
    return calculateCategorySpending(periodTransactions, categoriesMap);
  }, [periodTransactions, categoriesMap]);

  // Frequent purchase items
  const frequentItems = useMemo(() => {
    const itemMap = new Map<
      string,
      { description: string; count: number; totalAmount: number; avgAmount: number }
    >();

    for (const tx of periodTransactions) {
      if (tx.type !== 'expense') continue;
      const key = tx.description.trim().toLowerCase();
      const existing = itemMap.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalAmount += tx.net_amount;
      } else {
        itemMap.set(key, {
          description: tx.description.trim(),
          count: 1,
          totalAmount: tx.net_amount,
          avgAmount: tx.net_amount,
        });
      }
    }

    return Array.from(itemMap.values())
      .map((item) => ({
        ...item,
        avgAmount: Math.round((item.totalAmount / item.count) * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [periodTransactions]);

  // Multi-stream income analysis for the period
  const incomeAnalysis = useMemo(() => {
    return analyzeIncomeStreams(periodTransactions);
  }, [periodTransactions]);

  // Cashflow runway calculation based on current liquidity and baseline needs
  const runway = useMemo(() => {
    return calculateCashflowRunway(transactions, categoriesMap);
  }, [transactions, categoriesMap]);

  // Tax calculation memoized with full multi-stream support from app store
  const { getTaxCalculation } = useAppStore();
  const taxCalculation = useMemo(() => {
    return getTaxCalculation();
  }, [getTaxCalculation, transactions, taxConfig]);

  return {
    startDate,
    endDate,
    summary,
    trendData,
    categorySpending,
    frequentItems,
    incomeAnalysis,
    runway,
    taxCalculation,
    transactionCount: periodTransactions.length,
  };
}
