// src/lib/types.ts
// Comprehensive TypeScript interfaces for NgernMee Limited

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  type: TransactionType;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  children?: Category[]; // Recursive tree
}

export interface TransactionMetadata {
  notes?: string;
  tags?: string[];
  location?: string;
  attachment_url?: string;
  [key: string]: unknown;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string; // YYYY-MM-DD
  is_salary: boolean;
  is_thai_chuay_thai: boolean;
  thai_chuay_thai_discount: number;
  net_amount: number;
  metadata?: TransactionMetadata;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface AdditionalDeductions {
  life_insurance?: number; // เบี้ยประกันชีวิต (max 100,000)
  health_insurance?: number; // เบี้ยประกันสุขภาพ (max 25,000, รวมชีวิตไม่เกิน 100,000)
  rmf?: number; // กองทุน RMF (max 500,000 หรือ 30% ของเงินได้)
  ssf?: number; // กองทุน SSF (max 200,000 หรือ 30% ของเงินได้)
  thai_esg?: number; // กองทุน Thai ESG (max 300,000 หรือ 30% ของเงินได้)
  home_loan_interest?: number; // ดอกเบี้ยกู้ซื้อบ้าน (max 100,000)
  provident_fund?: number; // กองทุนสำรองเลี้ยงชีพ (max 15% หรือ 500,000)
  parent_care?: number; // ค่าลดหย่อนบิดามารดา (30,000 / คน)
  spouse_care?: number; // ค่าลดหย่อนคู่สมรส (60,000)
  child_care?: number; // ค่าลดหย่อนบุตร (30,000 - 60,000)
  donation?: number; // เงินบริจาคทั่วไป / การศึกษา (ตามเงื่อนไข)
  [key: string]: number | undefined;
}

export interface TaxConfig {
  id: string;
  user_id: string;
  tax_year: number;
  monthly_salary: number;
  annual_salary: number;
  personal_allowance: number; // default 60,000
  expense_deduction: number; // default 100,000 (50% max 100k)
  social_security: number; // default 9,000
  additional_deductions: AdditionalDeductions;
  created_at: string;
  updated_at: string;
}

export interface TaxBracketCalculation {
  bracket: string;
  rate: number;
  taxableInBracket: number;
  taxAmount: number;
}

export interface TaxCalculationResult {
  taxYear: number;
  grossIncome: number;
  standardDeductions: number;
  additionalDeductionsTotal: number;
  totalDeductions: number;
  netTaxableIncome: number;
  totalTax: number;
  effectiveRate: number;
  brackets: TaxBracketCalculation[];
}

export interface ThaiChuayThaiQuota {
  dailyCap: number; // 200 THB
  monthlyCap: number; // 1,000 THB
  dailyUsed: number;
  monthlyUsed: number;
  dailyRemaining: number;
  monthlyRemaining: number;
  eligibleDiscount: number;
  effectiveDiscount: number;
  effectiveNet: number;
}
