import type { Transaction } from '../../../lib/types';
import type { DailyTrendPoint } from './types';

export function calculateDailyTrend(
  transactions: Transaction[],
  startDate?: string,
  endDate?: string
): DailyTrendPoint[] {
  const dailyMap: Record<
    string,
    { date: string; income: number; expense: number; discount: number }
  > = {};

  for (const tx of transactions) {
    if (startDate && tx.transaction_date < startDate) continue;
    if (endDate && tx.transaction_date > endDate) continue;

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
}

export function calculatePastDaysTrend(
  transactions: Transaction[],
  days: number = 7,
  referenceDateStr?: string
): DailyTrendPoint[] {
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const txMap = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const existing = txMap.get(t.transaction_date) || { income: 0, expense: 0 };
    if (t.type === 'income') {
      existing.income += t.net_amount;
    } else {
      existing.expense += t.net_amount;
    }
    txMap.set(t.transaction_date, existing);
  }

  const result: DailyTrendPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('th-TH', { weekday: 'short' });
    const dayStats = txMap.get(dateStr) || { income: 0, expense: 0 };

    result.push({
      date: dateStr,
      label: dayLabel,
      dayName: dayLabel,
      income: dayStats.income,
      expense: dayStats.expense,
      net: dayStats.income - dayStats.expense,
    });
  }

  return result;
}
