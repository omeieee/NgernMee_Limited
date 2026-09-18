-- 005_rls_policies.sql
-- Configure Row Level Security (RLS) policies ensuring complete data isolation between users

-- 1. Profiles policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Categories policies
drop policy if exists "Users can view own categories" on public.categories;
create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own categories" on public.categories;
create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own categories" on public.categories;
create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own categories" on public.categories;
create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- 3. Transactions policies
drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own transactions" on public.transactions;
create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own transactions" on public.transactions;
create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own transactions" on public.transactions;
create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- 4. Tax configs policies
drop policy if exists "Users can view own tax config" on public.tax_configs;
create policy "Users can view own tax config"
  on public.tax_configs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own tax config" on public.tax_configs;
create policy "Users can insert own tax config"
  on public.tax_configs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own tax config" on public.tax_configs;
create policy "Users can update own tax config"
  on public.tax_configs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own tax config" on public.tax_configs;
create policy "Users can delete own tax config"
  on public.tax_configs for delete
  using (auth.uid() = user_id);
