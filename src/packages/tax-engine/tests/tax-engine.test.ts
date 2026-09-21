import { describe, it, expect } from 'vitest';
import { calculateTax, classifyAnnualIncome } from '../index';
import type { Transaction } from '../../../lib/types';

describe('Tax Engine Deep Module', () => {
  it('classifies Section 40 income types and tax-exempt allowance accurately', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx1',
        user_id: 'u1',
        type: 'income',
        amount: 30000,
        net_amount: 30000,
        description: 'เงินเดือนบริษัท',
        category_id: null,
        transaction_date: '2026-05-25',
        is_salary: true,
        income_type: 'salary',
        is_thai_chuay_thai: false,
        thai_chuay_thai_discount: 0,
        created_at: '2026-05-25T00:00:00Z',
        updated_at: '2026-05-25T00:00:00Z',
      },
      {
        id: 'tx2',
        user_id: 'u1',
        type: 'income',
        amount: 10000,
        net_amount: 9700,
        withholding_tax_amount: 300,
        withholding_tax_rate: 3,
        description: 'รับจ้างเขียนโปรแกรมอิสระ',
        category_id: null,
        transaction_date: '2026-06-10',
        is_salary: false,
        income_type: 'freelance_part_time',
        is_thai_chuay_thai: false,
        thai_chuay_thai_discount: 0,
        created_at: '2026-06-10T00:00:00Z',
        updated_at: '2026-06-10T00:00:00Z',
      },
      {
        id: 'tx3',
        user_id: 'u1',
        type: 'income',
        amount: 5000,
        net_amount: 5000,
        description: 'แม่โอนเงินค่าขนมให้',
        category_id: null,
        transaction_date: '2026-06-15',
        is_salary: false,
        is_thai_chuay_thai: false,
        thai_chuay_thai_discount: 0,
        created_at: '2026-06-15T00:00:00Z',
        updated_at: '2026-06-15T00:00:00Z',
      },
    ];

    const classified = classifyAnnualIncome(transactions, 2026);
    expect(classified.salary40_1).toBe(30000);
    expect(classified.freelance40_2).toBe(10000);
    expect(classified.allowanceExempt).toBe(5000);
    expect(classified.withholdingTaxTotal).toBe(300);
    expect(classified.totalTaxable).toBe(40000);
    expect(classified.hasAnyIncomeTxs).toBe(true);
  });

  it('calculates progressive tax with 0% bracket up to 150,000 net income', () => {
    // Gross income: 300,000
    // Standard expense deduction: 50% max 100,000 = 100,000
    // Personal allowance: 60,000
    // Social security: 9,000
    // Total deductions = 169,000
    // Net taxable income = 300,000 - 169,000 = 131,000 (< 150,000 -> 0% bracket)
    const result = calculateTax(300000, { social_security: 9000 }, 2026);
    expect(result.netTaxableIncome).toBe(131000);
    expect(result.totalTax).toBe(0);
    expect(result.netTaxPayable).toBe(0);
  });

  it('determines withholding tax refund eligibility when WHT exceeds total tax', () => {
    // 500,000 gross with 15,000 withholding tax paid
    const result = calculateTax(
      {
        salary40_1: 500000,
        withholdingTaxTotal: 15000,
      },
      { social_security: 9000 },
      2026
    );

    // Standard deductions: 60,000 + 100,000 + 9,000 = 169,000
    // Net taxable: 331,000
    // 0-150,000 @ 0% = 0
    // 150,001-300,000 (150,000) @ 5% = 7,500
    // 300,001-331,000 (31,000) @ 10% = 3,100
    // Total tax = 10,600
    // Withholding tax = 15,000 -> Tax refund = 4,400 THB!
    expect(result.totalTax).toBe(10600);
    expect(result.totalWithholdingTax).toBe(15000);
    expect(result.taxRefund).toBe(4400);
    expect(result.isEligibleForRefund).toBe(true);
    expect(result.netTaxPayable).toBe(0);
  });
});
