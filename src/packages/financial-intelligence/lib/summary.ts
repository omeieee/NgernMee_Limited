import type { Category, Transaction } from '../../../lib/types';
import type { CategorySpendingSummary, PeriodSummary } from './types';

export function calculatePeriodSummary(transactions: Transaction[]): PeriodSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalThaiChuayThaiDiscount = 0;
  let totalFullExpenseBeforeSubsidy = 0;
  let salaryIncome = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.net_amount;
      if (tx.is_salary || tx.income_type === 'salary') {
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
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 1000) / 10 : 0;

  return {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    totalThaiChuayThaiDiscount,
    totalFullExpenseBeforeSubsidy,
    salaryIncome,
    transactionCount: transactions.length,
  };
}

export function calculateCategorySpending(
  transactions: Transaction[],
  categoriesMap: Map<string, Category>
): CategorySpendingSummary[] {
  const expenseTxs = transactions.filter((t) => t.type === 'expense');
  const catTotals = new Map<string, { amount: number; count: number }>();
  let grandTotal = 0;

  for (const tx of expenseTxs) {
    const catId = tx.category_id || 'uncategorized';
    const current = catTotals.get(catId) || { amount: 0, count: 0 };
    catTotals.set(catId, {
      amount: current.amount + tx.net_amount,
      count: current.count + 1,
    });
    grandTotal += tx.net_amount;
  }

  return Array.from(catTotals.entries())
    .map(([catId, val]) => {
      const cat = catId !== 'uncategorized' ? categoriesMap.get(catId) : null;
      return {
        categoryId: catId !== 'uncategorized' ? catId : null,
        name: cat?.name || 'หมวดหมู่อื่นๆ',
        amount: val.amount,
        percentage: grandTotal > 0 ? Math.round((val.amount / grandTotal) * 1000) / 10 : 0,
        color: cat?.color || '#94a3b8',
        icon: cat?.icon || 'help-circle',
        txCount: val.count,
        count: val.count,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}
