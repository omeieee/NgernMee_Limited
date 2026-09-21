import type { IncomeType, Transaction, TransactionType } from '../../../lib/types';

export type TransactionPayload = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export interface TransactionDraftInput {
  type: TransactionType;
  amount: number | string;
  description: string;
  category_id: string | null;
  transaction_date: string;
  is_thai_chuay_thai?: boolean;
  income_type?: IncomeType;
  has_wht?: boolean;
  wht_rate?: number;
  custom_wht_amount?: number | string | null;
}

export interface DraftAmountsCalculation {
  gross: number;
  net: number;
  discount: number;
  whtAmount: number;
  whtRate: number;
}
