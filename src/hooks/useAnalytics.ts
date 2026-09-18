// src/hooks/useAnalytics.ts
// Financial analytics, aggregations, and trend calculation hook

import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useCategories } from './useCategories';
import { calculateTax } from '../lib/thaiTax';
import type { Transaction } from '../lib/types';

export type TimePeriod = 'this_month' | 'last_month' | 'this_year' | 'all' | 'custom';

export function useAnalytics(period: TimePeriod = 'this_month', customStart?: string, customEnd?: string) {
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
    let totalIncome = 0;
    let totalExpense = 0;
    let totalThaiChuayThaiDiscount = 0;
    let totalFullExpenseBeforeSubsidy = 0;
    let salaryIncome = 0;

    for (const tx of periodTransactions) {
      if (tx.type === 'income') {
        totalIncome += tx.net_amount;
        if (tx.is_salary) {
          salaryIncome += tx.net_amount;
        }
      } else {
        totalExpense += tx.net_amount;
        totalFullExpenseBeforeSubsidy += tx.amount;
        if (tx.is_thai_chuay_thai) {
          totalThaiChuayThaiDiscount += tx.thai_chuay_thai_discount || 0;
        }
      }
    }

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate: Math.round(savingsRate * 10) / 10,
      totalThaiChuayThaiDiscount,
      totalFullExpenseBeforeSubsidy,
      salaryIncome,
    };
  }, [periodTransactions]);

  // Income vs Expense trend by date
  const trendData = useMemo(() => {
    const dailyMap: Record<string, { date: string; income: number; expense: number; discount: number }> = {};

    for (const tx of periodTransactions) {
      if (!dailyMap[tx.transaction_date]) {
        dailyMap[tx.transaction_date] = {
          date: tx.transaction_date,
          income: 0,
          expense: 0,
          discount: 0,
        };
      }

      if (tx.type === 'income') {
        dailyMap[tx.transaction_date].income += tx.net_amount;
      } else {
        dailyMap[tx.transaction_date].expense += tx.net_amount;
        if (tx.is_thai_chuay_thai) {
          dailyMap[tx.transaction_date].discount += tx.thai_chuay_thai_discount || 0;
        }
      }
    }

    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [periodTransactions]);

  // Top spending categories
  const categorySpending = useMemo(() => {
    const map = new Map<string, { id: string | null; name: string; color: string; amount: number; count: number }>();
    const expenseTxs = periodTransactions.filter((tx) => tx.type === 'expense');

    for (const tx of expenseTxs) {
      const catId = tx.category_id || 'null';
      const cat = tx.category_id ? categoriesMap.get(tx.category_id) : null;
      const catName = cat ? cat.name : 'อื่นๆ (ไม่ระบุ)';
      const catColor = cat?.color || '#64748b';

      const existing = map.get(catId);
      if (existing) {
        existing.amount += tx.net_amount;
        existing.count += 1;
      } else {
        map.set(catId, {
          id: tx.category_id,
          name: catName,
          color: catColor,
          amount: tx.net_amount,
          count: 1,
        });
      }
    }

    const totalExp = summary.totalExpense || 1;
    return Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .map((item) => ({
        ...item,
        percentage: Math.round((item.amount / totalExp) * 1000) / 10,
      }));
  }, [periodTransactions, categoriesMap, summary.totalExpense]);

  // Frequent purchase items
  const frequentItems = useMemo(() => {
    const itemMap = new Map<string, { description: string; count: number; totalAmount: number; avgAmount: number }>();

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

  // Tax calculation memoized with stable state dependencies
  const taxCalculation = useMemo(() => {
    const salaryTransactionsSum = transactions
      .filter((tx) => tx.type === 'income' && tx.is_salary && tx.transaction_date.startsWith(String(taxConfig.tax_year)))
      .reduce((sum, tx) => sum + tx.amount, 0);
    const grossIncome = salaryTransactionsSum > 0 ? salaryTransactionsSum : taxConfig.annual_salary;
    return calculateTax(grossIncome, taxConfig.additional_deductions, taxConfig.tax_year);
  }, [transactions, taxConfig]);

  return {
    startDate,
    endDate,
    summary,
    trendData,
    categorySpending,
    frequentItems,
    taxCalculation,
    transactionCount: periodTransactions.length,
  };
}
