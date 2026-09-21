export type { IncomeBreakdownInput, ClassifiedAnnualIncome } from './lib/types';
export type { TaxBracketDefinition } from './lib/constants';

export { THAI_TAX_BRACKETS, TAX_DEDUCTION_LIMITS } from './lib/constants';
export { classifyAnnualIncome } from './lib/classifier';
export { calculateTax } from './lib/calculator';
