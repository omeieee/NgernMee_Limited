// src/lib/thaiChuayThai.ts
// Calculation engine and quota tracker for Thai Chuay Thai (โครงการคนละครึ่ง / ไทยช่วยไทย 60/40)

import { THAI_CHUAY_THAI_CONFIG } from './constants';
import type { ThaiChuayThaiQuota, Transaction } from './types';

/**
 * Calculates Thai Chuay Thai discount and net amount for an expense
 * Formula:
 * - Nominal government copay: 60% of expense
 * - Capped by remaining daily quota (max 200 THB)
 * - Capped by remaining monthly quota (max 1,000 THB)
 * - Effective net amount = amount - effectiveDiscount
 */
export function calculateDiscount(
  amount: number,
  dailyUsedDiscount: number = 0,
  monthlyUsedDiscount: number = 0
): {
  nominalDiscount: number;
  effectiveDiscount: number;
  netAmount: number;
  isCapped: boolean;
  capReason?: 'daily' | 'monthly' | 'both';
} {
  if (amount <= 0) {
    return {
      nominalDiscount: 0,
      effectiveDiscount: 0,
      netAmount: 0,
      isCapped: false,
    };
  }

  const dailyRemaining = Math.max(0, THAI_CHUAY_THAI_CONFIG.DAILY_DISCOUNT_CAP - dailyUsedDiscount);
  const monthlyRemaining = Math.max(0, THAI_CHUAY_THAI_CONFIG.MONTHLY_DISCOUNT_CAP - monthlyUsedDiscount);

  const nominalDiscount = Math.round(amount * THAI_CHUAY_THAI_CONFIG.GOV_COPAY_RATIO * 100) / 100;
  let effectiveDiscount = nominalDiscount;
  let isCapped = false;
  let capReason: 'daily' | 'monthly' | 'both' | undefined;

  const maxAllowedByQuota = Math.min(dailyRemaining, monthlyRemaining);

  if (effectiveDiscount > maxAllowedByQuota) {
    isCapped = true;
    if (dailyRemaining < nominalDiscount && monthlyRemaining < nominalDiscount) {
      capReason = 'both';
    } else if (dailyRemaining < nominalDiscount) {
      capReason = 'daily';
    } else {
      capReason = 'monthly';
    }
    effectiveDiscount = Math.max(0, maxAllowedByQuota);
  }

  const netAmount = Math.max(0, Math.round((amount - effectiveDiscount) * 100) / 100);

  return {
    nominalDiscount,
    effectiveDiscount,
    netAmount,
    isCapped,
    capReason,
  };
}

/**
 * Computes total Thai Chuay Thai discount used on a specific day
 */
export function getDailyUsage(transactions: Transaction[], dateStr: string): number {
  return transactions
    .filter(
      (tx) =>
        tx.is_thai_chuay_thai &&
        tx.type === 'expense' &&
        tx.transaction_date === dateStr
    )
    .reduce((sum, tx) => sum + (tx.thai_chuay_thai_discount || 0), 0);
}

/**
 * Computes total Thai Chuay Thai discount used in the month of the specified date
 */
export function getMonthlyUsage(transactions: Transaction[], dateStr: string): number {
  const targetYearMonth = dateStr.slice(0, 7); // 'YYYY-MM'
  return transactions
    .filter(
      (tx) =>
        tx.is_thai_chuay_thai &&
        tx.type === 'expense' &&
        tx.transaction_date.startsWith(targetYearMonth)
    )
    .reduce((sum, tx) => sum + (tx.thai_chuay_thai_discount || 0), 0);
}

/**
 * Returns full quota status for a given daily and monthly usage
 */
export function getRemainingQuota(
  dailyUsed: number,
  monthlyUsed: number,
  pendingExpenseAmount: number = 0
): ThaiChuayThaiQuota {
  const dailyCap = THAI_CHUAY_THAI_CONFIG.DAILY_DISCOUNT_CAP;
  const monthlyCap = THAI_CHUAY_THAI_CONFIG.MONTHLY_DISCOUNT_CAP;

  const dailyRemaining = Math.max(0, dailyCap - dailyUsed);
  const monthlyRemaining = Math.max(0, monthlyCap - monthlyUsed);

  const { nominalDiscount, effectiveDiscount, netAmount } = calculateDiscount(
    pendingExpenseAmount,
    dailyUsed,
    monthlyUsed
  );

  return {
    dailyCap,
    monthlyCap,
    dailyUsed,
    monthlyUsed,
    dailyRemaining,
    monthlyRemaining,
    eligibleDiscount: nominalDiscount,
    effectiveDiscount,
    effectiveNet: pendingExpenseAmount > 0 ? netAmount : 0,
  };
}
