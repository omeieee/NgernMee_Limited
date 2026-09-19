// src/hooks/useTaxCalculation.ts
// Hook for managing Thai PIT configuration, auto-pulling salary, and live calculation

import { useMemo, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { calculateTax, TAX_DEDUCTION_LIMITS } from '../lib/thaiTax';
import type { AdditionalDeductions, TaxConfig } from '../lib/types';

export function useTaxCalculation() {
  const { taxConfig, updateTaxConfig, transactions } = useAppStore();
  const [useAutoSalary, setUseAutoSalary] = useState(true);

  // Compute multi-stream income for the tax year
  const incomeStats = useMemo(() => {
    const yearStr = String(taxConfig.tax_year);
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
        freelance40_2 += tx.gross_amount || (tx.net_amount + wht);
      } else if (tx.income_type === 'allowance') {
        allowanceExempt += tx.net_amount;
      } else if (tx.income_type === 'scholarship') {
        scholarshipExempt += tx.net_amount;
      } else if (tx.income_type === 'salary' || tx.is_salary) {
        salary40_1 += tx.gross_amount || tx.amount;
      } else {
        const desc = tx.description.toLowerCase();
        if (desc.includes('แม่') || desc.includes('พ่อ') || desc.includes('ค่าขนม') || desc.includes('ครอบครัว')) {
          allowanceExempt += tx.net_amount;
        } else if (desc.includes('พาร์ทไทม์') || desc.includes('ฟรีแลนซ์') || desc.includes('สอนพิเศษ')) {
          freelance40_2 += tx.gross_amount || (tx.net_amount + wht);
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
  }, [transactions, taxConfig.tax_year]);

  // Actual annual income inputs used for calculation
  const calculation = useMemo(() => {
    if (useAutoSalary && incomeStats.hasAnyIncomeTxs) {
      return calculateTax(
        {
          salary40_1: incomeStats.salary40_1,
          freelance40_2: incomeStats.freelance40_2,
          allowanceExempt: incomeStats.allowanceExempt,
          scholarshipExempt: incomeStats.scholarshipExempt,
          otherTaxable: incomeStats.otherTaxable,
          withholdingTaxTotal: incomeStats.withholdingTaxTotal,
        },
        taxConfig.additional_deductions,
        taxConfig.tax_year
      );
    }

    // Manual or fixed fallback
    return calculateTax(
      {
        salary40_1: taxConfig.annual_salary,
        withholdingTaxTotal: incomeStats.withholdingTaxTotal,
      },
      taxConfig.additional_deductions,
      taxConfig.tax_year
    );
  }, [useAutoSalary, incomeStats, taxConfig.annual_salary, taxConfig.additional_deductions, taxConfig.tax_year]);

  const grossIncome = calculation.grossIncome;
  const transactionSalaryTotal = incomeStats.salary40_1;

  const updateAdditionalDeduction = async (key: keyof AdditionalDeductions, value: number) => {
    const updated = {
      ...taxConfig.additional_deductions,
      [key]: Math.max(0, value),
    };
    await updateTaxConfig({ additional_deductions: updated });
  };

  const updateSalary = async (monthly: number) => {
    await updateTaxConfig({
      monthly_salary: monthly,
      annual_salary: monthly * 12,
    });
  };

  // Potential tax savings suggestions or refund alerts
  const taxSavingTips = useMemo(() => {
    const tips: { title: string; desc: string; maxDeductible?: number; isRefund?: boolean }[] = [];

    // Tax Refund Tip for students / part-timers
    if (calculation.isEligibleForRefund && calculation.taxRefund > 0) {
      tips.push({
        title: '🎉 สิทธิขอคืนเงินภาษีหัก ณ ที่จ่าย',
        desc: `คุณถูกหักภาษี ณ ที่จ่ายไว้ ฿${calculation.totalWithholdingTax.toLocaleString()} ในขณะที่ภาษีที่ต้องชำระจริงคือ ฿${calculation.totalTax.toLocaleString()} คุณสามารถยื่นแบบ ภ.ง.ด.90 ที่ rd.go.th เพื่อขอรับเงินภาษีคืนได้ ฿${calculation.taxRefund.toLocaleString()} บาท เข้าบัญชีพร้อมเพย์`,
        isRefund: true,
      });
    }

    const currentThaiEsg = taxConfig.additional_deductions.thai_esg || 0;
    const maxThaiEsg = Math.min(TAX_DEDUCTION_LIMITS.THAI_ESG_MAX, grossIncome * TAX_DEDUCTION_LIMITS.THAI_ESG_PERCENT);
    const esgRemaining = Math.max(0, maxThaiEsg - currentThaiEsg);

    if (esgRemaining > 0 && calculation.totalTax > 0) {
      tips.push({
        title: 'ลงทุนในกองทุน Thai ESG',
        desc: `คุณยังสามารถลงทุนเพิ่มได้อีก ฿${esgRemaining.toLocaleString()} เพื่อช่วยลดหย่อนภาษีเพิ่มเติมในขั้นภาษีสูงสุดของคุณ`,
        maxDeductible: esgRemaining,
      });
    }

    const currentRmf = taxConfig.additional_deductions.rmf || 0;
    const maxRmf = Math.min(TAX_DEDUCTION_LIMITS.RMF_MAX, grossIncome * TAX_DEDUCTION_LIMITS.RMF_PERCENT);
    const rmfRemaining = Math.max(0, maxRmf - currentRmf);

    if (rmfRemaining > 0 && calculation.totalTax > 0) {
      tips.push({
        title: 'ออมเพื่อการเกษียณด้วย RMF',
        desc: `คุณยังมีโควตาลดหย่อน RMF คงเหลือ ฿${rmfRemaining.toLocaleString()} สำหรับวางแผนการเงินระยะยาว`,
        maxDeductible: rmfRemaining,
      });
    }

    return tips;
  }, [calculation, grossIncome, taxConfig.additional_deductions]);

  return {
    taxConfig,
    grossIncome,
    transactionSalaryTotal,
    incomeStats,
    useAutoSalary,
    setUseAutoSalary,
    calculation,
    taxSavingTips,
    updateSalary,
    updateAdditionalDeduction,
    updateTaxConfig,
  };
}
