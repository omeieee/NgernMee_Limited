import type {
  AdditionalDeductions,
  TaxBracketCalculation,
  TaxCalculationResult,
} from '../../../lib/types';
import { TAX_DEDUCTION_LIMITS, THAI_TAX_BRACKETS } from './constants';
import type { IncomeBreakdownInput } from './types';

/**
 * Calculates Thai personal income tax given gross annual taxable income (or breakdown) and additional deductions
 */
export function calculateTax(
  incomeInput: number | IncomeBreakdownInput,
  additional: AdditionalDeductions = {},
  taxYear: number = new Date().getFullYear(),
  explicitWithholdingTax: number = 0
): TaxCalculationResult {
  let salary40_1 = 0;
  let freelance40_2 = 0;
  let exemptIncome = 0;
  let otherTaxable = 0;
  let withholdingTax = explicitWithholdingTax;

  if (typeof incomeInput === 'number') {
    salary40_1 = Math.max(0, incomeInput);
  } else {
    salary40_1 = Math.max(0, incomeInput.salary40_1 || 0);
    freelance40_2 = Math.max(0, incomeInput.freelance40_2 || 0);
    exemptIncome = Math.max(
      0,
      (incomeInput.allowanceExempt || 0) + (incomeInput.scholarshipExempt || 0)
    );
    otherTaxable = Math.max(0, incomeInput.otherTaxable || 0);
    withholdingTax = Math.max(0, incomeInput.withholdingTaxTotal ?? explicitWithholdingTax);
  }

  const combined40_1_and_40_2 = salary40_1 + freelance40_2;
  const sanitizedGross = combined40_1_and_40_2 + otherTaxable;
  const totalIncomeAllSources = sanitizedGross + exemptIncome;

  // 1. Standard Deductions
  const personalAllowance = TAX_DEDUCTION_LIMITS.PERSONAL_ALLOWANCE;
  const expenseDeduction = Math.min(
    combined40_1_and_40_2 * TAX_DEDUCTION_LIMITS.EMPLOYMENT_EXPENSE_RATE,
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

  const effectiveHealth = Math.min(rawHealth, TAX_DEDUCTION_LIMITS.HEALTH_INSURANCE_MAX);
  const effectiveLife = Math.min(rawLife, TAX_DEDUCTION_LIMITS.LIFE_INSURANCE_MAX);
  const combinedLifeHealth = Math.min(
    effectiveLife + effectiveHealth,
    TAX_DEDUCTION_LIMITS.COMBINED_LIFE_HEALTH_MAX
  );

  // Retirement Funds: Combined cap of 500,000 THB
  const maxRetirementByIncome = sanitizedGross * 0.3;
  const rawRmf = Math.max(0, additional.rmf || 0);
  const rawSsf = Math.max(0, additional.ssf || 0);
  const rawPvd = Math.max(0, additional.provident_fund || 0);

  const effectiveRmf = Math.min(
    rawRmf,
    Math.min(TAX_DEDUCTION_LIMITS.RMF_MAX, maxRetirementByIncome)
  );
  const effectiveSsf = Math.min(
    rawSsf,
    Math.min(TAX_DEDUCTION_LIMITS.SSF_MAX, maxRetirementByIncome)
  );
  const effectivePvd = Math.min(
    rawPvd,
    Math.min(TAX_DEDUCTION_LIMITS.PROVIDENT_FUND_MAX, sanitizedGross * 0.15)
  );

  const totalRetirementRequested = effectiveRmf + effectiveSsf + effectivePvd;
  const scaleRatio =
    totalRetirementRequested > TAX_DEDUCTION_LIMITS.RETIREMENT_COMBINED_MAX
      ? TAX_DEDUCTION_LIMITS.RETIREMENT_COMBINED_MAX / totalRetirementRequested
      : 1;

  const finalRmf = Math.round(effectiveRmf * scaleRatio);
  const finalSsf = Math.round(effectiveSsf * scaleRatio);
  const finalPvd = Math.round(effectivePvd * scaleRatio);

  const rawThaiEsg = Math.max(0, additional.thai_esg || 0);
  const effectiveThaiEsg = Math.min(
    rawThaiEsg,
    Math.min(TAX_DEDUCTION_LIMITS.THAI_ESG_MAX, maxRetirementByIncome)
  );

  const homeLoan = Math.min(
    Math.max(0, additional.home_loan_interest || 0),
    TAX_DEDUCTION_LIMITS.HOME_LOAN_INTEREST_MAX
  );
  const parentCare = Math.max(0, additional.parent_care || 0);
  const spouseCare = Math.max(0, additional.spouse_care || 0);
  const childCare = Math.max(0, additional.child_care || 0);
  const donation = Math.max(0, additional.donation || 0);

  const additionalDeductionsTotal =
    combinedLifeHealth +
    finalRmf +
    finalSsf +
    finalPvd +
    effectiveThaiEsg +
    homeLoan +
    parentCare +
    spouseCare +
    childCare +
    donation;

  const totalDeductions = standardDeductions + additionalDeductionsTotal;
  const netTaxableIncome = Math.max(0, sanitizedGross - totalDeductions);

  // 3. Progressive Tax Bracket Calculation
  const brackets: TaxBracketCalculation[] = [];
  let remainingTaxable = netTaxableIncome;
  let totalTax = 0;

  for (const b of THAI_TAX_BRACKETS) {
    const bracketSize = b.max === Infinity ? Infinity : b.max - b.min;
    let taxableInBracket = 0;

    if (remainingTaxable > 0) {
      taxableInBracket = Math.min(remainingTaxable, bracketSize);
      remainingTaxable -= taxableInBracket;
    }

    const taxAmount = Math.round(taxableInBracket * b.rate);
    totalTax += taxAmount;

    brackets.push({
      bracket: b.label,
      rate: b.rate,
      taxableInBracket,
      taxAmount,
    });
  }

  const effectiveRate =
    sanitizedGross > 0 ? Math.round((totalTax / sanitizedGross) * 1000) / 10 : 0;
  const netTaxPayable = Math.max(0, totalTax - withholdingTax);
  const taxRefund = Math.max(0, withholdingTax - totalTax);
  const isEligibleForRefund = taxRefund > 0;

  return {
    taxYear,
    grossIncome: sanitizedGross,
    taxableSalary40_1: salary40_1,
    taxableFreelance40_2: freelance40_2,
    exemptIncome,
    totalIncomeAllSources,
    standardDeductions,
    additionalDeductionsTotal,
    totalDeductions,
    netTaxableIncome,
    totalTax,
    effectiveRate,
    brackets,
    totalWithholdingTax: withholdingTax,
    netTaxPayable,
    taxRefund,
    isEligibleForRefund,
  };
}
