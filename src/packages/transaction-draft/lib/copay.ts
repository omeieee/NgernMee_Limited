import { THAI_CHUAY_THAI_CONFIG } from '../../../lib/constants';
import type { ThaiChuayThaiQuota, Transaction } from '../../../lib/types';

export interface CoPayDiscountResult {
  nominalDiscount: number;
  effectiveDiscount: number;
  netAmount: number;
  isCapped: boolean;
  capReason?: 'daily' | 'monthly' | 'both';
}

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
): CoPayDiscountResult {
  if (amount <= 0) {
    return {
      nominalDiscount: 0,
      effectiveDiscount: 0,
      netAmount: 0,
      isCapped: false,
    };
  }

  const dailyRemaining = Math.max(0, THAI_CHUAY_THAI_CONFIG.DAILY_DISCOUNT_CAP - dailyUsedDiscount);
  const monthlyRemaining = Math.max(
    0,
    THAI_CHUAY_THAI_CONFIG.MONTHLY_DISCOUNT_CAP - monthlyUsedDiscount
  );

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
      (tx) => tx.is_thai_chuay_thai && tx.type === 'expense' && tx.transaction_date === dateStr
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
  dailyUsedDiscount: number = 0,
  monthlyUsedDiscount: number = 0,
  pendingAmount: number = 0
): ThaiChuayThaiQuota {
  const dailyRemaining = Math.max(0, THAI_CHUAY_THAI_CONFIG.DAILY_DISCOUNT_CAP - dailyUsedDiscount);
  const monthlyRemaining = Math.max(
    0,
    THAI_CHUAY_THAI_CONFIG.MONTHLY_DISCOUNT_CAP - monthlyUsedDiscount
  );
  const calc = calculateDiscount(pendingAmount, dailyUsedDiscount, monthlyUsedDiscount);

  return {
    dailyCap: THAI_CHUAY_THAI_CONFIG.DAILY_DISCOUNT_CAP,
    monthlyCap: THAI_CHUAY_THAI_CONFIG.MONTHLY_DISCOUNT_CAP,
    dailyUsed: dailyUsedDiscount,
    monthlyUsed: monthlyUsedDiscount,
    dailyRemaining,
    monthlyRemaining,
    eligibleDiscount: calc.nominalDiscount,
    effectiveDiscount: calc.effectiveDiscount,
    effectiveNet: calc.netAmount,
    isCapped: calc.isCapped,
    capReason: calc.capReason,
  };
}

/**
 * Evaluates Co-Pay Quota directly against a ledger history
 */
export function evaluateLedgerCoPayQuota(
  transactions: Transaction[],
  dateStr: string = new Date().toISOString().slice(0, 10),
  pendingAmount: number = 0
): ThaiChuayThaiQuota {
  const dailyUsed = getDailyUsage(transactions, dateStr);
  const monthlyUsed = getMonthlyUsage(transactions, dateStr);
  return getRemainingQuota(dailyUsed, monthlyUsed, pendingAmount);
}
