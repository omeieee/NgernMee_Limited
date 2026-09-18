-- 002_categories.sql
-- Create hierarchical categories table with self-referencing parent_id

create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  parent_id uuid references public.categories(id) on delete cascade,
  name text not null,
  icon text default 'circle',
  color text default '#10b981',
  type text not null check (type in ('income', 'expense')),
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

-- Indexes for efficient lookups and hierarchy traversal
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_categories_type on public.categories(type);

alter table public.categories enable row level security;
