// src/hooks/useThaiChuayThai.ts
// Hook for managing Thai Chuay Thai 60/40 co-pay quota and live calculations

import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { calculateDiscount, getDailyUsage, getMonthlyUsage, getRemainingQuota } from '../lib/thaiChuayThai';

export function useThaiChuayThai(targetDate?: string) {
  const { transactions } = useAppStore();
  const dateStr = targetDate || new Date().toISOString().slice(0, 10);

  const dailyUsed = useMemo(() => {
    return getDailyUsage(transactions, dateStr);
  }, [transactions, dateStr]);

  const monthlyUsed = useMemo(() => {
    return getMonthlyUsage(transactions, dateStr);
  }, [transactions, dateStr]);

  const quota = useMemo(() => {
    return getRemainingQuota(dailyUsed, monthlyUsed);
  }, [dailyUsed, monthlyUsed]);

  const calculateForExpense = (amount: number) => {
    return calculateDiscount(amount, dailyUsed, monthlyUsed);
  };

  return {
    quota,
    dailyUsed,
    monthlyUsed,
    calculateForExpense,
  };
}
