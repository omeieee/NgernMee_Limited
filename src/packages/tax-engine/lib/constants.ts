export interface TaxBracketDefinition {
  min: number;
  max: number; // Infinity for top bracket
  rate: number;
  label: string;
}

export const THAI_TAX_BRACKETS: TaxBracketDefinition[] = [
  { min: 0, max: 150000, rate: 0, label: '0 - 150,000 (0%)' },
  { min: 150000, max: 300000, rate: 0.05, label: '150,001 - 300,000 (5%)' },
  { min: 300000, max: 500000, rate: 0.1, label: '300,001 - 500,000 (10%)' },
  { min: 500000, max: 750000, rate: 0.15, label: '500,001 - 750,000 (15%)' },
  { min: 750000, max: 1000000, rate: 0.2, label: '750,001 - 1,000,000 (20%)' },
  { min: 1000000, max: 2000000, rate: 0.25, label: '1,000,001 - 2,000,000 (25%)' },
  { min: 2000000, max: 4000000, rate: 0.3, label: '2,000,001 - 4,000,000 (30%)' },
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
