import type { CashflowRunway, IncomeType, Transaction } from '../../../lib/types';

export interface IncomeSourceSummary {
  type: IncomeType;
  label: string;
  totalNet: number;
  totalGross: number;
  withholdingTaxTotal: number;
  count: number;
  percentage: number;
  isTaxable: boolean;
}

export interface PeriodSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  totalThaiChuayThaiDiscount: number;
  totalFullExpenseBeforeSubsidy: number;
  salaryIncome: number;
  transactionCount: number;
}

export interface DailyTrendPoint {
  date: string;
  label?: string;
  dayName?: string;
  income: number;
  expense: number;
  discount?: number;
  net?: number;
}

export interface CategorySpendingSummary {
  categoryId: string | null;
  name: string;
  amount: number;
  percentage: number;
  color?: string;
  icon?: string;
  txCount: number;
  count: number;
}

export interface DashboardFinancialStats {
  todayIncome: number;
  todayExpense: number;
  monthIncome: number;
  monthExpense: number;
  monthSavings: number;
  monthThaiChuayThaiSavings: number;
  past7DaysTrend: DailyTrendPoint[];
  recentTransactions: Transaction[];
  runway: CashflowRunway;
}

export interface IncomeAnalysisResult {
  sources: IncomeSourceSummary[];
  totalIncomeAll: number;
  taxableIncomeTotal: number;
  exemptIncomeTotal: number;
  withholdingTaxTotal: number;
  predictableRatio: number;
}
