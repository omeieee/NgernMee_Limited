// src/hooks/useTaxCalculation.ts
// Hook for managing Thai PIT configuration, auto-pulling salary, and live calculation

import { useMemo, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { calculateTax, TAX_DEDUCTION_LIMITS } from '../lib/thaiTax';
import type { AdditionalDeductions, TaxConfig } from '../lib/types';

export function useTaxCalculation() {
  const { taxConfig, updateTaxConfig, transactions } = useAppStore();
  const [useAutoSalary, setUseAutoSalary] = useState(true);

  // Compute annual salary from transactions marked as `is_salary` for the tax year
  const transactionSalaryTotal = useMemo(() => {
    const yearStr = String(taxConfig.tax_year);
    return transactions
      .filter((tx) => tx.type === 'income' && tx.is_salary && tx.transaction_date.startsWith(yearStr))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, taxConfig.tax_year]);

  // Actual annual salary used for calculation
  const grossIncome = useMemo(() => {
    if (useAutoSalary && transactionSalaryTotal > 0) {
      return transactionSalaryTotal;
    }
    return taxConfig.annual_salary;
  }, [useAutoSalary, transactionSalaryTotal, taxConfig.annual_salary]);

  // Result of calculation
  const calculation = useMemo(() => {
    return calculateTax(grossIncome, taxConfig.additional_deductions, taxConfig.tax_year);
  }, [grossIncome, taxConfig.additional_deductions, taxConfig.tax_year]);

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

  // Potential tax savings suggestions (e.g. if user invests more in Thai ESG or RMF)
  const taxSavingTips = useMemo(() => {
    const tips: { title: string; desc: string; maxDeductible: number }[] = [];

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
  }, [taxConfig.additional_deductions, grossIncome, calculation.totalTax]);

  return {
    taxConfig,
    grossIncome,
    transactionSalaryTotal,
    useAutoSalary,
    setUseAutoSalary,
    calculation,
    taxSavingTips,
    updateSalary,
    updateAdditionalDeduction,
    updateTaxConfig,
  };
}
