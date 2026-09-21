import { describe, it, expect } from 'vitest';
import {
  calculateDashboardStats,
  calculatePeriodSummary,
  calculatePastDaysTrend,
  calculateCashflowRunway,
} from '../index';
import type { Category, Transaction } from '../../../lib/types';

describe('Financial Intelligence Deep Module', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat_food',
      user_id: 'u1',
      parent_id: null,
      name: 'อาหาร',
      icon: 'utensils',
      color: '#f97316',
      type: 'expense',
      sort_order: 1,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'cat_salary',
      user_id: 'u1',
      parent_id: null,
      name: 'เงินเดือน',
      icon: 'briefcase',
      color: '#10b981',
      type: 'income',
      sort_order: 2,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    },
  ];

  const categoriesMap = new Map<string, Category>(mockCategories.map((c) => [c.id, c]));

  const mockTransactions: Transaction[] = [
    {
      id: 'tx1',
      user_id: 'u1',
      type: 'income',
      amount: 40000,
      net_amount: 40000,
      description: 'เงินเดือนประจำ',
      category_id: 'cat_salary',
      transaction_date: '2026-09-01',
      is_salary: true,
      income_type: 'salary',
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'tx2',
      user_id: 'u1',
      type: 'expense',
      amount: 100,
      net_amount: 40,
      thai_chuay_thai_discount: 60,
      description: 'ข้าวผัด',
      category_id: 'cat_food',
      transaction_date: '2026-09-21',
      is_salary: false,
      is_thai_chuay_thai: true,
      created_at: '2026-09-21T12:00:00Z',
      updated_at: '2026-09-21T12:00:00Z',
    },
    {
      id: 'tx3',
      user_id: 'u1',
      type: 'expense',
      amount: 50,
      net_amount: 50,
      thai_chuay_thai_discount: 0,
      description: 'ชานมไข่มุก',
      category_id: 'cat_food',
      transaction_date: '2026-09-21',
      is_salary: false,
      is_thai_chuay_thai: false,
      created_at: '2026-09-21T15:00:00Z',
      updated_at: '2026-09-21T15:00:00Z',
    },
  ];

  it('calculates period summary correctly', () => {
    const summary = calculatePeriodSummary(mockTransactions);
    expect(summary.totalIncome).toBe(40000);
    expect(summary.totalExpense).toBe(90);
    expect(summary.netSavings).toBe(39910);
    expect(summary.totalThaiChuayThaiDiscount).toBe(60);
    expect(summary.totalFullExpenseBeforeSubsidy).toBe(150);
    expect(summary.transactionCount).toBe(3);
  });

  it('calculates past 7 days trend accurately without gaps', () => {
    const trend = calculatePastDaysTrend(mockTransactions, 7, '2026-09-21');
    expect(trend.length).toBe(7);
    const lastDay = trend[trend.length - 1];
    expect(lastDay.date).toBe('2026-09-21');
    expect(lastDay.expense).toBe(90);
  });

  it('computes unified dashboard stats in a single pass', () => {
    const refDate = new Date('2026-09-21T10:00:00Z');
    const stats = calculateDashboardStats(mockTransactions, categoriesMap, refDate);

    expect(stats.todayIncome).toBe(0);
    expect(stats.todayExpense).toBe(90);
    expect(stats.monthIncome).toBe(40000);
    expect(stats.monthExpense).toBe(90);
    expect(stats.monthSavings).toBe(39910);
    expect(stats.monthThaiChuayThaiSavings).toBe(60);
    expect(stats.past7DaysTrend.length).toBe(7);
    expect(stats.runway.currentLiquidBalance).toBe(39910);
  });

  it('computes cashflow runway metrics correctly', () => {
    const refDate = new Date('2026-09-21T10:00:00Z');
    const runway = calculateCashflowRunway(mockTransactions, categoriesMap, refDate);

    expect(runway.currentLiquidBalance).toBe(39910);
    expect(runway.runwayDays).toBeGreaterThan(0);
    expect(runway.runwayMonths).toBeGreaterThan(0);
    expect(runway.isCriticalRunway).toBe(false);
  });
});
