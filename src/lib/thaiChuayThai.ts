// src/lib/thaiChuayThai.ts
// Calculation engine and quota tracker for Thai Chuay Thai (โครงการคนละครึ่ง / ไทยช่วยไทย 60/40)
// Delegated to deep module: src/packages/transaction-draft

export {
  calculateDiscount,
  getDailyUsage,
  getMonthlyUsage,
  getRemainingQuota,
  evaluateLedgerCoPayQuota,
} from '../packages/transaction-draft';
export type { CoPayDiscountResult } from '../packages/transaction-draft';
