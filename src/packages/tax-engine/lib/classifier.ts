import type { Transaction } from '../../../lib/types';
import type { ClassifiedAnnualIncome } from './types';

const ALLOWANCE_KEYWORDS = ['แม่', 'พ่อ', 'ค่าขนม', 'ครอบครัว', 'บ้าน'];
const FREELANCE_KEYWORDS = [
  'พาร์ทไทม์',
  'part-time',
  'ฟรีแลนซ์',
  'freelance',
  'สอนพิเศษ',
  'รับจ้าง',
];

/**
 * Classifies an array of transactions for a specific tax year into
 * Section 40 legal tax categories and identifies tax-exempt personal transfers.
 */
export function classifyAnnualIncome(
  transactions: Transaction[],
  taxYear: number = new Date().getFullYear()
): ClassifiedAnnualIncome {
  const yearStr = String(taxYear);
  const yearTxs = transactions.filter(
    (tx) => tx.type === 'income' && tx.transaction_date.startsWith(yearStr)
  );

  let salary40_1 = 0;
  let freelance40_2 = 0;
  let allowanceExempt = 0;
  let scholarshipExempt = 0;
  let otherTaxable = 0;
  let withholdingTaxTotal = 0;

  for (const tx of yearTxs) {
    const wht = tx.withholding_tax_amount || 0;
    withholdingTaxTotal += wht;

    if (tx.income_type === 'freelance_part_time') {
      freelance40_2 += tx.gross_amount || tx.net_amount + wht;
    } else if (tx.income_type === 'allowance') {
      allowanceExempt += tx.net_amount;
    } else if (tx.income_type === 'scholarship') {
      scholarshipExempt += tx.net_amount;
    } else if (tx.income_type === 'salary' || tx.is_salary) {
      salary40_1 += tx.gross_amount || tx.amount;
    } else {
      const desc = tx.description.toLowerCase();
      if (ALLOWANCE_KEYWORDS.some((kw) => desc.includes(kw))) {
        allowanceExempt += tx.net_amount;
      } else if (FREELANCE_KEYWORDS.some((kw) => desc.includes(kw))) {
        freelance40_2 += tx.gross_amount || tx.net_amount + wht;
      } else {
        otherTaxable += tx.gross_amount || tx.amount;
      }
    }
  }

  const hasAnyIncomeTxs = yearTxs.length > 0;
  const totalTaxable = salary40_1 + freelance40_2 + otherTaxable;

  return {
    salary40_1,
    freelance40_2,
    allowanceExempt,
    scholarshipExempt,
    otherTaxable,
    withholdingTaxTotal,
    hasAnyIncomeTxs,
    totalTaxable,
  };
}
