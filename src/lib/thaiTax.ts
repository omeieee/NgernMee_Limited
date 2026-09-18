// src/lib/thaiTax.ts
// Thai Personal Income Tax (PIT) Calculation Engine (2025 - 2026)

import type { AdditionalDeductions, TaxBracketCalculation, TaxCalculationResult } from './types';

export interface TaxBracketDefinition {
  min: number;
  max: number; // Infinity for top bracket
  rate: number;
  label: string;
}

export const THAI_TAX_BRACKETS: TaxBracketDefinition[] = [
  { min: 0, max: 150000, rate: 0, label: '0 - 150,000 (0%)' },
  { min: 150000, max: 300000, rate: 0.05, label: '150,001 - 300,000 (5%)' },
  { min: 300000, max: 500000, rate: 0.10, label: '300,001 - 500,000 (10%)' },
  { min: 500000, max: 750000, rate: 0.15, label: '500,001 - 750,000 (15%)' },
  { min: 750000, max: 1000000, rate: 0.20, label: '750,001 - 1,000,000 (20%)' },
  { min: 1000000, max: 2000000, rate: 0.25, label: '1,000,001 - 2,000,000 (25%)' },
  { min: 2000000, max: 4000000, rate: 0.30, label: '2,000,001 - 4,000,000 (30%)' },
  { min: 4000000, max: Infinity, rate: 0.35, label: 'มากกว่า 4,000,000 (35%)' },
];

export const TAX_DEDUCTION_LIMITS = {
  PERSONAL_ALLOWANCE: 60000,
  EMPLOYMENT_EXPENSE_RATE: 0.5,
  EMPLOYMENT_EXPENSE_MAX: 100000,
  SOCIAL_SECURITY_MAX: 9000,
  LIFE_INSURANCE_MAX: 100000,
  HEALTH_INSURANCE_MAX: 25000,
  COMBINED_LIFE_HEALTH_MAX: 100000,
  RMF_MAX: 500000,
  RMF_PERCENT: 0.3,
  SSF_MAX: 200000,
  SSF_PERCENT: 0.3,
  THAI_ESG_MAX: 300000,
  THAI_ESG_PERCENT: 0.3,
  HOME_LOAN_INTEREST_MAX: 100000,
  PROVIDENT_FUND_MAX: 500000,
  RETIREMENT_COMBINED_MAX: 500000, // RMF + SSF + Provident Fund <= 500,000
};

/**
 * Calculates Thai personal income tax given gross annual taxable salary and additional deductions
 */
export function calculateTax(
  grossIncome: number,
  additional: AdditionalDeductions = {},
  taxYear: number = new Date().getFullYear()
): TaxCalculationResult {
  const sanitizedGross = Math.max(0, grossIncome);

  // 1. Standard Deductions
  const personalAllowance = TAX_DEDUCTION_LIMITS.PERSONAL_ALLOWANCE;
  const expenseDeduction = Math.min(
    sanitizedGross * TAX_DEDUCTION_LIMITS.EMPLOYMENT_EXPENSE_RATE,
    TAX_DEDUCTION_LIMITS.EMPLOYMENT_EXPENSE_MAX
  );
  const socialSecurity = Math.min(
    additional.social_security ?? TAX_DEDUCTION_LIMITS.SOCIAL_SECURITY_MAX,
    TAX_DEDUCTION_LIMITS.SOCIAL_SECURITY_MAX
  );

  const standardDeductions = personalAllowance + expenseDeduction + socialSecurity;

  // 2. Additional Deductions with statutory limits applied
  const rawLife = Math.max(0, additional.life_insurance || 0);
  const rawHealth = Math.max(0, additional.health_insurance || 0);

  // Life + Health combined limit (100,000 THB, health capped at 25,000)
  const cappedHealth = Math.min(rawHealth, TAX_DEDUCTION_LIMITS.HEALTH_INSURANCE_MAX);
  const cappedLife = Math.min(rawLife, TAX_DEDUCTION_LIMITS.LIFE_INSURANCE_MAX);
  const combinedLifeHealth = Math.min(
    cappedLife + cappedHealth,
    TAX_DEDUCTION_LIMITS.COMBINED_LIFE_HEALTH_MAX
  );

  // Retirement funds limits (each up to 30% of income, combined RMF+SSF+PVD <= 500,000)
  const maxRetirementPercentage = sanitizedGross * 0.30;
  const rawRmf = Math.min(Math.max(0, additional.rmf || 0), TAX_DEDUCTION_LIMITS.RMF_MAX, maxRetirementPercentage);
  const rawSsf = Math.min(Math.max(0, additional.ssf || 0), TAX_DEDUCTION_LIMITS.SSF_MAX, maxRetirementPercentage);
  const rawPvd = Math.min(Math.max(0, additional.provident_fund || 0), TAX_DEDUCTION_LIMITS.PROVIDENT_FUND_MAX, sanitizedGross * 0.15);

  let retirementTotal = rawRmf + rawSsf + rawPvd;
  if (retirementTotal > TAX_DEDUCTION_LIMITS.RETIREMENT_COMBINED_MAX) {
    retirementTotal = TAX_DEDUCTION_LIMITS.RETIREMENT_COMBINED_MAX;
  }

  // Thai ESG (separate fund deduction: max 300,000 or 30% of income)
  const rawThaiEsg = Math.min(
    Math.max(0, additional.thai_esg || 0),
    TAX_DEDUCTION_LIMITS.THAI_ESG_MAX,
    sanitizedGross * TAX_DEDUCTION_LIMITS.THAI_ESG_PERCENT
  );

  // Home loan interest (max 100,000)
  const cappedHomeLoan = Math.min(Math.max(0, additional.home_loan_interest || 0), TAX_DEDUCTION_LIMITS.HOME_LOAN_INTEREST_MAX);

  // Other deductions (Parent care, donations, etc.)
  const rawParent = Math.max(0, additional.parent_care || 0);
  const rawChild = Math.max(0, additional.child_care || 0);
  const rawSpouse = Math.max(0, additional.spouse_care || 0);
  const rawDonation = Math.max(0, additional.donation || 0);

  const additionalDeductionsTotal =
    combinedLifeHealth +
    retirementTotal +
    rawThaiEsg +
    cappedHomeLoan +
    rawParent +
    rawChild +
    rawSpouse +
    rawDonation;

  const totalDeductions = standardDeductions + additionalDeductionsTotal;
  const netTaxableIncome = Math.max(0, sanitizedGross - totalDeductions);

  // 3. Progressive Tax Calculation across Brackets
  let totalTax = 0;
  const brackets: TaxBracketCalculation[] = [];

  for (const bracket of THAI_TAX_BRACKETS) {
    if (netTaxableIncome <= bracket.min) {
      brackets.push({
        bracket: bracket.label,
        rate: bracket.rate,
        taxableInBracket: 0,
        taxAmount: 0,
      });
      continue;
    }

    const bracketSpan = bracket.max - bracket.min;
    const taxableInBracket = Math.min(netTaxableIncome - bracket.min, bracketSpan);
    const taxInBracket = taxableInBracket * bracket.rate;

    totalTax += taxInBracket;

    brackets.push({
      bracket: bracket.label,
      rate: bracket.rate,
      taxableInBracket,
      taxAmount: taxInBracket,
    });
  }

  const effectiveRate = sanitizedGross > 0 ? (totalTax / sanitizedGross) * 100 : 0;

  return {
    taxYear,
    grossIncome: sanitizedGross,
    standardDeductions,
    additionalDeductionsTotal,
    totalDeductions,
    netTaxableIncome,
    totalTax: Math.round(totalTax),
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    brackets,
  };
}
