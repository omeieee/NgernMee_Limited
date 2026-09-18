-- 003_transactions.sql
-- Create transactions table with Thai Chuay Thai 60/40 and salary tracking fields

create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount >= 0),
  description text not null,
  transaction_date date not null default current_date,
  is_salary boolean default false,
  is_thai_chuay_thai boolean default false,
  thai_chuay_thai_discount numeric(12, 2) default 0.00,
  net_amount numeric(12, 2) not null check (net_amount >= 0),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Performance indexes for date range queries, analytics, and category grouping
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_category_id on public.transactions(category_id);
create index if not exists idx_transactions_date on public.transactions(transaction_date desc);
create index if not exists idx_transactions_user_date on public.transactions(user_id, transaction_date desc);
create index if not exists idx_transactions_thai_chuay_thai on public.transactions(user_id, is_thai_chuay_thai, transaction_date);

alter table public.transactions enable row level security;
