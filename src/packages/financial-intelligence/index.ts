import type { Category, Transaction } from '../../lib/types';
import type { DashboardFinancialStats } from './lib/types';
import { calculatePeriodSummary, calculateCategorySpending } from './lib/summary';
import { calculateDailyTrend, calculatePastDaysTrend } from './lib/trends';
import { calculateCashflowRunway, isEssentialExpense } from './lib/runway';
import { analyzeIncomeStreams } from './lib/income';

export type {
  PeriodSummary,
  DailyTrendPoint,
  CategorySpendingSummary,
  DashboardFinancialStats,
  IncomeAnalysisResult,
} from './lib/types';

export {
  calculatePeriodSummary,
  calculateCategorySpending,
  calculateDailyTrend,
  calculatePastDaysTrend,
  calculateCashflowRunway,
  isEssentialExpense,
  analyzeIncomeStreams,
};

/**
 * High-leverage dashboard summary function.
 * Computes all today, month-to-date, sparkline, and runway metrics in a single consolidated pass.
 */
export function calculateDashboardStats(
  transactions: Transaction[],
  categoriesMap: Map<string, Category>,
  referenceDate: Date = new Date()
): DashboardFinancialStats {
  const todayStr = referenceDate.toISOString().slice(0, 10);
  const thisMonthStr = todayStr.slice(0, 7);

  let todayIncome = 0;
  let todayExpense = 0;
  let monthIncome = 0;
  let monthExpense = 0;
  let monthThaiChuayThaiSavings = 0;

  for (const t of transactions) {
    if (t.transaction_date === todayStr) {
      if (t.type === 'income') todayIncome += t.net_amount;
      else todayExpense += t.net_amount;
    }

    if (t.transaction_date.startsWith(thisMonthStr)) {
      if (t.type === 'income') {
        monthIncome += t.net_amount;
      } else {
        monthExpense += t.net_amount;
        if (t.is_thai_chuay_thai) {
          monthThaiChuayThaiSavings += t.thai_chuay_thai_discount || 0;
        }
      }
    }
  }

  const past7DaysTrend = calculatePastDaysTrend(transactions, 7, todayStr);
  const recentTransactions = transactions.slice(0, 5);
  const runway = calculateCashflowRunway(transactions, categoriesMap, referenceDate);

  return {
    todayIncome,
    todayExpense,
    monthIncome,
    monthExpense,
    monthSavings: monthIncome - monthExpense,
    monthThaiChuayThaiSavings,
    past7DaysTrend,
    recentTransactions,
    runway,
  };
}
