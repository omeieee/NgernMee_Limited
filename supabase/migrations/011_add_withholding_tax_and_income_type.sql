-- 011_add_withholding_tax_and_income_type.sql
-- Add income classification and withholding tax fields to transactions table

alter table public.transactions
  add column if not exists income_type text check (
    income_type in ('salary', 'freelance_part_time', 'allowance', 'scholarship', 'investment', 'other')
  ),
  add column if not exists gross_amount numeric(12, 2),
  add column if not exists withholding_tax_rate numeric(5, 2) default 0.00,
  add column if not exists withholding_tax_amount numeric(12, 2) default 0.00;

-- Index on income_type for analytics queries
create index if not exists idx_transactions_income_type on public.transactions(user_id, income_type);
