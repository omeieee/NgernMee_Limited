-- 004_tax_configs.sql
-- Create tax configurations table for storing Thai Personal Income Tax parameters per year

create table if not exists public.tax_configs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tax_year integer not null check (tax_year between 2020 and 2100),
  monthly_salary numeric(12, 2) default 0.00,
  annual_salary numeric(12, 2) default 0.00,
  personal_allowance numeric(12, 2) default 60000.00,
  expense_deduction numeric(12, 2) default 100000.00,
  social_security numeric(12, 2) default 9000.00,
  additional_deductions jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_user_tax_year unique (user_id, tax_year)
);

create index if not exists idx_tax_configs_user_year on public.tax_configs(user_id, tax_year);

alter table public.tax_configs enable row level security;
